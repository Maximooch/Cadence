const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  getSchedulePath: () => ipcRenderer.invoke('get-schedule-path'),
  readSchedule: () => ipcRenderer.invoke('read-schedule'),
  writeSchedule: (content) => ipcRenderer.invoke('write-schedule', content),
  
  // Platform info
  platform: process.platform,
  
  // App info
  versions: {
    node: process.versions.node,
    electron: process.versions.electron
  }
});