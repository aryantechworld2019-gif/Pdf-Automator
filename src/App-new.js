/**
 * Main Application - Refactored & Optimized
 * Handles 50k+ files with performance optimizations
 */

import React, { useState, useEffect } from 'react';
import { Upload, Settings as SettingsIcon, Play, TrendingUp } from 'lucide-react';

// Services
import { parseExcelFile } from './services/excelParser';
import { processDocumentsBatched, groupDocuments } from './services/pdfProcessor';
import { createZipArchive, saveZipFile, generateDefaultFilename } from './services/fileWriter';
import { loadSettings, saveSettings } from './services/settingsManager';

// Components
import { Card, Button, Badge, ProgressBar } from './components';

// Configuration
import { APP_CONFIG } from './config/appConfig';
import { LABELS } from './config/labelConfig';

// Check if running in Electron
const isElectron = typeof window !== 'undefined' && window.electronAPI !== undefined;

export default function App() {
  // State
  const [activeStep, setActiveStep] = useState(1);
  const [excelFile, setExcelFile] = useState(null);
  const [excelData, setExcelData] = useState([]);
  const [sourceFiles, setSourceFiles] = useState({});
  const [config, setConfig] = useState(loadSettings());
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState([]);
  const [resultZip, setResultZip] = useState(null);
  const [stats, setStats] = useState({});

  // Auto-save settings
  useEffect(() => {
    saveSettings(config);
  }, [config]);

  // File upload handlers
  const handleExcelUpload = async () => {
    if (!isElectron) return;

    const result = await window.electronAPI.openExcelDialog();
    if (!result) return;

    const parsed = await parseExcelFile(result.data, result.name);
    if (parsed.success) {
      setExcelData(parsed.data);
      setExcelFile({ name: result.name });
      setStats(parsed.stats);
      addLog(`✓ Loaded: ${result.name} (${parsed.rowCount} rows)`);
    } else {
      addLog(`❌ Error: ${parsed.error}`);
    }
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
    addLog(`✓ Added ${results.length} PDF(s)`);
  };

  // Process documents
  const processDocuments = async () => {
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
    setExcelData([]);
    setExcelFile(null);
    setSourceFiles({});
    setResultZip(null);
    setStats({});
    setLogs([]);
  };

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
                  {excelFile && <Badge variant="success">✓ {excelFile.name}</Badge>}
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
                <p className="text-sm text-slate-600">
                  Loaded {excelData.length} documents, {Object.keys(sourceFiles).length} PDFs
                </p>
              </Card>
            )}

            <div className="flex justify-end">
              <Button
                onClick={() => setActiveStep(2)}
                disabled={!excelFile || Object.keys(sourceFiles).length === 0}
              >
                Configure Settings →
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Configure */}
        {activeStep === 2 && (
          <div className="space-y-6 max-w-3xl mx-auto">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">{LABELS.configStep.title}</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Bates Prefix</label>
                  <input
                    type="text"
                    value={config.batesPrefix}
                    onChange={(e) => setConfig({...config, batesPrefix: e.target.value})}
                    className="w-full rounded-md border-slate-300 p-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Grouping Strategy</label>
                  <select
                    value={config.groupBy}
                    onChange={(e) => setConfig({...config, groupBy: e.target.value})}
                    className="w-full rounded-md border-slate-300 p-2"
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
    </div>
  );
}
