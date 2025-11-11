/**
 * File Writer Service
 * Handles ZIP creation and file downloads
 */

import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { exportToExcel } from './excelParser';
import { generateSummaryReport } from './reportGenerator';
import { APP_CONFIG } from '../config/appConfig';

/**
 * Create ZIP file with all processed documents
 * @param {Map} processedPDFs - Map of group keys to PDF bytes
 * @param {Array} data - Original data array
 * @param {Object} config - Configuration
 * @param {Object} stats - Statistics
 * @param {number} processingTime - Processing time in ms
 * @returns {Promise<Blob>} ZIP file blob
 */
export async function createZipArchive(processedPDFs, data, config, stats, processingTime) {
  const zip = new JSZip();

  // Add processed PDFs
  for (const [groupKey, pdfBytes] of processedPDFs) {
    zip.file(`${groupKey}.pdf`, pdfBytes);
  }

  // Generate and add manifest
  const manifestBuffer = exportToExcel(data, config);
  zip.file(APP_CONFIG.outputFiles.manifestName, manifestBuffer);

  // Generate and add summary report
  const totalPages = Array.from(processedPDFs.values())
    .reduce((sum, _) => sum + 1, 0);

  const summaryText = generateSummaryReport(
    Object.fromEntries(processedPDFs.entries()),
    data.length,
    stats,
    config,
    processingTime
  );

  zip.file(APP_CONFIG.outputFiles.summaryName, summaryText);

  // Generate ZIP
  const zipBlob = await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: {
      level: 6 // Balance between size and speed
    }
  });

  return zipBlob;
}

/**
 * Save ZIP file (Electron or Browser)
 * @param {Blob} zipBlob - ZIP file blob
 * @param {string} fileName - Default filename
 * @returns {Promise<Object>} { success, path/error }
 */
export async function saveZipFile(zipBlob, fileName) {
  const isElectron = window.electronAPI !== undefined;

  if (isElectron) {
    // Use native Electron save dialog
    return await saveZipElectron(zipBlob, fileName);
  } else {
    // Use browser download
    return saveZipBrowser(zipBlob, fileName);
  }
}

/**
 * Save ZIP using Electron native dialog
 * @param {Blob} zipBlob - ZIP blob
 * @param {string} fileName - Default filename
 * @returns {Promise<Object>} Result
 */
async function saveZipElectron(zipBlob, fileName) {
  try {
    const savePath = await window.electronAPI.saveZipDialog(fileName);

    if (!savePath) {
      return { success: false, canceled: true };
    }

    // Convert blob to base64
    const base64 = await blobToBase64(zipBlob);

    // Write file
    const result = await window.electronAPI.writeFile(savePath, base64);

    if (result.success) {
      await window.electronAPI.showNotification(
        'File Saved',
        'Documents saved successfully'
      );

      return { success: true, path: savePath };
    } else {
      return { success: false, error: result.error };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Save ZIP using browser download
 * @param {Blob} zipBlob - ZIP blob
 * @param {string} fileName - Filename
 * @returns {Object} Result
 */
function saveZipBrowser(zipBlob, fileName) {
  try {
    saveAs(zipBlob, fileName);
    return { success: true };
  } catch (error) {
    // Fallback method
    try {
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      return { success: true };
    } catch (fallbackError) {
      return { success: false, error: fallbackError.message };
    }
  }
}

/**
 * Convert Blob to base64
 * @param {Blob} blob - Blob object
 * @returns {Promise<string>} Base64 string (without data URL prefix)
 */
function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Generate default ZIP filename
 * @returns {string} Filename
 */
export function generateDefaultFilename() {
  const date = new Date();
  const dateStr = date.toISOString().split('T')[0];
  return `${APP_CONFIG.outputFiles.zipPrefix}_${dateStr}.zip`;
}

/**
 * Estimate ZIP size
 * @param {Map} processedPDFs - Processed PDFs
 * @returns {number} Estimated size in bytes
 */
export function estimateZipSize(processedPDFs) {
  let totalSize = 0;

  for (const pdfBytes of processedPDFs.values()) {
    totalSize += pdfBytes.length;
  }

  // Account for compression (roughly 80% of original)
  return Math.floor(totalSize * 0.8);
}

/**
 * Format file size for display
 * @param {number} bytes - Size in bytes
 * @returns {string} Formatted size
 */
export function formatFileSize(bytes) {
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(1)} ${units[unitIndex]}`;
}

export default {
  createZipArchive,
  saveZipFile,
  generateDefaultFilename,
  estimateZipSize,
  formatFileSize
};
