const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  generateWorksheets: () => ipcRenderer.invoke('generateWorksheets'),
  openOneDriveFolder: () => ipcRenderer.invoke('openOneDriveFolder')
});