# Electron Desktop App - MME Warehouse

This guide explains how to run and build the MME Warehouse application as a Windows desktop app.

## Requirements

- Node.js 18+ installed
- Windows 10/11 (for building Windows EXE)

## Development

Run the app in development mode with hot reload:

```bash
npm run electron:dev
```

This will:
1. Start the Vite dev server on http://localhost:5173
2. Launch the Electron app window
3. Enable hot reload - changes to your React code will update automatically

**Note:** DevTools are disabled by default. To enable them, uncomment line 38 in `electron/main.js`:
```javascript
mainWindow.webContents.openDevTools();
```

## Building Portable EXE

Build a portable Windows executable:

```bash
npm run electron:build
```

This will:
1. Build the React app (`npm run build`)
2. Package everything into a portable EXE using electron-builder
3. Output: `release/MME Warehouse-1.0.0-Portable.exe`

**Build Time:** ~2-3 minutes (first build may take longer)
**File Size:** ~150-200 MB (includes Chromium + Node.js + your app)

## Using the Portable EXE

1. Find the EXE in the `release/` folder
2. Copy it to your kiosk device
3. Double-click to run - no installation required!
4. The app will:
   - Start maximized (fullscreen)
   - Hide the menu bar for clean kiosk UI
   - Enable touch events for sensored monoblocks

## Configuration

### Window Settings

Edit `electron/main.js` to customize:

```javascript
// Change window size
width: 1920,
height: 1080,

// Enable true kiosk mode (locks fullscreen, can't exit with Alt+F4)
kiosk: true,
fullscreen: true,

// Show DevTools for debugging
mainWindow.webContents.openDevTools();
```

### App Icon

1. Create a 256x256 or 512x512 PNG image
2. Convert to ICO format using https://icoconvert.com/
3. Save as `build/icon.ico`
4. Rebuild: `npm run electron:build`

### App Details

Edit in `package.json`:

```json
"version": "1.0.0",
"build": {
  "appId": "com.mmeholding.warehouse",
  "productName": "MME Warehouse"
}
```

## Troubleshooting

### "Cannot find module 'electron'"
Run: `npm install`

### White/blank screen
- Check that `npm run build` completed successfully
- Check that `dist/` folder exists and contains files
- Try running `npm run dev` first to verify the React app works

### Touch not working
- Ensure you're running on a touch-enabled device
- Check that `electron/preload.js` is loaded correctly

### App won't start
- Check Windows Event Viewer for crash logs
- Try running from Command Prompt to see error messages:
  ```bash
  cd path\to\app
  "MME Warehouse-1.0.0-Portable.exe"
  ```

## File Structure

```
windows/
├── electron/
│   ├── main.js       # Electron main process
│   └── preload.js    # Security bridge
├── build/
│   └── icon.ico      # App icon (optional)
├── release/          # Built EXE files (generated)
├── dist/             # React build output (generated)
└── src/              # React source code
```

## Building on Different Platforms

**On macOS/Linux to build Windows EXE:**
Electron-builder can cross-compile, but for best results, build on Windows.

**To build for macOS (.app) or Linux (.AppImage):**
Edit `package.json` and add targets:
```json
"build": {
  "mac": {
    "target": "dmg"
  },
  "linux": {
    "target": "AppImage"
  }
}
```

## Production Checklist

Before deploying to kiosks:

- [ ] Test the portable EXE on a clean Windows machine
- [ ] Verify touch interactions work correctly
- [ ] Test with actual kiosk hardware (monoblock)
- [ ] Check API connectivity (https://dastur.mme-holding.uz)
- [ ] Disable DevTools in `electron/main.js`
- [ ] Update version in `package.json`
- [ ] Add custom app icon in `build/icon.ico`
- [ ] Test offline behavior (if applicable)

## Auto-Start on Windows Boot (Optional)

To make the app start when Windows boots:

1. Create a shortcut to the EXE
2. Press `Win+R`, type `shell:startup`, press Enter
3. Copy the shortcut to the Startup folder

Or use Windows Task Scheduler for more control.
