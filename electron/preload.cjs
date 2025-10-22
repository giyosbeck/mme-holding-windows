const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electron', {
  platform: process.platform,

  // Auto-update API
  updates: {
    checkForUpdates: () => ipcRenderer.send('check-for-updates'),
    downloadUpdate: () => ipcRenderer.send('download-update'),
    installUpdate: () => ipcRenderer.send('install-update'),

    // Listen for update events
    onUpdateChecking: (callback) => ipcRenderer.on('update-checking', callback),
    onUpdateAvailable: (callback) => ipcRenderer.on('update-available', (event, info) => callback(info)),
    onUpdateNotAvailable: (callback) => ipcRenderer.on('update-not-available', (event, info) => callback(info)),
    onDownloadProgress: (callback) => ipcRenderer.on('update-download-progress', (event, progress) => callback(progress)),
    onUpdateDownloaded: (callback) => ipcRenderer.on('update-downloaded', (event, info) => callback(info)),
    onUpdateError: (callback) => ipcRenderer.on('update-error', (event, error) => callback(error)),

    // Remove listeners
    removeUpdateListeners: () => {
      ipcRenderer.removeAllListeners('update-checking');
      ipcRenderer.removeAllListeners('update-available');
      ipcRenderer.removeAllListeners('update-not-available');
      ipcRenderer.removeAllListeners('update-download-progress');
      ipcRenderer.removeAllListeners('update-downloaded');
      ipcRenderer.removeAllListeners('update-error');
    }
  }
});

// Enable touch events for sensored monoblocks
window.addEventListener('DOMContentLoaded', () => {
  // Ensure touch events are properly handled
  document.body.style.touchAction = 'manipulation';

  // Disable text selection for better touch UX
  document.body.style.userSelect = 'none';
  document.body.style.webkitUserSelect = 'none';
});
