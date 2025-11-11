/**
 * Central Application Configuration
 * Edit these values to customize the application without touching code
 */

export const APP_CONFIG = {
  // ============================================
  // BRANDING
  // ============================================
  branding: {
    appName: "PDF Document Automator",
    appNameShort: "PDF Automator",
    companyName: "Your Company",
    version: "2.0.0",
    appId: "com.yourcompany.pdfautomator",
    description: "Professional document processing and automation"
  },

  // ============================================
  // WINDOW SETTINGS
  // ============================================
  window: {
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 700,
    backgroundColor: '#f8fafc'
  },

  // ============================================
  // BATES NUMBERING DEFAULTS
  // ============================================
  bates: {
    defaultPrefix: "DOC-",
    defaultStartNumber: 1,
    defaultDigits: 6,
    defaultPosition: "bottom-right",

    // Font styling
    font: {
      family: "Helvetica",
      size: 10,
      bold: true,
      color: {
        r: 0,
        g: 0,
        b: 0
      }
    },

    // Positioning
    margins: {
      x: 20,
      y: 20,
      characterWidth: 6 // Approximate width per character for positioning
    },

    // Available positions
    positions: [
      { id: 'bottom-right', label: 'Bottom Right' },
      { id: 'bottom-left', label: 'Bottom Left' },
      { id: 'top-right', label: 'Top Right' },
      { id: 'top-left', label: 'Top Left' },
      { id: 'bottom-center', label: 'Bottom Center' },
      { id: 'top-center', label: 'Top Center' }
    ]
  },

  // ============================================
  // METADATA STAMP
  // ============================================
  metadata: {
    enabled: true,
    font: {
      family: "Helvetica",
      size: 7,
      bold: false,
      color: {
        r: 0.4,
        g: 0.4,
        b: 0.4
      }
    },
    positions: {
      offsetX: 200,
      offsetY: 25,
      bottomOffsetY: 15
    }
  },

  // ============================================
  // PROCESSING DEFAULTS
  // ============================================
  processing: {
    defaultGroupBy: "date_type",
    defaultMode: "batch",
    enablePriorityProcessing: true,

    // Priority levels (lower number = higher priority)
    priorityOrder: {
      critical: 0,
      urgent: 1,
      high: 2,
      normal: 3,
      low: 4
    },

    // Performance settings
    performance: {
      batchSize: 100,           // Process 100 files at a time
      maxConcurrent: 4,          // Max parallel operations
      chunkSize: 50,             // Split large operations into chunks
      enableWorkers: true,       // Use Web Workers for heavy processing
      progressUpdateInterval: 100 // Update UI every 100ms
    },

    // Grouping strategies
    groupingStrategies: [
      { id: 'date_type', label: 'Date & Type', description: 'Group by date and document type' },
      { id: 'date', label: 'Date Only', description: 'One file per date' },
      { id: 'type', label: 'Type Only', description: 'Group by document type' },
      { id: 'settlement_date', label: 'Settlement Date', description: 'Group by settlement date' },
      { id: 'daily_batch', label: 'Daily Batch', description: 'All documents per day' },
      { id: 'asset_class', label: 'Asset Class', description: 'Group by asset type' },
      { id: 'counterparty', label: 'Counterparty', description: 'Group by counterparty' },
      { id: 'none', label: 'No Grouping', description: 'Single master document' }
    ]
  },

  // ============================================
  // OUTPUT FILES
  // ============================================
  outputFiles: {
    manifestName: "DOCUMENT_MANIFEST.xlsx",
    summaryName: "PROCESSING_SUMMARY.txt",
    zipPrefix: "Processed_Documents",
    dateFormat: "YYYY-MM-DD" // For filename timestamps
  },

  // ============================================
  // CURRENCY & FORMATTING
  // ============================================
  formatting: {
    currency: {
      symbol: "$",
      position: "prefix", // 'prefix' or 'suffix'
      displayUnit: "M",   // 'K' (thousands), 'M' (millions), 'B' (billions)
      divisor: 1000000,   // For millions
      decimals: 1,
      thousandsSeparator: ",",
      decimalSeparator: "."
    },

    date: {
      format: "MM/DD/YYYY", // or "DD/MM/YYYY", "YYYY-MM-DD"
      timeFormat: "12h"     // '12h' or '24h'
    }
  },

  // ============================================
  // UI THEME
  // ============================================
  theme: {
    mode: 'light', // 'light' or 'dark'

    colors: {
      primary: '#4f46e5',      // Indigo
      secondary: '#64748b',    // Slate
      success: '#16a34a',      // Green
      danger: '#dc2626',       // Red
      warning: '#f59e0b',      // Amber
      info: '#0ea5e9',         // Sky blue

      // PDF stamp colors
      batesNumber: 'rgb(0, 0, 0)',
      metadata: 'rgb(0.4, 0.4, 0.4)'
    },

    fonts: {
      sans: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial',
      mono: 'Menlo, Monaco, "Courier New", monospace'
    }
  },

  // ============================================
  // FEATURES FLAGS
  // ============================================
  features: {
    enableDarkMode: true,
    enableExport: true,
    enableImport: true,
    enableAdvancedSettings: true,
    enableStatistics: true,
    enableNotifications: true,
    enableAutoSave: true,
    enableMultiLanguage: false // Future feature
  },

  // ============================================
  // LIMITS & VALIDATION
  // ============================================
  limits: {
    maxFileSize: 100 * 1024 * 1024, // 100MB per PDF
    maxTotalSize: 5 * 1024 * 1024 * 1024, // 5GB total
    maxFiles: 100000, // Support up to 100k files
    maxExcelRows: 100000,
    warnThreshold: 10000 // Warn user if over 10k files
  }
};

export default APP_CONFIG;
