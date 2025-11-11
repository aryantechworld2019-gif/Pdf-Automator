/**
 * UI Labels and Text Configuration
 * Easy to modify for rebranding or internationalization
 */

export const LABELS = {
  // ============================================
  // APP HEADER
  // ============================================
  header: {
    title: "PDF Document Automator",
    subtitle: "Desktop Edition",
    webSubtitle: "Web Edition"
  },

  // ============================================
  // PROCESSING MODES
  // ============================================
  modes: {
    realTime: "⚡ Real-Time Mode",
    batch: "📦 Batch Mode"
  },

  // ============================================
  // WORKFLOW STEPS
  // ============================================
  steps: {
    upload: "Upload",
    configure: "Configure",
    process: "Process"
  },

  // ============================================
  // STEP 1: UPLOAD
  // ============================================
  uploadStep: {
    // Excel upload card
    excel: {
      title: "1. Upload Document Manifest",
      description: "Excel file with document data and file references",
      buttonSelect: "Select Excel File",
      buttonChange: "Change Manifest",
      successPrefix: "✓ "
    },

    // PDF upload card
    pdf: {
      title: "2. Upload Source Documents",
      description: "Select PDF files referenced in manifest",
      buttonAdd: "Add PDF Files",
      filesLoaded: "files loaded"
    },

    // Preview table
    preview: {
      title: "Document Data Preview",
      matched: "matched",
      allMatched: "All Matched",
      showingFirst: "Showing first",
      andMore: "and {count} more rows",
      warningMissing: "Warning: {count} document(s) missing from uploads."
    },

    // Table columns
    columns: {
      status: "Status",
      sourceFile: "Source File",
      date: "Date",
      type: "Type",
      asset: "Asset",
      priority: "Priority",
      page: "Page"
    },

    // Statistics cards
    stats: {
      totalDocs: "Total Documents",
      totalValue: "Total Value",
      categories: "Categories",
      dateRange: "Date Range"
    }
  },

  // ============================================
  // STEP 2: CONFIGURATION
  // ============================================
  configStep: {
    title: "Document Processing Configuration",

    // Processing mode section
    mode: {
      label: "Processing Mode",
      realTime: {
        title: "⚡ Real-Time",
        description: "Priority-based processing for urgent documents"
      },
      batch: {
        title: "📦 Batch",
        description: "Process all documents in chronological order"
      }
    },

    // Grouping section
    grouping: {
      label: "Document Grouping Strategy",
      strategies: {} // Populated from appConfig
    },

    // Priority section
    priority: {
      label: "⚡ Priority Processing",
      description: "Process urgent documents first (based on priority field)",
      enabled: "Enabled",
      disabled: "Disabled"
    },

    // Bates numbering section
    bates: {
      label: "Bates Numbering",
      prefix: "Prefix",
      startNumber: "Start Number",
      position: "Position",
      paddingDigits: "Padding Digits",
      fontSize: "Font Size",
      fontColor: "Font Color",
      previewLabel: "Document Preview"
    },

    // Advanced settings
    advanced: {
      label: "Advanced Settings",
      performance: "Performance Options",
      output: "Output Settings",
      formatting: "Formatting Options"
    }
  },

  // ============================================
  // STEP 3: PROCESSING
  // ============================================
  processStep: {
    // Processing state
    processing: {
      title: "⚡ Processing Documents...",
      titleBatch: "📦 Batch Processing Documents...",
      subtitle: "Splitting, Sorting, Merging & Stamping Documents",
      initializing: "Initializing..."
    },

    // Completion state
    complete: {
      title: "✅ Processing Complete!",
      subtitle: "{count} document(s) have been successfully organized, merged, and stamped.",
      packageContents: "Package Contents",
      contents: [
        "✓ Organized PDFs (grouped by {strategy})",
        "✓ Complete document manifest (Excel)",
        "✓ Processing summary report",
        "✓ Bates numbering applied: {start} onwards"
      ],
      buttonSave: "Save Package",
      buttonDownload: "Download Package",
      buttonNewBatch: "Process New Batch"
    },

    // Ready state
    ready: {
      message: "Ready to process. Click \"Run Automation\" to begin."
    }
  },

  // ============================================
  // PROCESSING LOGS
  // ============================================
  logs: {
    starting: "🚀 Starting document automation...",
    mode: "📊 Mode: {mode}",
    prioritySorting: "⚡ Applying priority sorting for urgent documents...",
    grouping: "📁 Grouping documents...",
    groupsCreated: "✓ Created {count} document group(s)",
    processing: "📄 Processing: {name} ({count} pages)",
    skipping: "⚠️  Skipping: '{name}' not found",
    completed: "✓ Completed: {name}",
    manifest: "📋 Generating document manifest...",
    compressing: "📦 Compressing documents...",
    complete: "✅ Document processing complete!",
    error: "🚨 CRITICAL ERROR: {message}",
    pageError: "❌ ERROR: Page {page} missing in {file}"
  },

  // ============================================
  // BUTTONS
  // ============================================
  buttons: {
    back: "← Back",
    next: "Next →",
    configureSettings: "Configure Settings →",
    runAutomation: "▶ Run Automation",
    save: "Save",
    cancel: "Cancel",
    reset: "Reset",
    export: "Export Settings",
    import: "Import Settings",
    apply: "Apply Changes"
  },

  // ============================================
  // NOTIFICATIONS
  // ============================================
  notifications: {
    fileLoaded: "File Loaded",
    filesLoaded: "Files Loaded",
    recordsImported: "{count} records imported",
    processingComplete: "Processing Complete!",
    docsProcessed: "{count} documents processed successfully",
    fileSaved: "File Saved",
    savedSuccessfully: "Documents saved successfully",
    settingsSaved: "Settings Saved",
    settingsLoaded: "Settings Loaded"
  },

  // ============================================
  // ERROR MESSAGES
  // ============================================
  errors: {
    parsingExcel: "Error parsing Excel file: {message}",
    processingFailed: "Processing failed: {message}",
    saveFailed: "Failed to save file: {message}",
    loadFailed: "Failed to load file: {message}",
    invalidFile: "Invalid file format",
    fileTooLarge: "File exceeds maximum size of {size}MB",
    tooManyFiles: "Cannot process more than {count} files"
  },

  // ============================================
  // PRIORITY LABELS
  // ============================================
  priority: {
    critical: "CRITICAL",
    urgent: "URGENT",
    high: "HIGH",
    normal: "Normal",
    low: "Low"
  },

  // ============================================
  // MENU ITEMS
  // ============================================
  menu: {
    file: {
      label: "File",
      newBatch: "New Batch",
      openSettings: "Settings",
      exit: "Exit"
    },
    edit: {
      label: "Edit",
      undo: "Undo",
      redo: "Redo",
      cut: "Cut",
      copy: "Copy",
      paste: "Paste",
      selectAll: "Select All"
    },
    view: {
      label: "View",
      reload: "Reload",
      forceReload: "Force Reload",
      toggleFullscreen: "Toggle Fullscreen",
      resetZoom: "Reset Zoom",
      zoomIn: "Zoom In",
      zoomOut: "Zoom Out"
    },
    help: {
      label: "Help",
      documentation: "Documentation",
      about: "About",
      aboutMessage: "Version: {version}\\nElectron: {electron}\\nChrome: {chrome}\\nNode.js: {node}"
    }
  }
};

export default LABELS;
