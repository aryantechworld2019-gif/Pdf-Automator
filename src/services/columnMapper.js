/**
 * Dynamic Column Mapping Service
 * Allows users to map their custom Excel column names
 */

import { COLUMN_MAPPINGS, getColumnValue, normalizeRow } from '../config/columnMappings';
import { APP_CONFIG } from '../config/appConfig';

const CUSTOM_MAPPINGS_KEY = 'custom_column_mappings_v1';

/**
 * Field definitions with descriptions
 */
export const FIELD_DEFINITIONS = {
  sourceFile: {
    label: 'Source File Name',
    description: 'The PDF filename (e.g., "document.pdf")',
    required: true,
    example: 'contract_001.pdf',
    defaultNames: COLUMN_MAPPINGS.sourceFile
  },
  pageNumber: {
    label: 'Page Number',
    description: 'Page number to extract (1-based)',
    required: true,
    example: '1, 2, 3...',
    defaultNames: COLUMN_MAPPINGS.pageNumber
  },
  date: {
    label: 'Primary Date',
    description: 'Main date field (trade date, document date, etc.)',
    required: true,
    example: '2024-01-15',
    defaultNames: COLUMN_MAPPINGS.date
  },
  type: {
    label: 'Document Type',
    description: 'Category or type of document',
    required: true,
    example: 'Invoice, Contract, Report',
    defaultNames: COLUMN_MAPPINGS.type
  },
  settlementDate: {
    label: 'Settlement Date',
    description: 'Secondary date field (optional)',
    required: false,
    example: '2024-01-17',
    defaultNames: COLUMN_MAPPINGS.settlementDate
  },
  assetClass: {
    label: 'Asset Class / Category',
    description: 'Asset type or classification (optional)',
    required: false,
    example: 'Equity, Bond, Real Estate',
    defaultNames: COLUMN_MAPPINGS.assetClass
  },
  counterparty: {
    label: 'Counterparty / Vendor',
    description: 'Other party name (optional)',
    required: false,
    example: 'Company Name',
    defaultNames: COLUMN_MAPPINGS.counterparty
  },
  id: {
    label: 'Document ID',
    description: 'Unique identifier (optional)',
    required: false,
    example: 'DOC-12345',
    defaultNames: COLUMN_MAPPINGS.id
  },
  value: {
    label: 'Monetary Value',
    description: 'Dollar amount or value (optional)',
    required: false,
    example: '150000',
    defaultNames: COLUMN_MAPPINGS.value
  },
  priority: {
    label: 'Priority Level',
    description: 'Urgency level (optional)',
    required: false,
    example: 'urgent, high, normal, low',
    defaultNames: COLUMN_MAPPINGS.priority
  }
};

/**
 * Get custom column mappings from localStorage
 * @returns {Object} Custom mappings
 */
export function getCustomMappings() {
  try {
    const stored = localStorage.getItem(CUSTOM_MAPPINGS_KEY);
    if (!stored) return {};

    const parsed = JSON.parse(stored);
    return parsed.mappings || {};
  } catch (error) {
    console.error('Failed to load custom mappings:', error);
    return {};
  }
}

/**
 * Save custom column mappings to localStorage
 * @param {Object} mappings - Custom mappings object
 * @returns {boolean} Success status
 */
export function saveCustomMappings(mappings) {
  try {
    const data = {
      version: '1.0',
      timestamp: new Date().toISOString(),
      mappings
    };

    localStorage.setItem(CUSTOM_MAPPINGS_KEY, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error('Failed to save custom mappings:', error);
    return false;
  }
}

/**
 * Add a custom column name for a field
 * @param {string} fieldKey - Field key (e.g., 'sourceFile')
 * @param {string} columnName - Custom column name
 * @returns {boolean} Success status
 */
export function addCustomMapping(fieldKey, columnName) {
  if (!FIELD_DEFINITIONS[fieldKey]) {
    console.error(`Unknown field: ${fieldKey}`);
    return false;
  }

  if (!columnName || columnName.trim() === '') {
    console.error('Column name cannot be empty');
    return false;
  }

  const customMappings = getCustomMappings();

  if (!customMappings[fieldKey]) {
    customMappings[fieldKey] = [];
  }

  // Avoid duplicates
  const normalized = columnName.trim();
  if (!customMappings[fieldKey].includes(normalized)) {
    customMappings[fieldKey].push(normalized);
  }

  return saveCustomMappings(customMappings);
}

/**
 * Remove a custom column name
 * @param {string} fieldKey - Field key
 * @param {string} columnName - Column name to remove
 * @returns {boolean} Success status
 */
export function removeCustomMapping(fieldKey, columnName) {
  const customMappings = getCustomMappings();

  if (!customMappings[fieldKey]) return true;

  customMappings[fieldKey] = customMappings[fieldKey].filter(
    name => name !== columnName
  );

  return saveCustomMappings(customMappings);
}

/**
 * Clear all custom mappings
 * @returns {boolean} Success status
 */
export function clearAllCustomMappings() {
  localStorage.removeItem(CUSTOM_MAPPINGS_KEY);
  return true;
}

/**
 * Get combined mappings (default + custom)
 * @param {string} fieldKey - Field key
 * @returns {Array} Combined array of column names
 */
export function getCombinedMappings(fieldKey) {
  const defaultMappings = COLUMN_MAPPINGS[fieldKey] || [];
  const customMappings = getCustomMappings();
  const custom = customMappings[fieldKey] || [];

  // Combine and remove duplicates
  return [...new Set([...defaultMappings, ...custom])];
}

/**
 * Detect Excel columns from first row
 * @param {Object} firstRow - First data row from Excel
 * @returns {Array} Array of column names
 */
export function detectExcelColumns(firstRow) {
  if (!firstRow) return [];
  return Object.keys(firstRow);
}

/**
 * Auto-map Excel columns to fields
 * @param {Array} excelColumns - Excel column names
 * @returns {Object} Suggested mappings { fieldKey: excelColumn }
 */
export function autoMapColumns(excelColumns) {
  const suggestions = {};

  Object.keys(FIELD_DEFINITIONS).forEach(fieldKey => {
    const possibleNames = getCombinedMappings(fieldKey);

    // Find first match
    for (const excelCol of excelColumns) {
      const normalized = excelCol.toLowerCase().trim();

      for (const possible of possibleNames) {
        if (normalized === possible.toLowerCase().trim()) {
          suggestions[fieldKey] = excelCol;
          break;
        }
      }

      if (suggestions[fieldKey]) break;
    }
  });

  return suggestions;
}

/**
 * Validate column mappings
 * @param {Object} mappings - { fieldKey: excelColumn }
 * @param {Array} excelColumns - Available Excel columns
 * @returns {Object} { valid, errors, warnings }
 */
export function validateMappings(mappings, excelColumns) {
  const errors = [];
  const warnings = [];

  // Check required fields
  Object.keys(FIELD_DEFINITIONS).forEach(fieldKey => {
    const field = FIELD_DEFINITIONS[fieldKey];

    if (field.required && !mappings[fieldKey]) {
      errors.push(`Required field missing: ${field.label}`);
    }

    if (mappings[fieldKey] && !excelColumns.includes(mappings[fieldKey])) {
      errors.push(`Mapped column "${mappings[fieldKey]}" not found in Excel`);
    }
  });

  // Check for duplicate mappings
  const usedColumns = new Set();
  Object.values(mappings).forEach(col => {
    if (usedColumns.has(col)) {
      warnings.push(`Column "${col}" is mapped to multiple fields`);
    }
    usedColumns.add(col);
  });

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Apply custom mappings to normalize row
 * @param {Object} row - Raw Excel row
 * @param {Object} customMappings - { fieldKey: excelColumn }
 * @returns {Object} Normalized row
 */
export function normalizeRowWithCustomMappings(row, customMappings = null) {
  // If no custom mappings, use default normalization
  if (!customMappings || Object.keys(customMappings).length === 0) {
    return normalizeRow(row);
  }

  // Build a temporary row with mapped column names
  const mappedRow = {};

  Object.keys(customMappings).forEach(fieldKey => {
    const excelColumn = customMappings[fieldKey];
    if (row[excelColumn] !== undefined) {
      // Map to the first default column name for this field
      const defaultName = COLUMN_MAPPINGS[fieldKey]?.[0];
      if (defaultName) {
        mappedRow[defaultName] = row[excelColumn];
      }
    }
  });

  // Merge with original row (custom mappings take precedence)
  const combined = { ...row, ...mappedRow };

  // Use standard normalization
  return normalizeRow(combined);
}

/**
 * Export mappings to JSON file
 * @param {Object} mappings - Mappings to export
 * @returns {Blob} JSON blob
 */
export function exportMappings(mappings) {
  const exportData = {
    app: APP_CONFIG.branding.appName,
    version: APP_CONFIG.branding.version,
    exportDate: new Date().toISOString(),
    type: 'column_mappings',
    mappings,
    fieldDefinitions: FIELD_DEFINITIONS
  };

  const json = JSON.stringify(exportData, null, 2);
  return new Blob([json], { type: 'application/json' });
}

/**
 * Import mappings from JSON file
 * @param {File} file - JSON file
 * @returns {Promise<Object>} Import result
 */
export async function importMappings(file) {
  try {
    const text = await file.text();
    const data = JSON.parse(text);

    if (data.type !== 'column_mappings') {
      throw new Error('Invalid file type');
    }

    return {
      success: true,
      mappings: data.mappings,
      metadata: {
        app: data.app,
        version: data.version,
        exportDate: data.exportDate
      }
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Get mapping presets for common formats
 */
export const MAPPING_PRESETS = {
  trading: {
    name: 'Trading Documents',
    description: 'Standard trading/financial documents',
    mappings: {
      sourceFile: 'Trade Confirmation File',
      pageNumber: 'Page',
      date: 'Trade Date',
      type: 'Trade Type',
      settlementDate: 'Settlement Date',
      assetClass: 'Asset Class',
      counterparty: 'Broker',
      id: 'Trade ID',
      value: 'Notional Value',
      priority: 'Priority'
    }
  },
  legal: {
    name: 'Legal Documents',
    description: 'Legal contracts and agreements',
    mappings: {
      sourceFile: 'Document File',
      pageNumber: 'Page Number',
      date: 'Execution Date',
      type: 'Document Type',
      counterparty: 'Party Name',
      id: 'Contract Number',
      priority: 'Urgency'
    }
  },
  invoices: {
    name: 'Invoices & Billing',
    description: 'Invoice and billing documents',
    mappings: {
      sourceFile: 'Invoice File',
      pageNumber: 'Page',
      date: 'Invoice Date',
      type: 'Invoice Type',
      counterparty: 'Vendor',
      id: 'Invoice Number',
      value: 'Amount',
      priority: 'Payment Priority'
    }
  },
  general: {
    name: 'General Documents',
    description: 'Generic document processing',
    mappings: {
      sourceFile: 'Filename',
      pageNumber: 'Page',
      date: 'Date',
      type: 'Type',
      id: 'ID'
    }
  }
};

export default {
  getCustomMappings,
  saveCustomMappings,
  addCustomMapping,
  removeCustomMapping,
  clearAllCustomMappings,
  getCombinedMappings,
  detectExcelColumns,
  autoMapColumns,
  validateMappings,
  normalizeRowWithCustomMappings,
  exportMappings,
  importMappings,
  FIELD_DEFINITIONS,
  MAPPING_PRESETS
};
