/**
 * Main Application - Refactored & Optimized
 * Handles 50k+ files with performance optimizations
 * NEW: Dynamic Excel column mapping
 */

import React, { useState, useEffect } from 'react';
import { Upload, Settings as SettingsIcon, Play, TrendingUp, Map as MapIcon } from 'lucide-react';

// Services
import { parseExcelFile } from './services/excelParser';
import { processDocumentsBatched, groupDocuments } from './services/pdfProcessor';
import { createZipArchive, saveZipFile, generateDefaultFilename } from './services/fileWriter';
import { loadSettings, saveSettings } from './services/settingsManager';
import { normalizeRowWithCustomMappings, autoMapColumns, detectExcelColumns } from './services/columnMapper';
import * as XLSX from 'xlsx';

// Components
import { Card, Button, Badge, ProgressBar } from './components';
import ColumnMappingModal from './components/ColumnMappingModal';

// Configuration
import { APP_CONFIG } from './config/appConfig';
import { LABELS } from './config/labelConfig';

// Check if running in Electron
const isElectron = typeof window !== 'undefined' && window.electronAPI !== undefined;

export default function App() {
  // State
  const [activeStep, setActiveStep] = useState(1);
  const [excelFile, setExcelFile] = useState(null);
  const [rawExcelData, setRawExcelData] = useState([]); // Raw data before normalization
  const [excelData, setExcelData] = useState([]); // Normalized data
  const [sourceFiles, setSourceFiles] = useState({});
  const [config, setConfig] = useState(loadSettings());
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState([]);
  const [resultZip, setResultZip] = useState(null);
  const [stats, setStats] = useState({});

  // Column mapping state
  const [showMappingModal, setShowMappingModal] = useState(false);
  const [currentMappings, setCurrentMappings] = useState(null);

  // Single PDF mode (when Excel doesn't have source_file column)
  const [singlePdfMode, setSinglePdfMode] = useState(false);

  // Auto-save settings
  useEffect(() => {
    saveSettings(config);
  }, [config]);

  // Calculate stats when data changes
  const calculateStats = (data) => {
    const stats = {
      totalDocs: data.length,
      totalValue: 0,
      categories: new Set(),
      assetClasses: new Set(),
      counterparties: new Set(),
      priorities: new Map(),
      dateRange: { min: null, max: null }
    };

    data.forEach(row => {
      if (row.value && !isNaN(row.value)) {
        stats.totalValue += row.value;
      }
      if (row.type) stats.categories.add(row.type);
      if (row.asset_class) stats.assetClasses.add(row.asset_class);
      if (row.counterparty) stats.counterparties.add(row.counterparty);

      const priority = row.priority || 'normal';
      stats.priorities.set(priority, (stats.priorities.get(priority) || 0) + 1);

      const docDate = new Date(row.date);
      if (!isNaN(docDate)) {
        if (!stats.dateRange.min || docDate < stats.dateRange.min) {
          stats.dateRange.min = docDate;
        }
        if (!stats.dateRange.max || docDate > stats.dateRange.max) {
          stats.dateRange.max = docDate;
        }
      }
    });

    return stats;
  };

  // File upload handlers
  const handleExcelUpload = async () => {
    if (!isElectron) return;

    const result = await window.electronAPI.openExcelDialog();
    if (!result) return;

    try {
      // Use the enhanced Excel parser (with page range expansion!)
      const parseResult = await parseExcelFile(result.data, result.name);

      if (!parseResult.success) {
        addLog(`❌ Error: ${parseResult.error}`);
        return;
      }

      // Parse raw Excel data for column mapping
      const binaryString = atob(result.data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      const wb = XLSX.read(bytes, { type: 'array' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const rawData = XLSX.utils.sheet_to_json(ws);

      if (rawData.length === 0) {
        addLog('❌ Error: Excel file is empty');
        return;
      }

      // Store raw data (before expansion)
      setRawExcelData(rawData);
      setExcelFile({ name: result.name });

      // Show range expansion info
      if (parseResult.expandedFromRanges) {
        addLog(`📊 Page ranges detected and expanded!`);
        addLog(`   Original rows: ${parseResult.originalRowCount}`);
        addLog(`   Expanded rows: ${parseResult.rowCount}`);
        if (parseResult.rangeStats) {
          addLog(`   Ranges: ${parseResult.rangeStats.ranges}, Single pages: ${parseResult.rangeStats.singles}`);
        }
      }

      // Try auto-mapping
      const firstRow = rawData[0];
      const columns = detectExcelColumns(firstRow);
      const autoMapped = autoMapColumns(columns);

      // Check if source file is missing (single PDF mode)
      const hasSourceFile = autoMapped.sourceFile !== undefined;

      // Required fields - source_file is optional if we're in single PDF mode
      const requiredFields = hasSourceFile
        ? ['sourceFile', 'pageNumber', 'date', 'type']
        : ['pageNumber', 'date', 'type'];

      const allMapped = requiredFields.every(field => autoMapped[field]);

      if (allMapped) {
        // Auto-mapping successful, normalize data immediately
        // In single PDF mode, we'll assign the PDF filename later when PDF is uploaded
        applyMappingsAndNormalize(autoMapped, parseResult.data, !hasSourceFile);
        addLog(`✓ Loaded: ${result.name} (${parseResult.rowCount} pages) - Auto-mapped columns`);

        if (!hasSourceFile) {
          addLog(`ℹ️  Single PDF mode: Upload one PDF and it will be used for all pages`);
        }
      } else {
        // Show mapping modal for user to confirm/adjust
        setCurrentMappings(autoMapped);
        setShowMappingModal(true);
        addLog(`⚙️  Please map your Excel columns...`);
      }

    } catch (err) {
      console.error(err);
      addLog(`❌ Error parsing Excel file: ${err.message}`);
    }
  };

  // Apply mappings and normalize data
  const applyMappingsAndNormalize = (mappings, data, isSinglePdfMode = false) => {
    setSinglePdfMode(isSinglePdfMode);

    let normalizedData;

    if (isSinglePdfMode) {
      // Single PDF mode: Check if PDF already uploaded (PDF uploaded before Excel)
      const uploadedPdfs = Object.keys(sourceFiles);

      if (uploadedPdfs.length > 0) {
        // Auto-assign the first uploaded PDF to all rows
        const pdfFilename = uploadedPdfs[0];
        normalizedData = data.map(row => {
          const normalized = normalizeRowWithCustomMappings(row, mappings);
          if (!normalized.source_file) {
            normalized.source_file = pdfFilename;
          }
          return normalized;
        });
        addLog(`✓ Auto-assigned "${pdfFilename}" to all ${normalizedData.length} pages`);
      } else {
        // No PDF uploaded yet, set to __PENDING__
        normalizedData = data.map(row => {
          const normalized = normalizeRowWithCustomMappings(row, mappings);
          if (!normalized.source_file) {
            normalized.source_file = '__PENDING__';
          }
          return normalized;
        });
      }
    } else {
      // Normal mode: Filter rows without source_file
      normalizedData = data
        .map(row => normalizeRowWithCustomMappings(row, mappings))
        .filter(r => r.source_file);
    }

    setExcelData(normalizedData);
    setCurrentMappings(mappings);

    const newStats = calculateStats(normalizedData);
    setStats(newStats);
  };

  // Handle mapping confirmation from modal
  const handleMappingsConfirmed = (mappings) => {
    applyMappingsAndNormalize(mappings, rawExcelData);
    addLog(`✓ Column mapping applied (${rawExcelData.length} rows)`);
  };

  const handlePdfUpload = async () => {
    if (!isElectron) return;

    const results = await window.electronAPI.openPDFsDialog();
    if (!results || results.length === 0) return;

    const newFiles = { ...sourceFiles };
    results.forEach(file => {
      newFiles[file.name] = { name: file.name, data: file.data };
    });

    setSourceFiles(newFiles);

    // Single PDF mode: Auto-assign PDF filename to all rows with __PENDING__
    if (singlePdfMode && excelData.length > 0) {
      // Use the first uploaded PDF (in this batch or overall)
      const pdfFilename = results[0].name;

      const pendingRows = excelData.filter(row => row.source_file === '__PENDING__');

      if (pendingRows.length > 0) {
        // Update all __PENDING__ rows with the PDF filename
        const updatedData = excelData.map(row => ({
          ...row,
          source_file: row.source_file === '__PENDING__' ? pdfFilename : row.source_file
        }));
        setExcelData(updatedData);
        addLog(`✓ Single PDF mode: Auto-assigned "${pdfFilename}" to all ${pendingRows.length} pages`);
      }

      if (results.length > 1) {
        addLog(`ℹ️  Note: In single PDF mode, using "${pdfFilename}" (first PDF)`);
      }
      addLog(`✓ Added ${results.length} PDF(s)`);
    } else {
      addLog(`✓ Added ${results.length} PDF(s)`);
    }
  };

  // Process documents
  const processDocuments = async () => {
    // Validation before processing
    if (Object.keys(sourceFiles).length === 0) {
      addLog('❌ Error: No PDF files uploaded. Please upload at least one PDF file.');
      return;
    }

    if (singlePdfMode) {
      const pendingRows = excelData.filter(row => row.source_file === '__PENDING__');
      if (pendingRows.length > 0) {
        addLog('❌ Error: PDF not assigned to pages. Please upload a PDF file first.');
        return;
      }
    }

    setProcessing(true);
    setProgress(0);
    setLogs([]);

    const startTime = Date.now();
    addLog(LABELS.logs.starting);

    try {
      // Group documents
      const groups = groupDocuments(excelData, config.groupBy, sourceFiles, addLog);
      addLog(`✓ Created ${Object.keys(groups).length} group(s)`);

      // Process in batches
      const processedPDFs = await processDocumentsBatched(
        groups,
        sourceFiles,
        config,
        setProgress,
        addLog
      );

      // Create ZIP
      addLog(LABELS.logs.compressing);
      const processingTime = Date.now() - startTime;
      const zipBlob = await createZipArchive(processedPDFs, excelData, config, stats, processingTime);

      setResultZip(zipBlob);
      addLog(LABELS.logs.complete);
      setActiveStep(4);

    } catch (error) {
      addLog(`🚨 ERROR: ${error.message}`);
    } finally {
      setProcessing(false);
    }
  };

  // Download result
  const handleDownload = async () => {
    if (!resultZip) return;

    const fileName = generateDefaultFilename();
    const result = await saveZipFile(resultZip, fileName);

    if (result.success) {
      addLog(`✓ Saved: ${result.path || fileName}`);
    } else {
      addLog(`❌ Save failed: ${result.error}`);
    }
  };

  // Add log
  const addLog = (msg) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${msg}`]);
  };

  // Reset app
  const resetApp = () => {
    setActiveStep(1);
    setRawExcelData([]);
    setExcelData([]);
    setExcelFile(null);
    setSourceFiles({});
    setResultZip(null);
    setStats({});
    setLogs([]);
    setCurrentMappings(null);
    setSinglePdfMode(false);
  };

  // Calculate matched rows (handle single PDF mode with __PENDING__)
  const matchedRows = excelData.filter(row =>
    sourceFiles[row.source_file] || (singlePdfMode && row.source_file === '__PENDING__')
  ).length;

  // Render
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 p-2 rounded-lg">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-xl">{APP_CONFIG.branding.appName}</h1>
              <p className="text-xs text-slate-500">{isElectron ? 'Desktop Edition' : 'Web Edition'}</p>
            </div>
          </div>
          <Badge variant={config.marketMode === 'real-time' ? 'success' : 'info'}>
            {config.marketMode === 'real-time' ? '⚡ Real-Time' : '📦 Batch'}
          </Badge>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Step 1: Upload */}
        {activeStep === 1 && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <Card className="p-6">
                <div className="flex flex-col items-center text-center space-y-4">
                  <Upload className="w-8 h-8 text-indigo-600" />
                  <h3 className="font-semibold">{LABELS.uploadStep.excel.title}</h3>
                  <Button onClick={handleExcelUpload}>{LABELS.uploadStep.excel.buttonSelect}</Button>
                  {excelFile && (
                    <div className="space-y-2">
                      <Badge variant="success">✓ {excelFile.name}</Badge>
                      {currentMappings && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowMappingModal(true)}
                          icon={MapIcon}
                        >
                          Adjust Mapping
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex flex-col items-center text-center space-y-4">
                  <Upload className="w-8 h-8 text-orange-600" />
                  <h3 className="font-semibold">{LABELS.uploadStep.pdf.title}</h3>
                  <Button onClick={handlePdfUpload}>{LABELS.uploadStep.pdf.buttonAdd}</Button>
                  {Object.keys(sourceFiles).length > 0 && (
                    <Badge variant="info">{Object.keys(sourceFiles).length} files</Badge>
                  )}
                </div>
              </Card>
            </div>

            {excelData.length > 0 && (
              <Card className="p-4">
                <div className="flex justify-between items-center">
                  <p className="text-sm text-slate-600">
                    {singlePdfMode ? (
                      <>
                        Loaded {excelData.length} pages •
                        {Object.keys(sourceFiles).length > 0
                          ? ` PDF assigned (${Object.keys(sourceFiles)[0]})`
                          : ' Waiting for PDF upload'}
                      </>
                    ) : (
                      <>
                        Loaded {excelData.length} documents • {Object.keys(sourceFiles).length} PDFs • {matchedRows} matched
                      </>
                    )}
                  </p>
                  {currentMappings && (
                    <Badge variant="info">
                      <MapIcon className="w-3 h-3 inline mr-1" />
                      Custom Mapping Active
                    </Badge>
                  )}
                </div>
              </Card>
            )}

            <div className="flex justify-end">
              <Button
                onClick={() => setActiveStep(2)}
                disabled={!excelFile || excelData.length === 0}
              >
                Configure Settings →
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Configure */}
        {activeStep === 2 && (
          <div className="space-y-6 max-w-3xl mx-auto">
            {/* Warning if PDF not uploaded in single PDF mode */}
            {singlePdfMode && Object.keys(sourceFiles).length === 0 && (
              <Card className="p-4 bg-orange-50 border-orange-200">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">⚠️</span>
                  <div>
                    <h4 className="font-semibold text-orange-900">PDF Not Uploaded Yet</h4>
                    <p className="text-sm text-orange-800 mt-1">
                      You can configure settings now, but you'll need to upload your PDF before running the automation.
                      Go back to Step 1 to upload your PDF file.
                    </p>
                  </div>
                </div>
              </Card>
            )}

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">{LABELS.configStep.title}</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Bates Prefix</label>
                  <input
                    type="text"
                    value={config.batesPrefix}
                    onChange={(e) => setConfig({...config, batesPrefix: e.target.value})}
                    className="w-full rounded-md border-slate-300 p-2 border"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Grouping Strategy</label>
                  <select
                    value={config.groupBy}
                    onChange={(e) => setConfig({...config, groupBy: e.target.value})}
                    className="w-full rounded-md border-slate-300 p-2 border"
                  >
                    {APP_CONFIG.processing.groupingStrategies.map(strategy => (
                      <option key={strategy.id} value={strategy.id}>{strategy.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </Card>

            <div className="flex justify-between">
              <Button variant="secondary" onClick={() => setActiveStep(1)}>← Back</Button>
              <Button onClick={() => { setActiveStep(3); processDocuments(); }}>
                ▶ Run Automation
              </Button>
            </div>
          </div>
        )}

        {/* Step 3 & 4: Processing/Complete */}
        {(activeStep === 3 || activeStep === 4) && (
          <div className="max-w-2xl mx-auto space-y-6">
            {processing && (
              <Card className="p-10 text-center space-y-6">
                <ProgressBar progress={progress} label="Processing Documents" />
                <div className="h-48 overflow-y-auto bg-slate-950 text-green-400 text-left text-xs font-mono p-4 rounded-lg">
                  {logs.map((log, i) => <div key={i}>{log}</div>)}
                </div>
              </Card>
            )}

            {!processing && resultZip && (
              <Card className="p-8 text-center">
                <h2 className="text-2xl font-bold mb-4">✅ Processing Complete!</h2>
                <p className="text-slate-600 mb-6">
                  {excelData.length} documents processed successfully
                </p>
                <div className="flex justify-center gap-4">
                  <Button variant="success" onClick={handleDownload}>Download Package</Button>
                  <Button variant="secondary" onClick={resetApp}>New Batch</Button>
                </div>
              </Card>
            )}
          </div>
        )}
      </main>

      {/* Column Mapping Modal */}
      <ColumnMappingModal
        isOpen={showMappingModal}
        onClose={() => setShowMappingModal(false)}
        firstRow={rawExcelData[0]}
        onMappingsConfirmed={handleMappingsConfirmed}
      />
    </div>
  );
}
