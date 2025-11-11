# 🚀 QUICK START GUIDE

Get your Trading PDF Automator desktop app running in 5 minutes!

## ⚡ Super Quick Start (For Experienced Developers)

```bash
cd trading-pdf-automator
npm install
npm run electron-dev
```

That's it! App will launch automatically.

## 📚 For Everyone Else - Step by Step

### Step 1: Install Node.js (5 minutes)

1. Go to https://nodejs.org/
2. Download the "LTS" version (Recommended)
3. Run the installer
4. Accept all defaults
5. Restart your computer

**Test it worked:**
- Open Terminal (Mac) or Command Prompt (Windows)
- Type: `node --version`
- You should see something like `v18.17.0`

### Step 2: Install App Dependencies (5 minutes)

1. Open Terminal/Command Prompt
2. Navigate to the app folder:
   ```bash
   cd path/to/trading-pdf-automator
   ```
3. Install everything:
   ```bash
   npm install
   ```
4. Wait 5-10 minutes (it's downloading packages)

### Step 3: Run the App (Instant!)

```bash
npm run electron-dev
```

The app will launch automatically! 🎉

## 🏗️ Build Installer for Distribution

### Windows Installer:
```bash
npm run build-win
```
Find installer in `dist/Trading PDF Automator-1.0.0-Setup.exe`

### Mac Installer:
```bash
npm run build-mac
```
Find installer in `dist/Trading PDF Automator-1.0.0.dmg`

### Linux Package:
```bash
npm run build-linux
```
Find installer in `dist/Trading PDF Automator-1.0.0.AppImage`

## 🎯 What to Do First Time Running

1. **Upload Excel Manifest** - Click "Select Excel File"
2. **Upload PDFs** - Click "Add PDF Files"
3. **Configure Settings** - Click "Configure Settings"
4. **Process** - Click "Run Automation"
5. **Save Result** - Click "Save Package"

## 📋 Excel File Requirements

Your Excel needs these columns (in any order):

**Minimum Required:**
- source_file
- page_number
- trade_date
- trade_type

**Optional (but recommended):**
- settlement_date
- asset_class
- counterparty
- trade_id
- trade_value
- priority

## ❓ Common Issues

### "npm: command not found"
→ Node.js isn't installed. Go back to Step 1.

### "Cannot find module"
→ Run `npm install` again

### App won't start
→ Try `npm run electron-dev` and check for error messages

### "Permission denied" (Mac/Linux)
→ Run with: `sudo npm install`

## 🎓 Need More Help?

Read the full README.md file for:
- Detailed troubleshooting
- Configuration options
- Performance tips
- Security information

## 📞 Support Checklist

Before asking for help, check:
1. [ ] Node.js is installed (`node --version` works)
2. [ ] Dependencies installed (`npm install` completed)
3. [ ] In correct folder (see `package.json` file)
4. [ ] No error messages in terminal
5. [ ] Tried restarting terminal

## 🔄 Commands Reference

```bash
# Install dependencies
npm install

# Run in development mode (with hot-reload)
npm run electron-dev

# Build for Windows
npm run build-win

# Build for Mac
npm run build-mac

# Build for Linux
npm run build-linux

# Build for all platforms
npm run build-all

# Just run React in browser (for testing)
npm start
```

## ✅ You're Ready When...

- [ ] App launches without errors
- [ ] You can see the "Trading PDF Automator" window
- [ ] Upload buttons respond to clicks
- [ ] You've tested with sample files

**Congratulations! You're all set! 🎉**

---

**Time from zero to running:** ~15 minutes (including downloads)

**Time to build installer:** ~5 minutes per platform

**Time to process 100 pages:** ~30 seconds
