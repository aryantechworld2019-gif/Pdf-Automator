/**
 * PDF Processor Service with Performance Optimization
 * Handles large-scale PDF processing (50k+ files)
 * Features: Batching, streaming, memory management, parallel processing
 */

import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { APP_CONFIG } from '../config/appConfig';
import { getPdfColor } from '../config/styleConfig';

/**
 * Process documents in batches for performance
 * @param {Array} groups - Grouped document data
 * @param {Object} sourceFiles - Source PDF files
 * @param {Object} config - Processing configuration
 * @param {Function} progressCallback - Progress update callback
 * @param {Function} logCallback - Logging callback
 * @returns {Promise<Map>} Processed PDFs as Map<groupKey, pdfBytes>
 */
export async function processDocumentsBatched(groups, sourceFiles, config, progressCallback, logCallback) {
  const { batchSize, maxConcurrent } = APP_CONFIG.processing.performance;
  const groupKeys = Object.keys(groups);
  const processedPDFs = new Map();

  let completedGroups = 0;
  let globalBatesCounter = config.startNumber;

  logCallback('📊 Using optimized batch processing for large datasets');
  logCallback(`⚙️ Batch size: ${batchSize}, Max concurrent: ${maxConcurrent}`);

  // Process groups in batches
  for (let i = 0; i < groupKeys.length; i += maxConcurrent) {
    const batch = groupKeys.slice(i, i + maxConcurrent);

    // Process batch in parallel
    const batchPromises = batch.map(async (key) => {
      const groupRows = groups[key];
      logCallback(`📄 Processing: ${key} (${groupRows.length} pages)`);

      try {
        const pdfBytes = await processGroup(
          key,
          groupRows,
          sourceFiles,
          config,
          globalBatesCounter
        );

        globalBatesCounter += groupRows.length;
        completedGroups++;

        // Update progress
        const progress = Math.round((completedGroups / groupKeys.length) * 100);
        progressCallback(progress);

        logCallback(`✓ Completed: ${key}`);
        return { key, pdfBytes };

      } catch (error) {
        logCallback(`❌ ERROR processing ${key}: ${error.message}`);
        throw error;
      }
    });

    // Wait for batch to complete
    const batchResults = await Promise.all(batchPromises);

    // Store results
    batchResults.forEach(({ key, pdfBytes }) => {
      processedPDFs.set(key, pdfBytes);
    });

    // Force garbage collection hint (if available)
    if (global.gc) {
      global.gc();
    }
  }

  return processedPDFs;
}

/**
 * Process a single group of documents
 * @param {string} groupKey - Group identifier
 * @param {Array} groupRows - Document rows
 * @param {Object} sourceFiles - Source files
 * @param {Object} config - Configuration
 * @param {number} startBatesNumber - Starting Bates number
 * @returns {Promise<Uint8Array>} PDF bytes
 */
async function processGroup(groupKey, groupRows, sourceFiles, config, startBatesNumber) {
  const mergedPdf = await PDFDocument.create();
  const font = await mergedPdf.embedFont(StandardFonts.Helvetica);
  const boldFont = await mergedPdf.embedFont(StandardFonts.HelveticaBold);

  let currentBatesNumber = startBatesNumber;

  // Sort rows
  const sortedRows = sortRows(groupRows, config);

  // Process each page in chunks to manage memory
  const chunkSize = APP_CONFIG.processing.performance.chunkSize;

  for (let i = 0; i < sortedRows.length; i += chunkSize) {
    const chunk = sortedRows.slice(i, i + chunkSize);

    for (const row of chunk) {
      await processPage(
        mergedPdf,
        row,
        sourceFiles,
        config,
        currentBatesNumber,
        font,
        boldFont
      );

      currentBatesNumber++;
    }
  }

  // Save PDF
  const pdfBytes = await mergedPdf.save();

  return pdfBytes;
}

/**
 * Process a single page
 * @param {PDFDocument} mergedPdf - Target PDF document
 * @param {Object} row - Row data
 * @param {Object} sourceFiles - Source files
 * @param {Object} config - Configuration
 * @param {number} batesNumber - Current Bates number
 * @param {Object} font - Regular font
 * @param {Object} boldFont - Bold font
 */
async function processPage(mergedPdf, row, sourceFiles, config, batesNumber, font, boldFont) {
  const sourceFile = sourceFiles[row.source_file];

  if (!sourceFile) {
    throw new Error(`Source file not found: ${row.source_file}`);
  }

  // Load source PDF
  const binaryString = atob(sourceFile.data);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  const sourcePdfDoc = await PDFDocument.load(bytes);
  const pageIndex = parseInt(row.page_number) - 1;

  if (pageIndex < 0 || pageIndex >= sourcePdfDoc.getPageCount()) {
    throw new Error(`Invalid page number ${row.page_number} in ${row.source_file}`);
  }

  // Copy page
  const [copiedPage] = await mergedPdf.copyPages(sourcePdfDoc, [pageIndex]);
  const page = mergedPdf.addPage(copiedPage);

  // Add Bates stamp
  addBatesStamp(page, batesNumber, config, boldFont);

  // Add metadata if enabled
  if (APP_CONFIG.metadata.enabled) {
    addMetadata(page, row, config, font);
  }
}

/**
 * Add Bates stamp to page
 * @param {PDFPage} page - PDF page
 * @param {number} batesNumber - Bates number
 * @param {Object} config - Configuration
 * @param {Object} font - Font object
 */
function addBatesStamp(page, batesNumber, config, font) {
  const batesNum = String(batesNumber).padStart(config.digits, '0');
  const batesString = `${config.batesPrefix}${batesNum}`;

  const { width, height } = page.getSize();
  const fontSize = config.fontSize || APP_CONFIG.bates.font.size;
  const margins = APP_CONFIG.bates.margins;

  // Calculate position
  const position = calculateBatesPosition(
    config.position,
    width,
    height,
    batesString.length,
    margins
  );

  // Get color
  const color = config.fontColor || APP_CONFIG.bates.font.color;

  // Draw text
  page.drawText(batesString, {
    x: position.x,
    y: position.y,
    size: fontSize,
    font: font,
    color: rgb(color.r, color.g, color.b)
  });
}

/**
 * Calculate Bates number position
 * @param {string} position - Position identifier
 * @param {number} width - Page width
 * @param {number} height - Page height
 * @param {number} textLength - Text length in characters
 * @param {Object} margins - Margin settings
 * @returns {Object} { x, y } coordinates
 */
function calculateBatesPosition(position, width, height, textLength, margins) {
  const textWidth = textLength * margins.characterWidth;
  let x = margins.x;
  let y = margins.y;

  switch (position) {
    case 'bottom-right':
      x = width - textWidth - margins.x;
      y = margins.y;
      break;
    case 'bottom-left':
      x = margins.x;
      y = margins.y;
      break;
    case 'top-right':
      x = width - textWidth - margins.x;
      y = height - margins.y - 10;
      break;
    case 'top-left':
      x = margins.x;
      y = height - margins.y - 10;
      break;
    case 'bottom-center':
      x = (width - textWidth) / 2;
      y = margins.y;
      break;
    case 'top-center':
      x = (width - textWidth) / 2;
      y = height - margins.y - 10;
      break;
    default:
      x = width - textWidth - margins.x;
      y = margins.y;
  }

  return { x, y };
}

/**
 * Add metadata to page
 * @param {PDFPage} page - PDF page
 * @param {Object} row - Row data
 * @param {Object} config - Configuration
 * @param {Object} font - Font object
 */
function addMetadata(page, row, config, font) {
  if (!row.id && !row.date) return;

  const { width, height } = page.getSize();
  const metadataText = `Doc: ${row.id || 'N/A'} | Date: ${row.date}`;
  const fontSize = APP_CONFIG.metadata.font.size;
  const color = APP_CONFIG.metadata.font.color;
  const positions = APP_CONFIG.metadata.positions;

  // Position opposite to Bates
  const metadataX = config.position.includes('right')
    ? positions.offsetX / 10
    : width - positions.offsetX;

  const metadataY = config.position.includes('bottom')
    ? height - positions.offsetY
    : positions.bottomOffsetY;

  page.drawText(metadataText, {
    x: metadataX,
    y: metadataY,
    size: fontSize,
    font: font,
    color: rgb(color.r, color.g, color.b)
  });
}

/**
 * Sort rows according to configuration
 * @param {Array} rows - Rows to sort
 * @param {Object} config - Configuration
 * @returns {Array} Sorted rows
 */
function sortRows(rows, config) {
  const priorityOrder = APP_CONFIG.processing.priorityOrder;

  return [...rows].sort((a, b) => {
    // Priority sorting (if enabled)
    if (config.priorityTrades) {
      const aPriority = priorityOrder[a.priority?.toLowerCase()] ?? priorityOrder.normal;
      const bPriority = priorityOrder[b.priority?.toLowerCase()] ?? priorityOrder.normal;
      if (aPriority !== bPriority) return aPriority - bPriority;
    }

    // Date sorting
    if (a.date !== b.date) return a.date.localeCompare(b.date);

    // Settlement date sorting
    if (a.settlement_date !== b.settlement_date) {
      return a.settlement_date.localeCompare(b.settlement_date);
    }

    // ID sorting
    if (a.id && b.id && a.id !== b.id) {
      return a.id.localeCompare(b.id);
    }

    // Page number sorting
    return parseInt(a.page_number) - parseInt(b.page_number);
  });
}

/**
 * Group documents according to strategy
 * @param {Array} data - Document data
 * @param {string} groupBy - Grouping strategy
 * @param {Object} sourceFiles - Available source files
 * @param {Function} logCallback - Logging callback
 * @returns {Object} Grouped data
 */
export function groupDocuments(data, groupBy, sourceFiles, logCallback) {
  const groups = {};

  data.forEach((row) => {
    // Skip if source file not available
    if (!sourceFiles[row.source_file]) {
      logCallback(`⚠️  Skipping: '${row.source_file}' not found`);
      return;
    }

    // Determine group key
    let groupKey = determineGroupKey(row, groupBy);

    // Sanitize group key
    groupKey = groupKey.replace(/[^a-z0-9\-_]/gi, '_');

    // Add to group
    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(row);
  });

  return groups;
}

/**
 * Determine group key based on strategy
 * @param {Object} row - Document row
 * @param {string} groupBy - Grouping strategy
 * @returns {string} Group key
 */
function determineGroupKey(row, groupBy) {
  switch (groupBy) {
    case 'date_type':
      return `${row.date}_${row.type}`;
    case 'date':
      return `${row.date}`;
    case 'type':
      return `${row.type}`;
    case 'settlement_date':
      return `Settlement_${row.settlement_date}`;
    case 'daily_batch':
      const dateOnly = row.date.split('T')[0].split(' ')[0];
      return `DOCS_${dateOnly}`;
    case 'asset_class':
      return `${row.asset_class}`;
    case 'counterparty':
      return `${row.counterparty}`;
    case 'none':
      return 'ALL_DOCUMENTS';
    default:
      return 'ALL_DOCUMENTS';
  }
}

export default {
  processDocumentsBatched,
  groupDocuments,
  sortRows
};
