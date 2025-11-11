/**
 * Excel Parser Service
 * Handles Excel file reading and data normalization
 * NEW: Supports page range expansion (e.g., "3-5" → 3, 4, 5)
 */

import * as XLSX from 'xlsx';
import { normalizeRow, validateRow } from '../config/columnMappings';
import { APP_CONFIG } from '../config/appConfig';
import {
  hasPageRanges,
  expandAllPageRanges,
  getPageRangeStats
} from '../utils/pageRangeParser';

/**
 * Parse Excel file from base64 data
 * @param {string} base64Data - Base64 encoded Excel file
 * @param {string} fileName - Original file name
 * @returns {Promise<Object>} { success, data, errors, stats }
 */
export async function parseExcelFile(base64Data, fileName) {
  try {
    // Convert base64 to array buffer
    const binaryString = atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // Read workbook
    const workbook = XLSX.read(bytes, { type: 'array' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    let rawData = XLSX.utils.sheet_to_json(worksheet);

    // Check row limit before expansion
    if (rawData.length > APP_CONFIG.limits.maxExcelRows) {
      return {
        success: false,
        error: `Excel file contains ${rawData.length} rows, exceeding limit of ${APP_CONFIG.limits.maxExcelRows}`,
        data: [],
        stats: {}
      };
    }

    // Detect and expand page ranges (NEW!)
    let expandedFromRanges = false;
    let originalRowCount = rawData.length;
    let rangeStats = null;

    // Try to detect page number columns (check common variations)
    const possiblePageColumns = ['Page Number', 'page_number', 'page', 'Page', 'pg', 'Pg'];
    let pageColumnName = null;

    if (rawData.length > 0) {
      const firstRow = rawData[0];
      for (const colName of possiblePageColumns) {
        if (firstRow.hasOwnProperty(colName)) {
          pageColumnName = colName;
          break;
        }
      }
    }

    // If page ranges detected, expand them
    if (pageColumnName && hasPageRanges(rawData, pageColumnName)) {
      console.log(`📊 Page ranges detected! Expanding...`);
      rangeStats = getPageRangeStats(rawData, pageColumnName);
      rawData = expandAllPageRanges(rawData, pageColumnName);
      expandedFromRanges = true;
      console.log(`✨ Expanded ${originalRowCount} rows → ${rawData.length} rows`);
    }

    // Check row limit after expansion
    if (rawData.length > APP_CONFIG.limits.maxExcelRows) {
      return {
        success: false,
        error: `After expanding page ranges: ${rawData.length} rows, exceeding limit of ${APP_CONFIG.limits.maxExcelRows}`,
        data: [],
        stats: {}
      };
    }

    // Normalize and validate data
    const normalizedData = [];
    const errors = [];
    const validationIssues = [];

    for (let i = 0; i < rawData.length; i++) {
      const row = rawData[i];
      const normalized = normalizeRow(row);

      // Validate row
      const validation = validateRow(normalized);
      if (!validation.valid) {
        validationIssues.push({
          row: i + 2, // +2 because Excel rows start at 1 and we have header
          errors: validation.errors
        });
      } else {
        // Only add valid rows with source_file
        if (normalized.source_file) {
          normalizedData.push(normalized);
        }
      }
    }

    // Calculate statistics
    const stats = calculateStats(normalizedData);

    // Warn if over threshold
    if (normalizedData.length > APP_CONFIG.limits.warnThreshold) {
      console.warn(`Large dataset: ${normalizedData.length} rows. Performance may be impacted.`);
    }

    return {
      success: true,
      data: normalizedData,
      stats,
      validationIssues,
      fileName,
      rowCount: normalizedData.length,
      expandedFromRanges,
      originalRowCount: expandedFromRanges ? originalRowCount : normalizedData.length,
      rangeStats
    };

  } catch (error) {
    return {
      success: false,
      error: error.message,
      data: [],
      stats: {}
    };
  }
}

/**
 * Calculate statistics from parsed data
 * @param {Array} data - Normalized data array
 * @returns {Object} Statistics object
 */
function calculateStats(data) {
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
    // Sum values
    if (row.value && !isNaN(row.value)) {
      stats.totalValue += row.value;
    }

    // Collect unique categories
    if (row.type) stats.categories.add(row.type);
    if (row.asset_class) stats.assetClasses.add(row.asset_class);
    if (row.counterparty) stats.counterparties.add(row.counterparty);

    // Count priorities
    const priority = row.priority || 'normal';
    stats.priorities.set(priority, (stats.priorities.get(priority) || 0) + 1);

    // Track date range
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
}

/**
 * Export data to Excel format
 * @param {Array} data - Data to export
 * @param {Object} config - Configuration object
 * @returns {ArrayBuffer} Excel file buffer
 */
export function exportToExcel(data, config) {
  const exportData = data.map((row, index) => {
    const batesNum = String(config.startNumber + index).padStart(config.digits, '0');
    return {
      'Bates Number': `${config.batesPrefix}${batesNum}`,
      'Document ID': row.id,
      'Date': row.date,
      'Settlement Date': row.settlement_date,
      'Type': row.type,
      'Asset Class': row.asset_class,
      'Counterparty': row.counterparty,
      'Value': row.value,
      'Source File': row.source_file,
      'Page': row.page_number,
      'Priority': row.priority
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(exportData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Document Manifest");

  return XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
}

export default {
  parseExcelFile,
  calculateStats,
  exportToExcel
};
