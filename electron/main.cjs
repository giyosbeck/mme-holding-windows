const { app, BrowserWindow, Menu, ipcMain } = require('electron');
const { autoUpdater } = require('electron-updater');
const path = require('path');

// Disable menu bar for clean kiosk UI
Menu.setApplicationMenu(null);

// Configure auto-updater
autoUpdater.autoDownload = false; // Don't auto-download, let user choose
autoUpdater.autoInstallOnAppQuit = true; // Install on app quit

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1920,
    height: 1080,
    // Start maximized for touch kiosk devices
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
      // Enable touch events for sensored monoblocks
      enableBlinkFeatures: 'PreciseMemoryInfo'
    },
    // Clean UI without frame decorations
    autoHideMenuBar: true,
    // Optional: Enable for fullscreen kiosk mode
    // kiosk: true,
    // fullscreen: true,
  });

  // Show window when ready to avoid flickering
  mainWindow.once('ready-to-show', () => {
    mainWindow.maximize();
    mainWindow.show();
  });

  // Development: Load from Vite dev server
  // Production: Load from built files
  const isDev = process.env.NODE_ENV === 'development' || process.env.ELECTRON_DEV === 'true';

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    // Open DevTools in development
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
    // Production: DevTools disabled for clean POS experience
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Create window when app is ready
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    // On macOS, re-create window when dock icon is clicked
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed (except on macOS)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Handle app crashes gracefully
app.on('render-process-gone', (event, webContents, details) => {
  console.error('Render process crashed:', details);
  // Optionally restart the app
  if (mainWindow) {
    mainWindow.reload();
  }
});

// ====== AUTO-UPDATE LOGIC ======

// Check for updates on app startup (only in production)
app.whenReady().then(() => {
  const isDev = process.env.NODE_ENV === 'development' || process.env.ELECTRON_DEV === 'true';

  if (!isDev) {
    // Check for updates 10 seconds after app starts
    setTimeout(() => {
      console.log('🔍 Checking for updates...');
      autoUpdater.checkForUpdates();
    }, 10000);

    // Check for updates every 4 hours
    setInterval(() => {
      console.log('🔍 Periodic update check...');
      autoUpdater.checkForUpdates();
    }, 4 * 60 * 60 * 1000); // 4 hours
  }
});

// Auto-updater event listeners
autoUpdater.on('checking-for-update', () => {
  console.log('🔍 Checking for updates...');
  if (mainWindow) {
    mainWindow.webContents.send('update-checking');
  }
});

autoUpdater.on('update-available', (info) => {
  console.log('✅ Update available:', info.version);
  if (mainWindow) {
    mainWindow.webContents.send('update-available', info);
  }
});

autoUpdater.on('update-not-available', (info) => {
  console.log('✅ App is up to date');
  if (mainWindow) {
    mainWindow.webContents.send('update-not-available', info);
  }
});

autoUpdater.on('download-progress', (progressObj) => {
  const logMessage = `Downloaded ${progressObj.percent.toFixed(2)}% (${progressObj.transferred}/${progressObj.total})`;
  console.log('📥', logMessage);
  if (mainWindow) {
    mainWindow.webContents.send('update-download-progress', progressObj);
  }
});

autoUpdater.on('update-downloaded', (info) => {
  console.log('✅ Update downloaded, will install on restart');
  if (mainWindow) {
    mainWindow.webContents.send('update-downloaded', info);
  }
});

autoUpdater.on('error', (error) => {
  console.error('❌ Update error:', error);
  if (mainWindow) {
    mainWindow.webContents.send('update-error', error.message);
  }
});

// IPC handlers for update actions
ipcMain.on('check-for-updates', () => {
  console.log('🔍 Manual update check requested');
  autoUpdater.checkForUpdates();
});

ipcMain.on('download-update', () => {
  console.log('📥 Download update requested');
  autoUpdater.downloadUpdate();
});

ipcMain.on('install-update', () => {
  console.log('🔄 Install update requested');
  autoUpdater.quitAndInstall(false, true); // false = don't force close, true = relaunch
});
