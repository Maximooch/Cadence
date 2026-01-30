const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  getSchedulePath: () => ipcRenderer.invoke('get-schedule-path'),
  readSchedule: () => ipcRenderer.invoke('read-schedule'),
  writeSchedule: (content) => ipcRenderer.invoke('write-schedule', content),
  
  // Platform info
  platform: process.platform,
  
  // Listen for quick add task from menu bar
  onQuickAddTask: (callback) => {
    ipcRenderer.on('quick-add-task', callback);
    return () => ipcRenderer.removeListener('quick-add-task', callback);
  },
  
  // App info
  versions: {
    node: process.versions.node,
    electron: process.versions.electron
  }
});