/**
 * Excel Column Mapping Configuration
 * Define all possible column name variations here
 * Easy to add new mappings without touching code
 */

export const COLUMN_MAPPINGS = {
  // Source PDF file name
  sourceFile: [
    'source_file',
    'Source File',
    'filename',
    'File Name',
    'file_name',
    'pdf_file',
    'PDF File',
    'document',
    'Document',
    'source',
    'Source'
  ],

  // Page number within PDF
  pageNumber: [
    'page_number',
    'Page Number',
    'page',
    'Page',
    'pg',
    'Pg',
    'page_num',
    'pagenum',
    'PageNum'
  ],

  // Primary date field
  date: [
    'date',
    'Date',
    'Date (MM/DD/',
    'Date (MM/DD/YYYY)',
    'Date (MM/DD/YY)',
    'trade_date',
    'Trade Date',
    'document_date',
    'Document Date',
    'report_date',
    'Report Date',
    'created_date',
    'Date Created',
    'transaction_date',
    'Transaction Date'
  ],

  // Settlement/completion date
  settlementDate: [
    'settlement_date',
    'Settlement Date',
    'settle_date',
    'Settle Date',
    'completion_date',
    'Completion Date',
    'due_date',
    'Due Date',
    'maturity_date',
    'Maturity Date'
  ],

  // Document type/category
  type: [
    'type',
    'Type',
    'Document Title',
    'Document Title (As per Image)',
    'Title',
    'title',
    'trade_type',
    'Trade Type',
    'document_type',
    'Document Type',
    'category',
    'Category',
    'classification',
    'Classification',
    'doc_type',
    'DocType'
  ],

  // Asset class or category
  assetClass: [
    'asset_class',
    'Asset Class',
    'asset',
    'Asset',
    'security_type',
    'Security Type',
    'instrument',
    'Instrument',
    'product',
    'Product',
    'asset_type',
    'AssetType'
  ],

  // Counterparty/broker/dealer
  counterparty: [
    'counterparty',
    'Counterparty',
    'broker',
    'Broker',
    'dealer',
    'Dealer',
    'vendor',
    'Vendor',
    'supplier',
    'Supplier',
    'party',
    'Party',
    'firm',
    'Firm'
  ],

  // Unique identifier
  id: [
    'id',
    'ID',
    'trade_id',
    'Trade ID',
    'transaction_id',
    'Transaction ID',
    'document_id',
    'Document ID',
    'reference',
    'Reference',
    'ref',
    'Ref',
    'number',
    'Number',
    'doc_number',
    'DocNumber'
  ],

  // Monetary value
  value: [
    'value',
    'Value',
    'trade_value',
    'Trade Value',
    'amount',
    'Amount',
    'notional',
    'Notional',
    'principal',
    'Principal',
    'price',
    'Price',
    'total',
    'Total'
  ],

  // Priority level
  priority: [
    'priority',
    'Priority',
    'urgency',
    'Urgency',
    'importance',
    'Importance',
    'level',
    'Level',
    'urgent',
    'Urgent'
  ],

  // Additional custom fields
  customField1: [
    'custom1',
    'Custom 1',
    'custom_field_1',
    'field1'
  ],

  customField2: [
    'custom2',
    'Custom 2',
    'custom_field_2',
    'field2'
  ],

  customField3: [
    'custom3',
    'Custom 3',
    'custom_field_3',
    'field3'
  ]
};

/**
 * Get value from row using column mapping
 * @param {Object} row - Excel row data
 * @param {string} mappingKey - Key from COLUMN_MAPPINGS
 * @param {*} defaultValue - Default value if not found
 * @returns {*} Found value or default
 */
export function getColumnValue(row, mappingKey, defaultValue = '') {
  const possibleNames = COLUMN_MAPPINGS[mappingKey];

  if (!possibleNames) {
    console.warn(`Unknown mapping key: ${mappingKey}`);
    return defaultValue;
  }

  for (const name of possibleNames) {
    if (row[name] !== undefined && row[name] !== null && row[name] !== '') {
      return row[name];
    }
  }

  return defaultValue;
}

/**
 * Normalize Excel row data using column mappings
 * @param {Object} row - Raw Excel row
 * @returns {Object} Normalized row data
 */
export function normalizeRow(row) {
  return {
    source_file: getColumnValue(row, 'sourceFile'),
    page_number: parseInt(getColumnValue(row, 'pageNumber', 1)),
    date: getColumnValue(row, 'date', 'Unknown Date'),
    settlement_date: getColumnValue(row, 'settlementDate', getColumnValue(row, 'date', '')),
    type: getColumnValue(row, 'type', 'General'),
    asset_class: getColumnValue(row, 'assetClass', 'Other'),
    counterparty: getColumnValue(row, 'counterparty', 'Unknown'),
    id: getColumnValue(row, 'id', ''),
    value: parseFloat(getColumnValue(row, 'value', 0)),
    priority: getColumnValue(row, 'priority', 'normal'),
    document_type: getColumnValue(row, 'type', 'Document'),
    custom1: getColumnValue(row, 'customField1', ''),
    custom2: getColumnValue(row, 'customField2', ''),
    custom3: getColumnValue(row, 'customField3', '')
  };
}

/**
 * Validate normalized row data
 * @param {Object} row - Normalized row
 * @returns {Object} { valid: boolean, errors: string[] }
 */
export function validateRow(row) {
  const errors = [];

  // Source file is optional for single PDF mode (will be assigned when PDF is uploaded)
  // No validation needed - can be missing, empty, or "__PENDING__"

  if (!row.page_number || row.page_number < 1) {
    errors.push('Invalid page number (must be >= 1)');
  }

  if (!row.date || row.date === 'Unknown Date') {
    errors.push('Missing or invalid date');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

export default COLUMN_MAPPINGS;
