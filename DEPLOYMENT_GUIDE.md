# MME Warehouse App - Deployment Guide

## For IT/System Administrators

This guide explains how to deploy the MME Warehouse application to Windows kiosk devices.

## What You Receive

**File**: `MME Warehouse-1.0.0-win.7z`
- Size: ~78 MB
- Format: 7z compressed archive
- Contains: Complete application with all dependencies

## Installation Steps

### Method 1: Extract and Run (Recommended)

1. **Copy the file** to the kiosk device
   - Transfer via USB drive, network share, or download

2. **Extract the archive**
   - Right-click on `MME Warehouse-1.0.0-win.7z`
   - Select "Extract All..." (Windows built-in)
   - Or use 7-Zip if installed
   - Choose destination folder (e.g., `C:\MME Warehouse\`)

3. **Run the application**
   - Navigate to the extracted folder
   - Double-click `MME Warehouse.exe`

4. **Create desktop shortcut** (optional)
   - Right-click on `MME Warehouse.exe`
   - Select "Send to" → "Desktop (create shortcut)"

5. **Done!** The app should launch in maximized window mode

### Method 2: Install 7-Zip First (If Needed)

If Windows doesn't have built-in 7z support:

1. Download 7-Zip from: https://www.7-zip.org/
2. Install 7-Zip
3. Follow Method 1 above

## Troubleshooting

### Issue: "Windows protected your PC" warning

This is normal for unsigned applications.

**Solution**:
1. Click "More info"
2. Click "Run anyway"

### Issue: App doesn't open after extraction

**Solution**:
1. Right-click on `MME Warehouse.exe`
2. Select "Properties"
3. Check "Unblock" at the bottom
4. Click "Apply" → "OK"
5. Try running again

### Issue: Antivirus blocks the app

**Solution**:
1. Add to antivirus exclusions list
2. Path to exclude: `C:\MME Warehouse\MME Warehouse.exe`

## Auto-Start on Windows Boot (Optional)

To make the app start automatically when Windows boots:

1. Create a shortcut to `MME Warehouse.exe`
2. Press `Win+R`
3. Type: `shell:startup`
4. Press Enter
5. Copy the shortcut into the opened folder

## Kiosk Mode (Full Screen, No Exit)

To lock the app in kiosk mode:

1. This requires editing the app configuration
2. Contact the development team for kiosk mode builds
3. OR use Windows Kiosk Mode settings in Windows 10/11

## Network Configuration

The app connects to:
- **API Server**: `https://dastur.mme-holding.uz`
- **Port**: 443 (HTTPS)

Ensure firewall allows outbound HTTPS connections to this domain.

## System Requirements

- **OS**: Windows 10 or Windows 11
- **Architecture**: 64-bit (x64)
- **RAM**: 4 GB minimum, 8 GB recommended
- **Disk Space**: 300 MB free space
- **Network**: Internet connection required
- **Touch**: Touch-enabled display (for kiosk devices)

## Uninstallation

To remove the app:

1. Close the application
2. Delete the extracted folder (e.g., `C:\MME Warehouse\`)
3. Delete any shortcuts created
4. Remove from startup folder if configured

## Support

If you encounter issues:

1. Check `TROUBLESHOOTING.md` for detailed debugging steps
2. Verify internet connectivity to `dastur.mme-holding.uz`
3. Check Windows Event Viewer for error logs
4. Contact development team with:
   - Windows version
   - Error message/screenshot
   - Steps to reproduce

## Version Information

- **App Version**: 1.0.0
- **Build Format**: 7z archive
- **Architecture**: x64
- **Electron Version**: 38.3.0
- **Last Updated**: October 2025

## Security Notes

- App is not code-signed (shows SmartScreen warning)
- For production deployment, consider purchasing code signing certificate
- App requires internet access to function
- User data stored in: `C:\Users\<username>\AppData\Roaming\MME Warehouse\`

## Multiple Installations

You can install on multiple kiosks:

1. Extract to same path on each device: `C:\MME Warehouse\`
2. OR use a deployment script to automate extraction
3. Each kiosk maintains its own local data

## Updates

When a new version is released:

1. Close the old version
2. Delete old folder OR extract new version to different folder
3. Run new version
4. Local data is preserved in AppData folder

---

**Questions?** Contact the development team or refer to the project documentation.
