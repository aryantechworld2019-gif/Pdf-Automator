/**
 * Column Mapping Modal Component
 * Allows users to map their Excel columns to required fields
 */

import React, { useState, useEffect } from 'react';
import { Settings, Check, AlertCircle, Download, Upload, X, Plus, Trash2 } from 'lucide-react';
import { Modal, Button, Select, Input, Badge, Alert, Tabs } from './index';
import {
  FIELD_DEFINITIONS,
  detectExcelColumns,
  autoMapColumns,
  validateMappings,
  getCustomMappings,
  addCustomMapping,
  removeCustomMapping,
  saveCustomMappings,
  getCombinedMappings,
  exportMappings,
  importMappings,
  MAPPING_PRESETS
} from '../services/columnMapper';
import { saveAs } from 'file-saver';

export default function ColumnMappingModal({ isOpen, onClose, firstRow, onMappingsConfirmed }) {
  const [activeTab, setActiveTab] = useState('auto');
  const [excelColumns, setExcelColumns] = useState([]);
  const [columnMappings, setColumnMappings] = useState({});
  const [validation, setValidation] = useState({ valid: true, errors: [], warnings: [] });
  const [customMappings, setCustomMappings] = useState({});
  const [newCustomName, setNewCustomName] = useState('');
  const [selectedFieldForCustom, setSelectedFieldForCustom] = useState('');

  // Initialize when modal opens
  useEffect(() => {
    if (isOpen && firstRow) {
      const columns = detectExcelColumns(firstRow);
      setExcelColumns(columns);

      // Try auto-mapping
      const autoMapped = autoMapColumns(columns);
      setColumnMappings(autoMapped);

      // Validate
      const result = validateMappings(autoMapped, columns);
      setValidation(result);

      // Load custom mappings
      setCustomMappings(getCustomMappings());
    }
  }, [isOpen, firstRow]);

  // Validate when mappings change
  useEffect(() => {
    if (excelColumns.length > 0) {
      const result = validateMappings(columnMappings, excelColumns);
      setValidation(result);
    }
  }, [columnMappings, excelColumns]);

  const handleMappingChange = (fieldKey, excelColumn) => {
    setColumnMappings(prev => ({
      ...prev,
      [fieldKey]: excelColumn
    }));
  };

  const handleConfirm = () => {
    if (validation.valid) {
      onMappingsConfirmed(columnMappings);
      onClose();
    }
  };

  const handleReset = () => {
    const autoMapped = autoMapColumns(excelColumns);
    setColumnMappings(autoMapped);
  };

  const handleAddCustomMapping = () => {
    if (selectedFieldForCustom && newCustomName.trim()) {
      addCustomMapping(selectedFieldForCustom, newCustomName.trim());
      setCustomMappings(getCustomMappings());
      setNewCustomName('');
      setSelectedFieldForCustom('');
    }
  };

  const handleRemoveCustomMapping = (fieldKey, columnName) => {
    removeCustomMapping(fieldKey, columnName);
    setCustomMappings(getCustomMappings());
  };

  const handleExportMappings = () => {
    const blob = exportMappings(columnMappings);
    saveAs(blob, 'column-mappings.json');
  };

  const handleImportMappings = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const result = await importMappings(file);
    if (result.success) {
      setColumnMappings(result.mappings);
      alert('Mappings imported successfully!');
    } else {
      alert(`Failed to import: ${result.error}`);
    }

    event.target.value = '';
  };

  const handleLoadPreset = (presetKey) => {
    const preset = MAPPING_PRESETS[presetKey];
    if (preset) {
      // Try to match preset columns to actual Excel columns
      const newMappings = {};

      Object.keys(preset.mappings).forEach(fieldKey => {
        const presetColumn = preset.mappings[fieldKey];
        // Check if this column exists in Excel
        const matchingColumn = excelColumns.find(col =>
          col.toLowerCase() === presetColumn.toLowerCase()
        );

        if (matchingColumn) {
          newMappings[fieldKey] = matchingColumn;
        }
      });

      setColumnMappings(newMappings);
    }
  };

  const renderAutoMappingTab = () => (
    <div className="space-y-4">
      {/* Validation Status */}
      {validation.errors.length > 0 && (
        <Alert type="error" title="Mapping Errors">
          <ul className="list-disc list-inside">
            {validation.errors.map((error, i) => (
              <li key={i}>{error}</li>
            ))}
          </ul>
        </Alert>
      )}

      {validation.warnings.length > 0 && (
        <Alert type="warning" title="Warnings">
          <ul className="list-disc list-inside">
            {validation.warnings.map((warning, i) => (
              <li key={i}>{warning}</li>
            ))}
          </ul>
        </Alert>
      )}

      {validation.valid && Object.keys(columnMappings).length > 0 && (
        <Alert type="success" title="All Required Fields Mapped">
          Your Excel columns are correctly mapped!
        </Alert>
      )}

      {/* Mapping Grid */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {Object.keys(FIELD_DEFINITIONS).map(fieldKey => {
          const field = FIELD_DEFINITIONS[fieldKey];
          const isRequired = field.required;
          const isMapped = !!columnMappings[fieldKey];

          return (
            <div key={fieldKey} className="p-4 border rounded-lg bg-slate-50">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <label className="font-medium text-slate-900">{field.label}</label>
                    {isRequired && <Badge variant="error" size="sm">Required</Badge>}
                    {isMapped && <Badge variant="success" size="sm">✓ Mapped</Badge>}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{field.description}</p>
                  <p className="text-xs text-slate-400 mt-1">Example: {field.example}</p>
                </div>
              </div>

              <Select
                value={columnMappings[fieldKey] || ''}
                onChange={(e) => handleMappingChange(fieldKey, e.target.value)}
                options={[
                  { value: '', label: '-- Select Excel Column --' },
                  ...excelColumns.map(col => ({ value: col, label: col }))
                ]}
                className="mt-2"
              />
            </div>
          );
        })}
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-4 border-t">
        <Button variant="secondary" onClick={handleReset}>
          Auto-Map Again
        </Button>
        <Button variant="secondary" onClick={handleExportMappings}>
          <Download className="w-4 h-4" />
          Export
        </Button>
        <label className="inline-block">
          <input
            type="file"
            accept=".json"
            onChange={handleImportMappings}
            className="hidden"
          />
          <Button variant="secondary" as="span">
            <Upload className="w-4 h-4" />
            Import
          </Button>
        </label>
      </div>
    </div>
  );

  const renderPresetsTab = () => (
    <div className="space-y-4">
      <p className="text-sm text-slate-600">
        Choose a preset mapping template that matches your document type:
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.keys(MAPPING_PRESETS).map(presetKey => {
          const preset = MAPPING_PRESETS[presetKey];
          return (
            <button
              key={presetKey}
              onClick={() => handleLoadPreset(presetKey)}
              className="p-4 border-2 rounded-lg text-left hover:border-indigo-500 hover:bg-indigo-50 transition-all"
            >
              <h4 className="font-semibold text-slate-900">{preset.name}</h4>
              <p className="text-sm text-slate-600 mt-1">{preset.description}</p>
              <div className="mt-3 text-xs text-slate-500">
                Maps {Object.keys(preset.mappings).length} fields
              </div>
            </button>
          );
        })}
      </div>

      <Alert type="info">
        After loading a preset, you can adjust individual mappings in the "Map Columns" tab.
      </Alert>
    </div>
  );

  const renderCustomNamesTab = () => (
    <div className="space-y-4">
      <Alert type="info">
        Add your custom column names here so the app can recognize them automatically in future uploads.
      </Alert>

      {/* Add New Custom Name */}
      <div className="p-4 border rounded-lg bg-slate-50">
        <h4 className="font-medium text-slate-900 mb-3">Add Custom Column Name</h4>

        <div className="grid grid-cols-2 gap-3">
          <Select
            value={selectedFieldForCustom}
            onChange={(e) => setSelectedFieldForCustom(e.target.value)}
            options={[
              { value: '', label: 'Select Field...' },
              ...Object.keys(FIELD_DEFINITIONS).map(key => ({
                value: key,
                label: FIELD_DEFINITIONS[key].label
              }))
            ]}
            label="Field"
          />

          <Input
            value={newCustomName}
            onChange={(e) => setNewCustomName(e.target.value)}
            placeholder="Your column name"
            label="Column Name"
          />
        </div>

        <Button
          onClick={handleAddCustomMapping}
          disabled={!selectedFieldForCustom || !newCustomName.trim()}
          className="mt-3"
          icon={Plus}
          size="sm"
        >
          Add Custom Name
        </Button>
      </div>

      {/* Existing Custom Names */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {Object.keys(FIELD_DEFINITIONS).map(fieldKey => {
          const field = FIELD_DEFINITIONS[fieldKey];
          const custom = customMappings[fieldKey] || [];

          if (custom.length === 0) return null;

          return (
            <div key={fieldKey} className="p-4 border rounded-lg">
              <h5 className="font-medium text-slate-900 mb-2">{field.label}</h5>
              <div className="flex flex-wrap gap-2">
                {custom.map(name => (
                  <div
                    key={name}
                    className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm"
                  >
                    <span>{name}</span>
                    <button
                      onClick={() => handleRemoveCustomMapping(fieldKey, name)}
                      className="hover:text-indigo-900"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {Object.values(customMappings).every(arr => arr.length === 0) && (
          <p className="text-center text-slate-500 py-8">
            No custom column names added yet.
          </p>
        )}
      </div>
    </div>
  );

  const tabs = [
    { id: 'auto', label: 'Map Columns' },
    { id: 'presets', label: 'Presets' },
    { id: 'custom', label: 'Custom Names' }
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Excel Column Mapping"
      footer={
        <div className="flex justify-between items-center w-full">
          <div className="text-sm text-slate-600">
            {excelColumns.length} columns detected
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={!validation.valid}
              icon={Check}
            >
              Confirm Mapping
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

        <div className="mt-4">
          {activeTab === 'auto' && renderAutoMappingTab()}
          {activeTab === 'presets' && renderPresetsTab()}
          {activeTab === 'custom' && renderCustomNamesTab()}
        </div>
      </div>
    </Modal>
  );
}
