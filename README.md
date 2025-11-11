# Trading PDF Automator - Desktop Edition

**🔒 100% OFFLINE** - Professional desktop application for automating trading document processing with Bates stamping. Built with Electron and React for Windows, macOS, and Linux.

**NEW in v2.0:** Completely offline - no internet required after setup! Air-gap capable for maximum security.

![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-blue)
![Offline](https://img.shields.io/badge/offline-100%25-green)
![License](https://img.shields.io/badge/license-MIT-green)

## 🔒 Security First

- **100% Offline Operation** - Works without internet after initial setup
- **Air-Gap Capable** - Can run on isolated networks
- **Zero Data Transmission** - All processing happens locally
- **No Cloud Dependencies** - Everything runs on your computer
- **Enterprise Security Ready** - Meets strict security requirements

## 🚀 Features

- **Multi-Platform Desktop App** - Runs natively on Windows, Mac, and Linux
- **Trading Document Processing** - Specialized for market trade confirmations
- **Real-Time & Batch Modes** - Priority-based or chronological processing
- **Bates Numbering** - Professional document stamping
- **Smart Grouping** - Organize by date, type, asset class, counterparty
- **Native File Dialogs** - Professional OS-integrated file selection
- **Secure Processing** - All processing happens locally, no cloud uploads
- **Progress Tracking** - Real-time status updates and logging
- **Audit Trail** - Complete processing summary and manifest generation

## 📋 Prerequisites

Before building, ensure you have:

- **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js) or **yarn**
- **Git** (optional, for cloning)

### Platform-Specific Requirements:

**Windows:**
- Windows 10 or higher
- No additional requirements

**macOS:**
- macOS 10.13 or higher
- Xcode Command Line Tools: `xcode-select --install`

**Linux:**
- Ubuntu 18.04+ / Debian 10+ / Fedora 30+ or equivalent
- Build tools: `sudo apt-get install build-essential`

## 🛠️ Installation & Setup

### Step 1: Extract and Navigate

```bash
# Extract the zip file
unzip trading-pdf-automator.zip

# Navigate to the directory
cd trading-pdf-automator
```

### Step 2: Install Dependencies

```bash
# Install all required packages
npm install

# This will install:
# - React and React DOM
# - Electron
# - Electron Builder (for creating installers)
# - All development dependencies
```

**Note:** First installation may take 5-10 minutes depending on your internet speed.

### Step 3: Verify Installation

```bash
# Check if everything is installed correctly
npm list --depth=0
```

## 🏃 Running in Development Mode

### Option A: Electron Development Mode

```bash
# Start the app in development mode with hot-reload
npm run electron-dev
```

This will:
1. Start the React development server
2. Launch Electron automatically
3. Enable DevTools for debugging
4. Auto-reload on code changes

### Option B: Web Browser Testing

```bash
# Run in web browser first (for quick testing)
npm start
```

Opens in browser at `http://localhost:3000` - Good for testing UI changes quickly.

## 📦 Building Installers

### Build for Your Current Platform

```bash
# Automatically detects your OS and builds for it
npm run electron-build
```

### Build for Specific Platforms

**Windows (creates .exe installer and portable):**
```bash
npm run build-win
```

Output files in `dist/`:
- `Trading PDF Automator-1.0.0-Setup.exe` - Full installer with auto-updater
- `Trading PDF Automator-1.0.0.exe` - Portable version (no install needed)

**macOS (creates .dmg and .zip):**
```bash
npm run build-mac
```

Output files in `dist/`:
- `Trading PDF Automator-1.0.0.dmg` - macOS installer
- `Trading PDF Automator-1.0.0-mac.zip` - Compressed app bundle

**Linux (creates AppImage, .deb, and .rpm):**
```bash
npm run build-linux
```

Output files in `dist/`:
- `Trading PDF Automator-1.0.0.AppImage` - Universal Linux app
- `trading-pdf-automator_1.0.0_amd64.deb` - Debian/Ubuntu package
- `trading-pdf-automator-1.0.0.x86_64.rpm` - RedHat/Fedora package

### Build for ALL Platforms at Once

```bash
npm run build-all
```

**Warning:** 
- Requires significant disk space (~500MB per platform)
- Takes 10-30 minutes depending on your computer
- Mac builds can only be created on macOS (Apple code signing restrictions)

## 📂 Project Structure

```
trading-pdf-automator/
├── electron/
│   ├── main.js           # Electron main process
│   └── preload.js        # Security bridge
├── src/
│   ├── App.js            # React application
│   ├── index.js          # React entry point
│   └── index.css         # Styles
├── public/
│   └── index.html        # HTML template
├── build/                # Icons and resources
├── dist/                 # Built installers (after build)
├── package.json          # Dependencies and scripts
└── README.md             # This file
```

## 🎨 Adding Custom Icons

### Windows Icon (.ico)
1. Create/obtain a 256x256 PNG icon
2. Convert to .ico using [ConvertICO](https://convertio.co/png-ico/)
3. Save as `build/icon.ico`

### macOS Icon (.icns)
1. Create/obtain a 1024x1024 PNG icon
2. Use `iconutil` or [IconMaker](https://apps.apple.com/us/app/icon-maker/id949343740)
3. Save as `build/icon.icns`

### Linux Icon (.png)
1. Use a 512x512 PNG icon
2. Save as `build/icon.png`

## 🔧 Configuration

### Change App Name
Edit `package.json`:
```json
{
  "name": "your-app-name",
  "productName": "Your App Display Name",
  "build": {
    "appId": "com.yourcompany.yourapp"
  }
}
```

### Change Version
Edit `package.json`:
```json
{
  "version": "1.0.0"
}
```

### Modify Window Size
Edit `electron/main.js`:
```javascript
mainWindow = new BrowserWindow({
    width: 1400,  // Change these values
    height: 900,
    minWidth: 1000,
    minHeight: 700,
    // ...
});
```

## 🚀 Distribution

### Windows
1. Build the installer: `npm run build-win`
2. Distribute `Trading PDF Automator-1.0.0-Setup.exe`
3. Users double-click to install
4. App appears in Start Menu and Desktop

### macOS
1. Build the DMG: `npm run build-mac`
2. Distribute `Trading PDF Automator-1.0.0.dmg`
3. Users drag to Applications folder
4. **Note:** For distribution outside your organization, you'll need to:
   - Sign the app with an Apple Developer certificate
   - Notarize with Apple

### Linux
1. Build the AppImage: `npm run build-linux`
2. Distribute `Trading PDF Automator-1.0.0.AppImage`
3. Make executable: `chmod +x Trading\ PDF\ Automator-1.0.0.AppImage`
4. Run: `./Trading\ PDF\ Automator-1.0.0.AppImage`

## 🔒 Security Features

- **No Internet Access Required** - Works completely offline
- **Local Processing** - All PDFs processed on user's computer
- **No Data Upload** - Files never leave the device
- **Context Isolation** - Electron security best practices
- **Content Security Policy** - Prevents XSS attacks
- **Node Integration Disabled** - Enhanced security in renderer

## 📊 Excel Manifest Format

Your Excel file should contain these columns:

**Required Columns:**
- `source_file` - PDF filename (e.g., "trade_001.pdf")
- `page_number` - Page number to extract (1-based)
- `trade_date` - Date of the trade
- `trade_type` - Type (Buy/Sell/Transfer)

**Optional Columns:**
- `settlement_date` - Settlement date
- `asset_class` - Asset type (Equity, Bond, FX, etc.)
- `counterparty` - Broker or dealer name
- `trade_id` - Unique trade identifier
- `trade_value` - Dollar value of trade
- `priority` - urgent/high/normal

**Example:**

| source_file | page_number | trade_date | trade_type | asset_class | counterparty | trade_id | trade_value | priority |
|-------------|-------------|------------|------------|-------------|--------------|----------|-------------|----------|
| confirm_001.pdf | 1 | 2024-01-15 | Buy | Equity | Goldman Sachs | T12345 | 150000 | normal |
| confirm_001.pdf | 2 | 2024-01-15 | Sell | Bond | JPMorgan | T12346 | 200000 | urgent |

## 🐛 Troubleshooting

### "npm: command not found"
- Install Node.js from [nodejs.org](https://nodejs.org/)
- Restart your terminal after installation

### Build fails with "electron-builder not found"
```bash
npm install --save-dev electron-builder
```

### Windows: "rebuild" errors during install
```bash
npm install --legacy-peer-deps
```

### macOS: "command line tools not found"
```bash
xcode-select --install
```

### Linux: "GLIBC" errors
```bash
sudo apt-get update
sudo apt-get install build-essential
```

### App won't start after build
- Check `dist/` folder for error logs
- Try running in development mode first: `npm run electron-dev`
- Check console output for specific errors

### "Out of memory" during build
- Close other applications
- Build one platform at a time
- Increase Node memory: `export NODE_OPTIONS=--max_old_space_size=4096`

## 📈 Performance Tips

- **For large batches (1000+ pages):** Process in multiple smaller batches
- **For slow computers:** Use Batch mode instead of Real-Time mode
- **For many PDFs:** Upload PDFs in groups of 50
- **Close other apps** while processing to free up memory

## 🔄 Updating the App

### To Update Your Installation:
1. Extract new version to same folder
2. Run `npm install` to update dependencies
3. Rebuild: `npm run electron-build`

### To Update for Users:
1. Build new version with incremented version number
2. Distribute new installer
3. Users install over existing version (settings preserved)

## 📝 Development Notes

### Adding New Features
1. Modify `src/App.js` for UI changes
2. Modify `electron/main.js` for native features
3. Test in dev mode: `npm run electron-dev`
4. Build: `npm run electron-build`

### Debugging
- **React DevTools:** Automatically opens in dev mode
- **Electron DevTools:** Press `Ctrl+Shift+I` (Windows/Linux) or `Cmd+Option+I` (Mac)
- **Console Logs:** View in DevTools Console tab

### Performance Profiling
1. Open DevTools (development mode)
2. Go to Performance tab
3. Record while processing documents
4. Analyze bottlenecks

## 📄 License

MIT License - Free to use, modify, and distribute.

## 🆘 Support

For issues or questions:
1. Check this README first
2. Review the Troubleshooting section
3. Check console logs for errors
4. Search for similar issues online

## 🎯 Quick Start Checklist

- [ ] Node.js installed
- [ ] Dependencies installed (`npm install`)
- [ ] App runs in dev mode (`npm run electron-dev`)
- [ ] Excel manifest prepared
- [ ] PDF files ready
- [ ] Build completed for your platform
- [ ] Installer tested
- [ ] App distributed to users

## 🔗 Useful Links

- [Node.js Download](https://nodejs.org/)
- [Electron Documentation](https://www.electronjs.org/docs)
- [React Documentation](https://react.dev/)
- [Electron Builder](https://www.electron.build/)

---

**Built with ❤️ for Trading Operations Teams**

Version 1.0.0 | Last Updated: 2024
