/**
 * Settings Manager
 * Handles saving, loading, importing, and exporting user settings
 */

import { APP_CONFIG } from '../config/appConfig';

const SETTINGS_KEY = 'app_settings_v2';

/**
 * Get default settings
 * @returns {Object} Default configuration
 */
export function getDefaultSettings() {
  return {
    batesPrefix: APP_CONFIG.bates.defaultPrefix,
    startNumber: APP_CONFIG.bates.defaultStartNumber,
    digits: APP_CONFIG.bates.defaultDigits,
    position: APP_CONFIG.bates.defaultPosition,
    fontSize: APP_CONFIG.bates.font.size,
    fontColor: APP_CONFIG.bates.font.color,
    groupBy: APP_CONFIG.processing.defaultGroupBy,
    marketMode: APP_CONFIG.processing.defaultMode,
    priorityTrades: APP_CONFIG.processing.enablePriorityProcessing,
    metadataEnabled: APP_CONFIG.metadata.enabled,
    theme: APP_CONFIG.theme.mode,
    currency: APP_CONFIG.formatting.currency.symbol,
    dateFormat: APP_CONFIG.formatting.date.format
  };
}

/**
 * Save settings to localStorage
 * @param {Object} settings - Settings to save
 * @returns {boolean} Success status
 */
export function saveSettings(settings) {
  try {
    const settingsData = {
      version: APP_CONFIG.branding.version,
      timestamp: new Date().toISOString(),
      settings
    };

    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settingsData));
    return true;
  } catch (error) {
    console.error('Failed to save settings:', error);
    return false;
  }
}

/**
 * Load settings from localStorage
 * @returns {Object} Loaded settings or defaults
 */
export function loadSettings() {
  try {
    const stored = localStorage.getItem(SETTINGS_KEY);

    if (!stored) {
      return getDefaultSettings();
    }

    const settingsData = JSON.parse(stored);

    // Validate version compatibility
    if (settingsData.version !== APP_CONFIG.branding.version) {
      console.warn('Settings version mismatch, using defaults');
      return getDefaultSettings();
    }

    // Merge with defaults to handle new settings
    return {
      ...getDefaultSettings(),
      ...settingsData.settings
    };

  } catch (error) {
    console.error('Failed to load settings:', error);
    return getDefaultSettings();
  }
}

/**
 * Export settings to JSON file
 * @param {Object} settings - Settings to export
 * @param {string} fileName - Output filename
 * @returns {Blob} Settings file blob
 */
export function exportSettings(settings, fileName = 'app-settings.json') {
  const exportData = {
    app: APP_CONFIG.branding.appName,
    version: APP_CONFIG.branding.version,
    exportDate: new Date().toISOString(),
    settings
  };

  const json = JSON.stringify(exportData, null, 2);
  return new Blob([json], { type: 'application/json' });
}

/**
 * Import settings from JSON file
 * @param {File} file - JSON file to import
 * @returns {Promise<Object>} Imported settings
 */
export async function importSettings(file) {
  try {
    const text = await file.text();
    const importData = JSON.parse(text);

    // Validate import data
    if (!importData.settings) {
      throw new Error('Invalid settings file format');
    }

    // Check app compatibility
    if (importData.app !== APP_CONFIG.branding.appName) {
      console.warn('Settings from different app, proceeding with caution');
    }

    // Merge with defaults
    const settings = {
      ...getDefaultSettings(),
      ...importData.settings
    };

    return {
      success: true,
      settings,
      metadata: {
        app: importData.app,
        version: importData.version,
        exportDate: importData.exportDate
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
 * Reset settings to defaults
 * @returns {Object} Default settings
 */
export function resetSettings() {
  localStorage.removeItem(SETTINGS_KEY);
  return getDefaultSettings();
}

/**
 * Get recent settings history
 * @returns {Array} Array of recent settings
 */
export function getSettingsHistory() {
  try {
    const history = localStorage.getItem(`${SETTINGS_KEY}_history`);
    return history ? JSON.parse(history) : [];
  } catch {
    return [];
  }
}

/**
 * Save to settings history
 * @param {Object} settings - Settings to save to history
 */
export function saveToHistory(settings) {
  try {
    const history = getSettingsHistory();

    history.unshift({
      timestamp: new Date().toISOString(),
      settings
    });

    // Keep only last 10
    const trimmedHistory = history.slice(0, 10);

    localStorage.setItem(`${SETTINGS_KEY}_history`, JSON.stringify(trimmedHistory));
  } catch (error) {
    console.error('Failed to save to history:', error);
  }
}

/**
 * Auto-save settings with debounce
 * @param {Object} settings - Settings to auto-save
 */
let autoSaveTimeout = null;
export function autoSaveSettings(settings) {
  if (!APP_CONFIG.features.enableAutoSave) return;

  clearTimeout(autoSaveTimeout);
  autoSaveTimeout = setTimeout(() => {
    saveSettings(settings);
  }, 1000); // Save after 1 second of inactivity
}

export default {
  getDefaultSettings,
  saveSettings,
  loadSettings,
  exportSettings,
  importSettings,
  resetSettings,
  getSettingsHistory,
  saveToHistory,
  autoSaveSettings
};
