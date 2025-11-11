/**
 * Page Range Parser Utility
 * Handles Excel page range formats like "3-5", "6-14", "15", "44", etc.
 * Expands ranges into individual page numbers
 */

/**
 * Parse a page range string and return array of individual page numbers
 * @param {string|number} rangeStr - Page range (e.g., "3-5", "15", 44)
 * @returns {number[]} Array of page numbers
 *
 * Examples:
 * - "3-5" → [3, 4, 5]
 * - "6-14" → [6, 7, 8, 9, 10, 11, 12, 13, 14]
 * - "15" → [15]
 * - 44 → [44]
 * - "20-22" → [20, 21, 22]
 */
export function parsePageRange(rangeStr) {
  if (!rangeStr) {
    return [];
  }

  // Convert to string and trim
  const str = String(rangeStr).trim();

  // Handle empty or invalid
  if (!str || str === '') {
    return [];
  }

  // Check if it's a range (contains hyphen/dash)
  if (str.includes('-')) {
    return parseRangeWithHyphen(str);
  }

  // Single page number
  const pageNum = parseInt(str);
  if (isNaN(pageNum) || pageNum <= 0) {
    console.warn(`Invalid page number: ${str}`);
    return [];
  }

  return [pageNum];
}

/**
 * Parse range with hyphen (e.g., "3-5")
 * @param {string} rangeStr - Range string
 * @returns {number[]} Array of page numbers
 */
function parseRangeWithHyphen(rangeStr) {
  // Split by hyphen or en-dash or em-dash
  const parts = rangeStr.split(/[-–—]/);

  if (parts.length !== 2) {
    console.warn(`Invalid range format: ${rangeStr}`);
    return [];
  }

  const start = parseInt(parts[0].trim());
  const end = parseInt(parts[1].trim());

  if (isNaN(start) || isNaN(end)) {
    console.warn(`Invalid range numbers: ${rangeStr}`);
    return [];
  }

  if (start <= 0 || end <= 0) {
    console.warn(`Page numbers must be positive: ${rangeStr}`);
    return [];
  }

  if (start > end) {
    console.warn(`Invalid range (start > end): ${rangeStr}`);
    return [];
  }

  // Generate array of page numbers
  const pages = [];
  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  return pages;
}

/**
 * Expand an Excel row with page range into multiple rows with individual pages
 * @param {Object} row - Excel row with page range
 * @param {string} pageColumnName - Name of the page number column
 * @returns {Object[]} Array of expanded rows (one per page)
 *
 * Example:
 * Input: { date: "6/7/2024", title: "Lab Report", page: "3-5" }
 * Output: [
 *   { date: "6/7/2024", title: "Lab Report", page: 3 },
 *   { date: "6/7/2024", title: "Lab Report", page: 4 },
 *   { date: "6/7/2024", title: "Lab Report", page: 5 }
 * ]
 */
export function expandRowWithPageRange(row, pageColumnName = 'page_number') {
  if (!row || !row[pageColumnName]) {
    return [row];
  }

  const pageRange = row[pageColumnName];
  const pageNumbers = parsePageRange(pageRange);

  if (pageNumbers.length === 0) {
    // No valid pages, return empty array
    return [];
  }

  if (pageNumbers.length === 1) {
    // Single page, just update the value
    return [{
      ...row,
      [pageColumnName]: pageNumbers[0]
    }];
  }

  // Multiple pages, create one row per page
  return pageNumbers.map(pageNum => ({
    ...row,
    [pageColumnName]: pageNum
  }));
}

/**
 * Expand all rows in dataset that contain page ranges
 * @param {Object[]} rows - Array of Excel rows
 * @param {string} pageColumnName - Name of the page number column
 * @returns {Object[]} Expanded array of rows
 *
 * Example:
 * Input: 18 rows with ranges
 * Output: ~70 rows with individual pages
 */
export function expandAllPageRanges(rows, pageColumnName = 'page_number') {
  if (!rows || !Array.isArray(rows)) {
    return [];
  }

  const expandedRows = [];

  rows.forEach(row => {
    const expanded = expandRowWithPageRange(row, pageColumnName);
    expandedRows.push(...expanded);
  });

  return expandedRows;
}

/**
 * Validate page range format
 * @param {string|number} rangeStr - Page range string
 * @returns {Object} { valid: boolean, message: string, pages: number[] }
 */
export function validatePageRange(rangeStr) {
  try {
    const pages = parsePageRange(rangeStr);

    if (pages.length === 0) {
      return {
        valid: false,
        message: `Invalid page range: "${rangeStr}"`,
        pages: []
      };
    }

    if (pages.length === 1) {
      return {
        valid: true,
        message: `Single page: ${pages[0]}`,
        pages: pages
      };
    }

    return {
      valid: true,
      message: `Range: ${pages[0]}-${pages[pages.length - 1]} (${pages.length} pages)`,
      pages: pages
    };
  } catch (error) {
    return {
      valid: false,
      message: `Error parsing range: ${error.message}`,
      pages: []
    };
  }
}

/**
 * Get statistics about page ranges in dataset
 * @param {Object[]} rows - Excel rows
 * @param {string} pageColumnName - Page column name
 * @returns {Object} Statistics
 */
export function getPageRangeStats(rows, pageColumnName = 'page_number') {
  if (!rows || rows.length === 0) {
    return {
      totalRows: 0,
      totalPages: 0,
      ranges: 0,
      singles: 0,
      invalid: 0
    };
  }

  let totalPages = 0;
  let ranges = 0;
  let singles = 0;
  let invalid = 0;

  rows.forEach(row => {
    const pageRange = row[pageColumnName];
    const pages = parsePageRange(pageRange);

    if (pages.length === 0) {
      invalid++;
    } else if (pages.length === 1) {
      singles++;
      totalPages += 1;
    } else {
      ranges++;
      totalPages += pages.length;
    }
  });

  return {
    totalRows: rows.length,
    totalPages,
    ranges,
    singles,
    invalid
  };
}

/**
 * Detect if Excel data contains page ranges
 * @param {Object[]} rows - Excel rows
 * @param {string} pageColumnName - Page column name
 * @returns {boolean} True if ranges detected
 */
export function hasPageRanges(rows, pageColumnName = 'page_number') {
  if (!rows || rows.length === 0) {
    return false;
  }

  return rows.some(row => {
    const pageRange = String(row[pageColumnName] || '').trim();
    return pageRange.includes('-');
  });
}

export default {
  parsePageRange,
  expandRowWithPageRange,
  expandAllPageRanges,
  validatePageRange,
  getPageRangeStats,
  hasPageRanges
};
