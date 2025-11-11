const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // File dialogs
  openExcelDialog: () => ipcRenderer.invoke('dialog:openExcel'),
  openPDFsDialog: () => ipcRenderer.invoke('dialog:openPDFs'),
  saveZipDialog: (defaultName) => ipcRenderer.invoke('dialog:saveZip', defaultName),
  
  // File operations
  writeFile: (filePath, data) => ipcRenderer.invoke('fs:writeFile', filePath, data),
  
  // Notifications
  showNotification: (title, body) => ipcRenderer.invoke('notification:show', title, body),
  
  // Platform info
  platform: process.platform,
  
  // Listen for events from main process
  onNewBatch: (callback) => ipcRenderer.on('new-batch', callback)
});

// Expose version info
contextBridge.exposeInMainWorld('appVersion', {
  electron: process.versions.electron,
  chrome: process.versions.chrome,
  node: process.versions.node
});
