import React, { useState, useEffect, useRef } from 'react';
import { Upload, FileSpreadsheet, FileText, Settings, Play, Download, CheckCircle, AlertCircle, ChevronRight, LayoutTemplate, Hash, RefreshCw, TrendingUp, DollarSign, Calendar } from 'lucide-react';
import * as XLSX from 'xlsx';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

// Check if running in Electron
const isElectron = window.electronAPI !== undefined;

// --- Utility Components ---

const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-xl border border-slate-200 shadow-sm ${className}`}>
    {children}
  </div>
);

const Button = ({ children, onClick, disabled, variant = "primary", className = "", icon: Icon }) => {
  const baseStyle = "inline-flex items-center justify-center px-4 py-2 rounded-lg font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    primary: "bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500 shadow-sm",
    secondary: "bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 focus:ring-slate-400",
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
    ghost: "bg-transparent text-slate-600 hover:bg-slate-100",
    success: "bg-green-600 text-white hover:bg-green-700 focus:ring-green-500"
  };

  return (
    <button onClick={onClick} disabled={disabled} className={`${baseStyle} ${variants[variant]} ${className}`}>
      {Icon && <Icon className="w-4 h-4 mr-2" />}
      {children}
    </button>
  );
};

const Badge = ({ children, variant = "neutral" }) => {
  const variants = {
    neutral: "bg-slate-100 text-slate-700",
    success: "bg-green-100 text-green-700",
    error: "bg-red-100 text-red-700",
    warning: "bg-amber-100 text-amber-700",
    info: "bg-blue-100 text-blue-700",
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${variants[variant]}`}>
      {children}
    </span>
  );
};

// --- Main Application ---

export default function TradingPDFAutomator() {
  // State
  const [activeStep, setActiveStep] = useState(1);
  const [excelFile, setExcelFile] = useState(null);
  const [excelData, setExcelData] = useState([]);
  const [sourceFiles, setSourceFiles] = useState({});
  const [config, setConfig] = useState({
    batesPrefix: "TRADE-",
    startNumber: 1,
    digits: 6,
    position: "bottom-right",
    groupBy: "trade_date_type",
    marketMode: "real-time",
    priorityTrades: true,
  });
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState([]);
  const [resultZip, setResultZip] = useState(null);
  const [stats, setStats] = useState({
    totalTrades: 0,
    totalValue: 0,
    assetClasses: new Set(),
    dateRange: { min: null, max: null }
  });
  
  const totalRows = excelData.length;
  const matchedRows = excelData.filter(row => sourceFiles[row.source_file]).length;

  // Listen for new batch command from menu
  useEffect(() => {
    if (isElectron) {
      window.electronAPI.onNewBatch(() => {
        resetApp();
      });
    }
  }, []);

  const resetApp = () => {
    setActiveStep(1);
    setExcelData([]);
    setExcelFile(null);
    setSourceFiles({});
    setResultZip(null);
    setStats({ totalTrades: 0, totalValue: 0, assetClasses: new Set(), dateRange: { min: null, max: null } });
    setLogs([]);
  };

  // --- Handlers ---

  const handleExcelUpload = async () => {
    if (isElectron) {
      // Use native Electron dialog
      const result = await window.electronAPI.openExcelDialog();
      if (!result) return;

      try {
        const binaryString = atob(result.data);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        
        const wb = XLSX.read(bytes, { type: 'array' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);
        
        const normalizedData = normalizeExcelData(data);
        setExcelData(normalizedData);
        setExcelFile({ name: result.name });
        calculateStats(normalizedData);
        addLog(`✓ Loaded trading manifest: ${result.name} (${normalizedData.length} rows)`);
        
        // Show notification
        await window.electronAPI.showNotification('File Loaded', `${normalizedData.length} trade records imported`);
      } catch (err) {
        console.error(err);
        addLog(`❌ Error parsing Excel file: ${err.message}`);
      }
    }
  };

  const handlePdfUpload = async () => {
    if (isElectron) {
      const results = await window.electronAPI.openPDFsDialog();
      if (!results || results.length === 0) return;

      const newFiles = { ...sourceFiles };
      results.forEach(file => {
        newFiles[file.name] = {
          name: file.name,
          data: file.data
        };
      });
      
      setSourceFiles(newFiles);
      addLog(`✓ Added ${results.length} trade confirmation PDF(s)`);
      
      await window.electronAPI.showNotification('PDFs Loaded', `${results.length} files imported`);
    }
  };

  const normalizeExcelData = (data) => {
    return data.map(row => ({
      source_file: row.source_file || row['Source File'] || row['filename'] || row['File Name'] || '',
      page_number: row.page_number || row['Page Number'] || row['page'] || row['Page'] || 1,
      trade_date: row.trade_date || row['Trade Date'] || row['date'] || row['Date'] || 'Unknown Date',
      settlement_date: row.settlement_date || row['Settlement Date'] || row['settle_date'] || row.trade_date || row['Trade Date'] || '',
      trade_type: row.trade_type || row['Trade Type'] || row['type'] || row['Type'] || 'General',
      asset_class: row.asset_class || row['Asset Class'] || row['asset'] || row['security_type'] || 'Other',
      counterparty: row.counterparty || row['Counterparty'] || row['broker'] || row['Broker'] || 'Unknown',
      trade_id: row.trade_id || row['Trade ID'] || row['id'] || row['ID'] || '',
      trade_value: parseFloat(row.trade_value || row['Trade Value'] || row['value'] || row['amount'] || 0),
      priority: row.priority || row['Priority'] || row['urgent'] || 'normal',
      document_type: row.document_type || row['Document Type'] || row.trade_type || 'Trade Confirmation'
    })).filter(r => r.source_file);
  };

  const calculateStats = (data) => {
    const assetClasses = new Set();
    let totalValue = 0;
    let minDate = null;
    let maxDate = null;

    data.forEach(row => {
      if (row.asset_class) assetClasses.add(row.asset_class);
      if (row.trade_value) totalValue += row.trade_value;
      
      const tradeDate = new Date(row.trade_date);
      if (!isNaN(tradeDate)) {
        if (!minDate || tradeDate < minDate) minDate = tradeDate;
        if (!maxDate || tradeDate > maxDate) maxDate = tradeDate;
      }
    });

    setStats({
      totalTrades: data.length,
      totalValue,
      assetClasses,
      dateRange: { min: minDate, max: maxDate }
    });
  };

  const addLog = (msg) => {
    const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false });
    setLogs(prev => [...prev, `[${timestamp}] ${msg}`]);
  };

  // --- Core Processing Engine ---

  const processDocuments = async () => {
    setProcessing(true);
    setProgress(0);
    setLogs([]);
    setResultZip(null);
    
    addLog("🚀 Starting trade document automation...");
    addLog(`📊 Mode: ${config.marketMode.toUpperCase()}`);

    try {
      const zip = new JSZip();
      
      let sortedData = [...excelData];
      
      if (config.priorityTrades && config.marketMode === 'real-time') {
        addLog("⚡ Applying priority sorting for urgent trades...");
        sortedData.sort((a, b) => {
          const priorityOrder = { urgent: 0, high: 1, normal: 2 };
          const aPriority = priorityOrder[a.priority?.toLowerCase()] ?? 2;
          const bPriority = priorityOrder[b.priority?.toLowerCase()] ?? 2;
          return aPriority - bPriority;
        });
      }
      
      addLog("📁 Grouping trade documents...");
      const groups = {};
      
      sortedData.forEach((row) => {
        if (!sourceFiles[row.source_file]) {
          addLog(`⚠️  Skipping: '${row.source_file}' not found`);
          return;
        }

        let groupKey = "ALL_TRADES";
        
        switch(config.groupBy) {
          case 'trade_date_type':
            groupKey = `${row.trade_date}_${row.trade_type}`;
            break;
          case 'trade_date':
            groupKey = `${row.trade_date}`;
            break;
          case 'asset_class':
            groupKey = `${row.asset_class}`;
            break;
          case 'counterparty':
            groupKey = `${row.counterparty}`;
            break;
          case 'trade_type':
            groupKey = `${row.trade_type}`;
            break;
          case 'settlement_date':
            groupKey = `Settlement_${row.settlement_date}`;
            break;
          case 'daily_batch':
            const dateOnly = row.trade_date.split('T')[0].split(' ')[0];
            groupKey = `TRADES_${dateOnly}`;
            break;
          default:
            groupKey = "ALL_TRADES";
        }

        groupKey = groupKey.replace(/[^a-z0-9\-_]/gi, '_');

        if (!groups[groupKey]) groups[groupKey] = [];
        groups[groupKey].push(row);
      });

      const groupKeys = Object.keys(groups);
      addLog(`✓ Created ${groupKeys.length} trade document group(s)`);
      
      let globalBatesCounter = config.startNumber;
      let completedGroups = 0;

      for (const key of groupKeys) {
        const groupRows = groups[key];
        addLog(`📄 Processing: ${key} (${groupRows.length} pages)`);

        groupRows.sort((a, b) => {
          if (config.priorityTrades) {
            const priorityOrder = { urgent: 0, high: 1, normal: 2 };
            const aPriority = priorityOrder[a.priority?.toLowerCase()] ?? 2;
            const bPriority = priorityOrder[b.priority?.toLowerCase()] ?? 2;
            if (aPriority !== bPriority) return aPriority - bPriority;
          }
          
          if (a.trade_date !== b.trade_date) return a.trade_date.localeCompare(b.trade_date);
          if (a.settlement_date !== b.settlement_date) return a.settlement_date.localeCompare(b.settlement_date);
          if (a.trade_id && b.trade_id && a.trade_id !== b.trade_id) return a.trade_id.localeCompare(b.trade_id);
          return parseInt(a.page_number) - parseInt(b.page_number);
        });

        const mergedPdf = await PDFDocument.create();
        const font = await mergedPdf.embedFont(StandardFonts.Helvetica);
        const boldFont = await mergedPdf.embedFont(StandardFonts.HelveticaBold);

        for (const row of groupRows) {
          const sourceFile = sourceFiles[row.source_file];
          const binaryString = atob(sourceFile.data);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          
          const sourcePdfDoc = await PDFDocument.load(bytes);
          const pageIndex = parseInt(row.page_number) - 1;
          
          if (pageIndex >= 0 && pageIndex < sourcePdfDoc.getPageCount()) {
            const [copiedPage] = await mergedPdf.copyPages(sourcePdfDoc, [pageIndex]);
            const page = mergedPdf.addPage(copiedPage);

            const batesNum = String(globalBatesCounter).padStart(config.digits, '0');
            const batesString = `${config.batesPrefix}${batesNum}`;
            
            const { width, height } = page.getSize();
            const fontSize = 10;
            let x = 20, y = 20;

            if (config.position === 'bottom-right') {
               x = width - (batesString.length * 6) - 20;
               y = 20;
            } else if (config.position === 'top-right') {
               x = width - (batesString.length * 6) - 20;
               y = height - 30;
            } else if (config.position === 'top-left') {
               y = height - 30;
            }
            
            page.drawText(batesString, {
              x, y,
              size: fontSize,
              font: boldFont,
              color: rgb(0, 0, 0),
            });

            if (row.trade_id || row.trade_date) {
              const metadataText = `Trade: ${row.trade_id || 'N/A'} | Date: ${row.trade_date}`;
              const metadataX = config.position.includes('right') ? 20 : width - 200;
              const metadataY = config.position.includes('bottom') ? height - 25 : 15;
              
              page.drawText(metadataText, {
                x: metadataX,
                y: metadataY,
                size: 7,
                font: font,
                color: rgb(0.4, 0.4, 0.4),
              });
            }

            globalBatesCounter++;
          } else {
            addLog(`❌ ERROR: Page ${row.page_number} missing in ${row.source_file}`);
          }
        }

        const pdfBytes = await mergedPdf.save();
        zip.file(`${key}.pdf`, pdfBytes);
        
        completedGroups++;
        setProgress(Math.round((completedGroups / groupKeys.length) * 100));
        addLog(`✓ Completed: ${key}`);
      }

      addLog("📋 Generating trade manifest...");
      const manifestData = excelData
        .filter(row => sourceFiles[row.source_file])
        .map(row => ({
          'Bates Number': `${config.batesPrefix}${String(config.startNumber + excelData.indexOf(row)).padStart(config.digits, '0')}`,
          'Trade ID': row.trade_id,
          'Trade Date': row.trade_date,
          'Settlement Date': row.settlement_date,
          'Trade Type': row.trade_type,
          'Asset Class': row.asset_class,
          'Counterparty': row.counterparty,
          'Trade Value': row.trade_value,
          'Source File': row.source_file,
          'Page': row.page_number,
          'Priority': row.priority
        }));
      
      const ws = XLSX.utils.json_to_sheet(manifestData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Trade Manifest");
      const manifestBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      zip.file("TRADE_MANIFEST.xlsx", manifestBuffer);

      const summaryText = generateSummaryReport(groups, globalBatesCounter - config.startNumber);
      zip.file("PROCESSING_SUMMARY.txt", summaryText);

      addLog("📦 Compressing trade documents...");
      const content = await zip.generateAsync({ type: "blob" });
      setResultZip(content);
      addLog("✅ Trade document processing complete!");
      setActiveStep(4);

      if (isElectron) {
        await window.electronAPI.showNotification('Processing Complete!', `${stats.totalTrades} trades processed successfully`);
      }

    } catch (error) {
      console.error(error);
      addLog(`🚨 CRITICAL ERROR: ${error.message}`);
      alert(`Processing failed: ${error.message}`);
    } finally {
      setProcessing(false);
    }
  };

  const generateSummaryReport = (groups, totalPages) => {
    const timestamp = new Date().toLocaleString();
    return `
TRADE DOCUMENT PROCESSING SUMMARY
==================================
Generated: ${timestamp}
Mode: ${config.marketMode.toUpperCase()}
Platform: ${isElectron ? 'Desktop (Electron)' : 'Web'}

STATISTICS
----------
Total Trade Documents: ${stats.totalTrades}
Total Pages Processed: ${totalPages}
Total Groups Created: ${Object.keys(groups).length}
Asset Classes: ${Array.from(stats.assetClasses).join(', ')}
${stats.totalValue > 0 ? `Total Trade Value: $${stats.totalValue.toLocaleString()}` : ''}
${stats.dateRange.min ? `Date Range: ${stats.dateRange.min.toLocaleDateString()} - ${stats.dateRange.max.toLocaleDateString()}` : ''}

GROUPING CONFIGURATION
---------------------
Strategy: ${config.groupBy}
Bates Prefix: ${config.batesPrefix}
Starting Number: ${config.startNumber}
Priority Processing: ${config.priorityTrades ? 'Enabled' : 'Disabled'}

GROUPS CREATED
--------------
${Object.entries(groups).map(([key, rows]) => `${key}: ${rows.length} pages`).join('\n')}

BATES RANGE
-----------
Start: ${config.batesPrefix}${String(config.startNumber).padStart(config.digits, '0')}
End: ${config.batesPrefix}${String(config.startNumber + totalPages - 1).padStart(config.digits, '0')}
`;
  };

  const handleDownload = async () => {
    if (!resultZip) return;

    if (isElectron) {
      // Use native save dialog
      const defaultName = `Trade_Documents_${new Date().toISOString().split('T')[0]}.zip`;
      const savePath = await window.electronAPI.saveZipDialog(defaultName);
      
      if (savePath) {
        const reader = new FileReader();
        reader.onload = async () => {
          const base64 = reader.result.split(',')[1];
          const result = await window.electronAPI.writeFile(savePath, base64);
          if (result.success) {
            addLog(`✓ File saved to: ${savePath}`);
            await window.electronAPI.showNotification('File Saved', 'Trade documents saved successfully');
          } else {
            alert(`Failed to save file: ${result.error}`);
          }
        };
        reader.readAsDataURL(resultZip);
      }
    } else {
      // Browser fallback - use Blob and download
      try {
        saveAs(resultZip, `Trade_Documents_${new Date().toISOString().split('T')[0]}.zip`);
      } catch (error) {
        // Fallback if file-saver fails
        const url = URL.createObjectURL(resultZip);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Trade_Documents_${new Date().toISOString().split('T')[0]}.zip`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    }
  };

  // Render functions here remain the same as the web version
  // (renderUploadStep, renderConfigStep, renderProcessingStep)
  // but with buttons calling the new handlers

  const renderUploadStep = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Stats banner */}
      {stats.totalTrades > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-blue-600 font-semibold uppercase">Total Trades</p>
                <p className="text-2xl font-bold text-blue-900">{stats.totalTrades}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-600 opacity-50" />
            </div>
          </Card>
          
          <Card className="p-4 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-green-600 font-semibold uppercase">Trade Value</p>
                <p className="text-2xl font-bold text-green-900">
                  {stats.totalValue > 0 ? `$${(stats.totalValue / 1000000).toFixed(1)}M` : 'N/A'}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-green-600 opacity-50" />
            </div>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-purple-600 font-semibold uppercase">Asset Classes</p>
                <p className="text-2xl font-bold text-purple-900">{stats.assetClasses.size}</p>
              </div>
              <Hash className="w-8 h-8 text-purple-600 opacity-50" />
            </div>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-orange-600 font-semibold uppercase">Date Range</p>
                <p className="text-sm font-bold text-orange-900">
                  {stats.dateRange.min ? `${stats.dateRange.min.toLocaleDateString().substring(0, 5)} - ${stats.dateRange.max.toLocaleDateString().substring(0, 5)}` : 'N/A'}
                </p>
              </div>
              <Calendar className="w-8 h-8 text-orange-600 opacity-50" />
            </div>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Excel Upload Card */}
        <Card className="p-6 hover:border-indigo-300 transition-colors group">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className={`p-4 rounded-full ${excelFile ? 'bg-green-100 text-green-600' : 'bg-indigo-50 text-indigo-600 group-hover:scale-110 transition-transform'}`}>
              <FileSpreadsheet className="w-8 h-8" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">1. Upload Trade Manifest</h3>
              <p className="text-sm text-slate-500 mt-1">Excel with trade data and file references</p>
            </div>
            <Button 
              variant={excelFile ? "secondary" : "primary"}
              onClick={handleExcelUpload}
            >
              {excelFile ? "Change Manifest" : "Select Excel File"}
            </Button>
            {excelFile && <Badge variant="success">✓ {excelFile.name}</Badge>}
          </div>
        </Card>

        {/* PDF Upload Card */}
        <Card className="p-6 hover:border-indigo-300 transition-colors group">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="p-4 rounded-full bg-orange-50 text-orange-600 group-hover:scale-110 transition-transform">
              <FileText className="w-8 h-8" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">2. Upload Trade Confirmations</h3>
              <p className="text-sm text-slate-500 mt-1">Select PDF files referenced in manifest</p>
            </div>
            <Button 
              variant="primary"
              onClick={handlePdfUpload}
            >
              Add PDF Files
            </Button>
            {Object.keys(sourceFiles).length > 0 && (
               <Badge variant="info">📄 {Object.keys(sourceFiles).length} files loaded</Badge>
            )}
          </div>
        </Card>
      </div>

      {/* Preview Table */}
      {excelData.length > 0 && (
        <Card className="overflow-hidden">
          <div className="bg-slate-50 border-b border-slate-200 px-4 py-3 flex justify-between items-center">
            <h4 className="font-medium text-slate-700 flex items-center">
              <LayoutTemplate className="w-4 h-4 mr-2" /> Trade Data Preview
            </h4>
            <div className="flex items-center gap-4">
              <span className="text-xs text-slate-500">{matchedRows} / {totalRows} matched</span>
              {matchedRows === totalRows && <Badge variant="success">All Matched</Badge>}
            </div>
          </div>
          <div className="max-h-96 overflow-y-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-500 sticky top-0 z-10 shadow-sm">
                <tr>
                  <th className="px-3 py-2 font-medium">Status</th>
                  <th className="px-3 py-2 font-medium">Source File</th>
                  <th className="px-3 py-2 font-medium">Trade Date</th>
                  <th className="px-3 py-2 font-medium">Type</th>
                  <th className="px-3 py-2 font-medium">Asset</th>
                  <th className="px-3 py-2 font-medium">Priority</th>
                  <th className="px-3 py-2 font-medium">Page</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {excelData.slice(0, 100).map((row, idx) => {
                  const found = !!sourceFiles[row.source_file];
                  const isUrgent = row.priority?.toLowerCase() === 'urgent';
                  
                  return (
                    <tr key={idx} className={`
                      ${found ? 'bg-white' : 'bg-red-50'}
                      ${isUrgent ? 'border-l-4 border-l-red-500' : ''}
                    `}>
                      <td className="px-3 py-2">
                        {found ? <CheckCircle className="w-4 h-4 text-green-500"/> : <AlertCircle className="w-4 h-4 text-red-500"/>}
                      </td>
                      <td className="px-3 py-2 font-medium text-slate-700 text-xs">{row.source_file}</td>
                      <td className="px-3 py-2 text-slate-600">{row.trade_date}</td>
                      <td className="px-3 py-2">
                        <Badge variant="neutral">{row.trade_type}</Badge>
                      </td>
                      <td className="px-3 py-2 text-slate-600">{row.asset_class}</td>
                      <td className="px-3 py-2">
                        {isUrgent && <Badge variant="error">URGENT</Badge>}
                        {row.priority?.toLowerCase() === 'high' && <Badge variant="warning">HIGH</Badge>}
                        {(!row.priority || row.priority.toLowerCase() === 'normal') && <Badge variant="neutral">Normal</Badge>}
                      </td>
                      <td className="px-3 py-2 text-slate-600">{row.page_number}</td>
                    </tr>
                  );
                })}
                {excelData.length > 100 && (
                    <tr><td colSpan="7" className="text-center py-2 text-slate-400 italic">...and {excelData.length - 100} more rows</td></tr>
                )}
              </tbody>
            </table>
          </div>
          {matchedRows < totalRows && (
            <div className="bg-amber-50 px-4 py-2 text-xs text-amber-800 border-t border-amber-100 flex items-center">
               <AlertCircle className="w-3 h-3 mr-2" />
               Warning: {totalRows - matchedRows} trade confirmation(s) missing from uploads.
            </div>
          )}
        </Card>
      )}
    </div>
  );

  const renderConfigStep = () => (
    <div className="space-y-6 max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
       <Card className="p-6">
         <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
            <Settings className="w-5 h-5 mr-2 text-indigo-600" /> Trading Document Configuration
         </h3>
         
         <div className="space-y-6">
            {/* Processing Mode */}
            <div>
               <label className="block text-sm font-medium text-slate-700 mb-3">Processing Mode</label>
               <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setConfig({ ...config, marketMode: 'real-time' })}
                    className={`p-4 rounded-lg border text-left transition-all ${
                      config.marketMode === 'real-time' 
                      ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-500' 
                      : 'border-slate-200 hover:border-indigo-300'
                    }`}
                  >
                     <div className="font-medium text-slate-900 flex items-center">
                        ⚡ Real-Time
                     </div>
                     <div className="text-xs text-slate-500 mt-1">Priority-based processing for urgent trades</div>
                  </button>
                  <button
                    onClick={() => setConfig({ ...config, marketMode: 'batch' })}
                    className={`p-4 rounded-lg border text-left transition-all ${
                      config.marketMode === 'batch' 
                      ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-500' 
                      : 'border-slate-200 hover:border-indigo-300'
                    }`}
                  >
                     <div className="font-medium text-slate-900 flex items-center">
                        📦 Batch
                     </div>
                     <div className="text-xs text-slate-500 mt-1">Process all trades in chronological order</div>
                  </button>
               </div>
            </div>

            <hr className="border-slate-100" />

            {/* Grouping Strategy */}
            <div>
               <label className="block text-sm font-medium text-slate-700 mb-2">Trade Grouping Strategy</label>
               <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[
                    { id: 'trade_date_type', label: 'Date & Type', desc: 'Group by trade date and type' },
                    { id: 'trade_date', label: 'Trade Date', desc: 'One file per trade date' },
                    { id: 'asset_class', label: 'Asset Class', desc: 'Group by asset type' },
                    { id: 'counterparty', label: 'Counterparty', desc: 'Group by broker/counterparty' },
                    { id: 'settlement_date', label: 'Settlement Date', desc: 'Group by settlement date' },
                    { id: 'daily_batch', label: 'Daily Batch', desc: 'All trades per day' }
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => setConfig({ ...config, groupBy: opt.id })}
                      className={`p-3 rounded-lg border text-left transition-all ${
                        config.groupBy === opt.id 
                        ? 'border-indigo-500 bg-indigo-50 ring-1 ring-indigo-500' 
                        : 'border-slate-200 hover:border-indigo-300'
                      }`}
                    >
                       <div className="font-medium text-slate-900 text-sm">{opt.label}</div>
                       <div className="text-xs text-slate-500 mt-1">{opt.desc}</div>
                    </button>
                  ))}
               </div>
            </div>

            <hr className="border-slate-100" />

            {/* Priority Processing */}
            {config.marketMode === 'real-time' && (
              <div>
                <label className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-100 transition">
                  <div>
                    <div className="font-medium text-slate-900">⚡ Priority Processing</div>
                    <div className="text-xs text-slate-500 mt-1">Process urgent trades first (based on priority field)</div>
                  </div>
                  <input 
                    type="checkbox"
                    checked={config.priorityTrades}
                    onChange={(e) => setConfig({...config, priorityTrades: e.target.checked})}
                    className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
                  />
                </label>
              </div>
            )}

            <hr className="border-slate-100" />

            {/* Bates Numbering */}
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">Bates Numbering</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                       <label className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Prefix</label>
                       <input 
                          type="text" 
                          value={config.batesPrefix} 
                          onChange={(e) => setConfig({...config, batesPrefix: e.target.value})}
                          className="mt-1 w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2" 
                          placeholder="TRADE-"
                        />
                    </div>
                    <div>
                       <label className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Start Number</label>
                       <input 
                          type="number" 
                          value={config.startNumber} 
                          onChange={(e) => setConfig({...config, startNumber: parseInt(e.target.value) || 1})}
                          className="mt-1 w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2" 
                        />
                    </div>
                    <div>
                       <label className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Position</label>
                       <select 
                          value={config.position}
                          onChange={(e) => setConfig({...config, position: e.target.value})}
                          className="mt-1 w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                        >
                           <option value="bottom-right">Bottom Right</option>
                           <option value="bottom-left">Bottom Left</option>
                           <option value="top-right">Top Right</option>
                           <option value="top-left">Top Left</option>
                       </select>
                    </div>
                    <div>
                       <label className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Padding Digits</label>
                       <input 
                          type="number" 
                          value={config.digits} 
                          onChange={(e) => setConfig({...config, digits: parseInt(e.target.value)})}
                          className="mt-1 w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2" 
                        />
                    </div>
                </div>
                
                {/* Live Preview */}
                <div className="mt-4 p-4 bg-slate-100 rounded-lg border border-slate-200 flex items-center justify-center h-24 relative overflow-hidden">
                   <div className="absolute inset-0 bg-white m-4 shadow-sm border border-slate-300"></div>
                   <div className={`absolute p-2 font-mono text-xs font-bold text-black z-10 ${
                      config.position.includes('bottom') ? 'bottom-4' : 'top-4'
                   } ${
                      config.position.includes('right') ? 'right-4' : 'left-4'
                   }`}>
                      {config.batesPrefix}{String(config.startNumber).padStart(config.digits, '0')}
                   </div>
                   <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-slate-400 text-[10px]">Trade Confirmation Preview</div>
                </div>
            </div>
         </div>
       </Card>
    </div>
  );

  const renderProcessingStep = () => (
     <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in zoom-in-95 duration-500">
        {processing ? (
            <Card className="p-10 text-center space-y-6">
               <div className="relative w-24 h-24 mx-auto">
                 <div className="absolute inset-0 border-4 border-indigo-100 rounded-full"></div>
                 <div 
                   className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"
                 ></div>
                 <div className="absolute inset-0 flex items-center justify-center font-bold text-xl text-indigo-600">
                    {progress}%
                 </div>
               </div>
               <div>
                  <h3 className="text-xl font-bold text-slate-900">
                     {config.marketMode === 'real-time' ? '⚡ Processing Trades in Real-Time...' : '📦 Batch Processing Trades...'}
                  </h3>
                  <p className="text-slate-500 mt-2">Splitting, Sorting, Merging & Stamping Trade Documents</p>
               </div>
               <div className="h-48 overflow-y-auto bg-slate-950 text-green-400 text-left text-xs font-mono p-4 rounded-lg shadow-inner space-y-1">
                  {logs.map((log, i) => <div key={i} className="leading-relaxed">{log}</div>)}
                  {logs.length === 0 && <div className="text-slate-500">Initializing...</div>}
               </div>
            </Card>
        ) : resultZip ? (
            <Card className="p-8 text-center bg-gradient-to-br from-green-50 via-white to-indigo-50 border-green-100">
               <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg animate-bounce">
                  <CheckCircle className="w-10 h-10" />
               </div>
               <h2 className="text-2xl font-bold text-slate-900">✅ Trade Processing Complete!</h2>
               <p className="text-slate-600 mt-2 mb-6">
                  {stats.totalTrades} trade document(s) have been successfully organized, merged, and stamped.
               </p>
               
               <div className="bg-white rounded-lg p-4 mb-6 border border-slate-200 text-left">
                  <div className="text-xs uppercase font-semibold text-slate-500 mb-2">Package Contents</div>
                  <ul className="text-sm text-slate-700 space-y-1">
                     <li>✓ Organized trade PDFs (grouped by {config.groupBy.replace(/_/g, ' ')})</li>
                     <li>✓ Complete trade manifest (Excel)</li>
                     <li>✓ Processing summary report</li>
                     <li>✓ Bates numbering applied: {config.batesPrefix}{String(config.startNumber).padStart(config.digits, '0')} onwards</li>
                  </ul>
               </div>
               
               <div className="flex justify-center gap-4">
                  <Button 
                    onClick={handleDownload} 
                    icon={Download}
                    variant="success"
                    className="shadow-lg shadow-green-200"
                  >
                     {isElectron ? 'Save Package' : 'Download Package'}
                  </Button>
                  <Button 
                    variant="secondary" 
                    onClick={resetApp}
                    icon={RefreshCw}
                  >
                     Process New Batch
                  </Button>
               </div>
            </Card>
        ) : (
            <Card className="p-10 text-center">
               <div className="text-slate-400 mb-4">
                  <Play className="w-12 h-12 mx-auto" />
               </div>
               <p className="text-slate-500">Ready to process. Click "Run Automation" to begin.</p>
            </Card>
        )}
     </div>
  );

  const steps = [
    { id: 1, label: 'Upload', icon: Upload },
    { id: 2, label: 'Configure', icon: Settings },
    { id: 3, label: 'Process', icon: Play },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 font-sans text-slate-900 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
           <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 p-2 rounded-lg shadow-md">
                 <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-xl tracking-tight">Trading PDF Automator</h1>
                <p className="text-xs text-slate-500">{isElectron ? 'Desktop Edition' : 'Web Edition'}</p>
              </div>
           </div>
           <Badge variant={config.marketMode === 'real-time' ? 'success' : 'info'}>
              {config.marketMode === 'real-time' ? '⚡ Real-Time Mode' : '📦 Batch Mode'}
           </Badge>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
         {/* Progress Stepper */}
         <div className="flex justify-center mb-10">
            <div className="flex items-center space-x-4">
               {steps.map((step, idx) => {
                  const Icon = step.icon;
                  const isActive = activeStep === step.id || activeStep === 4;
                  const isCompleted = activeStep > step.id;
                  
                  return (
                    <div key={step.id} className="flex items-center">
                       <div className={`
                          flex items-center px-4 py-2 rounded-full border-2 transition-all
                          ${isActive || isCompleted ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-md' : 'border-slate-300 bg-white text-slate-400'}
                       `}>
                          <Icon className="w-4 h-4 mr-2" />
                          <span className="font-medium text-sm">{step.label}</span>
                       </div>
                       {idx < steps.length - 1 && (
                          <div className={`w-12 h-1 rounded-full mx-2 transition-colors ${
                            isCompleted ? 'bg-indigo-600' : 'bg-slate-300'
                          }`}></div>
                       )}
                    </div>
                  );
               })}
            </div>
         </div>

         {/* Step Content */}
         <div className="min-h-[500px]">
            {activeStep === 1 && renderUploadStep()}
            {activeStep === 2 && renderConfigStep()}
            {(activeStep === 3 || activeStep === 4) && renderProcessingStep()}
         </div>

         {/* Footer Navigation */}
         <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 z-40 shadow-lg">
            <div className="max-w-6xl mx-auto flex justify-between items-center">
               <Button 
                  variant="secondary" 
                  onClick={() => setActiveStep(s => Math.max(1, s - 1))}
                  disabled={activeStep === 1 || activeStep === 4 || processing}
               >
                  ← Back
               </Button>

               <div className="text-sm font-medium text-slate-600">
                  {activeStep === 1 && excelData.length > 0 && (
                    <span className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      {matchedRows} of {totalRows} trades matched
                    </span>
                  )}
               </div>

               {activeStep === 1 && (
                  <Button 
                     onClick={() => setActiveStep(2)}
                     disabled={!excelFile || Object.keys(sourceFiles).length === 0 || matchedRows === 0}
                     icon={ChevronRight}
                  >
                     Configure Settings →
                  </Button>
               )}
               {activeStep === 2 && (
                  <Button 
                     onClick={() => { setActiveStep(3); processDocuments(); }}
                     disabled={processing}
                     className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 shadow-lg"
                     icon={Play}
                  >
                     ▶ Run Automation
                  </Button>
               )}
            </div>
         </div>
      </main>
    </div>
  );
}
