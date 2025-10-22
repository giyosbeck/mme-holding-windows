# Electron App Troubleshooting Guide

## White/Blank Screen Issues (FIXED!)

**Symptom**: App opens but shows completely white/blank screen, nothing loads

**Cause**: React Router using `BrowserRouter` instead of `HashRouter`. BrowserRouter requires a web server and doesn't work with Electron's `file://` protocol.

**Solution**: ✅ **Already fixed!** App now uses `HashRouter`:
```jsx
// src/App.jsx
import { HashRouter } from 'react-router-dom';  // ✅ Correct for Electron
// NOT: import { BrowserRouter } ...  // ❌ Doesn't work in Electron
```

**How HashRouter works**:
- BrowserRouter URLs: `http://localhost/home` (needs server)
- HashRouter URLs: `file:///path/index.html#/home` (works with file://)

**If you see white screen again**:
1. Verify you're using the LATEST build (check file timestamp)
2. Check that `src/App.jsx` uses `HashRouter`, not `BrowserRouter`
3. Ensure Vite config has `base: './'` for relative paths

---

## JavaScript Module System Errors (FIXED!)

**Error**: "ReferenceError: require is not defined in ES module scope"

**Cause**: Conflict between package.json `"type": "module"` (needed for Vite) and Electron files using CommonJS `require()` syntax.

**Solution**: ✅ **Already fixed!** Electron files now use `.cjs` extension:
- `electron/main.cjs` - Uses CommonJS (require/module.exports)
- `electron/preload.cjs` - Uses CommonJS
- package.json still has `"type": "module"` for Vite
- The `.cjs` extension tells Node.js these files are CommonJS regardless of package.json

**If you see this error again**: Verify that:
1. Electron files have `.cjs` extension (not `.js`)
2. package.json main points to `electron/main.cjs`
3. Preload path in main.cjs references `preload.cjs`

---

## NSIS Installer Integrity Check Failed

**Error**: "Installer integrity check has failed. Common causes include incomplete download and damaged media."

**Cause**: This happens when building NSIS installers on macOS for Windows (cross-compilation issue). The signing process doesn't work correctly across platforms.

**Solution**: Use **7z archive format** instead:
```bash
npm run electron:build
```
This creates `MME Warehouse-1.0.0-win.7z` which:
- ✅ Works perfectly when built on macOS
- ✅ No integrity check errors
- ✅ Smaller file size
- Users just extract and run

**Alternative**: Build on actual Windows machine for NSIS installer.

---

## Portable App Not Opening - Common Causes

### 1. Windows SmartScreen (Most Common)
**Symptoms**: Double-click → nothing happens, or "Windows protected your PC" message

**Solution**:
- Right-click the EXE → Properties
- Check "Unblock" at the bottom → Apply
- Or click "More info" → "Run anyway" in SmartScreen dialog

### 2. Antivirus Blocking
**Symptoms**: App disappears immediately, no window appears

**Solution**:
- Check Windows Defender quarantine (Windows Security → Virus & threat protection → Protection history)
- Add app to exclusions: Windows Security → Virus & threat protection → Manage settings → Exclusions

### 3. Silent Crash
**Symptoms**: Double-click → nothing happens, no error

**Debug Steps**:
```bash
# Run from Command Prompt to see error messages
cd path\to\app
"MME Warehouse-1.0.0-Portable.exe"
```

Look for errors like:
- `Error: Cannot find module 'dist/index.html'` → Build failed, run `npm run build`
- `EACCES: permission denied` → Move app to desktop or documents folder
- `ENOENT` errors → Path too long, move app to shorter path like `C:\MME\`

### 4. Missing Build Files
**Symptoms**: White/blank window

**Solution**:
```bash
# Ensure build completed successfully
npm run build
# Check that dist/ folder exists with index.html
ls dist/
# Then rebuild electron
npm run electron:build
```

### 5. Path Issues
**Symptoms**: App in folder with special characters or very long path

**Solution**:
- Move app to simple path: `C:\MME\`
- Avoid paths with: spaces, unicode, special chars like `#`, `&`, `(`, `)`

### 6. User Permissions
**Symptoms**: App won't run from Program Files or system folders

**Solution**:
- Move to user-writable location (Desktop, Documents)
- Or run as Administrator (right-click → Run as administrator)

## 7z Archive Issues

### Can't Extract Archive
- Install 7-Zip from https://www.7-zip.org/
- Or use Windows built-in extractor (right-click → Extract All)

### Extracted but App Won't Run
- Check antivirus didn't block the executable
- Right-click `MME Warehouse.exe` → Properties → Unblock → Apply
- Run as Administrator if needed

### Want Desktop Shortcut
- Right-click `MME Warehouse.exe`
- "Send to" → "Desktop (create shortcut)"

## NSIS Installer Issues (Legacy - Not Recommended on macOS)

### Integrity Check Failed
**This is the main issue!** NSIS installers built on macOS have integrity problems.

**Solution**: Switch to 7z archive format or build on Windows machine.

### Installer Won't Run
- Right-click → Properties → Unblock → Apply
- Temporarily disable antivirus during installation

### "App is not digitally signed" Warning
**Normal behavior** for unsigned apps. Users must click "More info" → "Run anyway"

**Permanent solution**: Code signing certificate ($300-500/year)
- Purchase from: DigiCert, Sectigo, GlobalSign
- Sign the installer with proper Windows code signing tools

### Installation Fails
- Run installer as Administrator
- Check disk space (need ~300MB)
- Check antivirus isn't blocking

## Testing Checklist

Before distributing to users:

1. **Build succeeds**
   ```bash
   npm run build
   # Should see dist/ folder with files
   ```

2. **Electron build succeeds**
   ```bash
   npm run electron:build
   # Should see release/ folder with installer
   ```

3. **Test installer on clean Windows VM**
   - Fresh Windows 10/11 machine (not your dev machine)
   - No dev tools installed
   - Simulates real user environment

4. **Test on actual kiosk hardware**
   - Touch functionality works
   - Screen resolution correct
   - Performance acceptable

## Logs Location

After installation, app data/logs stored in:
```
C:\Users\<username>\AppData\Roaming\MME Warehouse\
```

Check for crash logs or error files there.

## Getting Better Error Messages

Temporarily enable DevTools in `electron/main.js`:

```javascript
if (isDev) {
  mainWindow.loadURL('http://localhost:5173');
  mainWindow.webContents.openDevTools(); // <-- Uncomment this
} else {
  mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  mainWindow.webContents.openDevTools(); // <-- Add this line
}
```

Rebuild and run to see console errors.

## Code Signing (Recommended for Production)

To eliminate SmartScreen warnings:

1. **Purchase code signing certificate**
   - EV (Extended Validation) certificate: ~$400/year
   - Instantly trusted by Windows SmartScreen

2. **Configure in package.json**
   ```json
   "win": {
     "certificateFile": "path/to/certificate.pfx",
     "certificatePassword": "password",
     "signingHashAlgorithms": ["sha256"],
     "signDlls": true
   }
   ```

3. **Build signed version**
   ```bash
   npm run electron:build
   ```

Signed apps have **zero SmartScreen warnings**.

## Quick Fix Hierarchy

Try in this order:

1. ✅ **Use 7z archive format** (works cross-platform, no integrity errors)
2. ✅ Unblock the extracted file (Properties → Unblock)
3. ✅ Run from simple path (`C:\MME\`)
4. ✅ Test on user's actual machine (not just yours)
5. ✅ Add antivirus exclusion if needed
6. ✅ Consider code signing for production

## Build Format Comparison

| Format | Built on macOS? | File Size | User Steps | Issues |
|--------|----------------|-----------|------------|---------|
| **7z** | ✅ Yes | ~78 MB | Extract → Run | None! |
| NSIS Installer | ❌ No* | ~86 MB | Run installer | Integrity errors on macOS |
| Portable EXE | ✅ Yes | ~80 MB | Run directly | SmartScreen warnings |

*NSIS must be built on Windows to avoid integrity errors

## Support Checklist

When user reports "app won't open":

1. Ask: "Do you see any error message?" (most say no)
2. Ask: "Did you see Windows SmartScreen warning?" (if yes → click "More info" → "Run anyway")
3. Ask: "Is antivirus installed?" (if yes → check quarantine)
4. Ask: "Where did you save the file?" (if weird path → move to desktop)
5. Provide: NSIS installer instead of portable
