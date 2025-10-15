# Mobile & Desktop App Guide

Turn your web app into installable mobile and desktop apps!

## Option 1: PWA (Progressive Web App) ✅ READY NOW

**What it is:**
- Install from browser like a native app
- Works on iOS, Android, Windows, Mac, Linux
- No app store needed
- Automatic updates
- Offline support

**Already configured!** Your app is PWA-ready.

### How to Install

#### On iPhone/iPad:
1. Open app in Safari
2. Tap the Share button (square with arrow)
3. Scroll down and tap "Add to Home Screen"
4. Tap "Add"
5. App icon appears on home screen like native app!

#### On Android:
1. Open app in Chrome
2. Tap the three dots menu (⋮)
3. Tap "Install app" or "Add to Home Screen"
4. Tap "Install"
5. App icon appears in app drawer!

#### On Desktop (Chrome/Edge):
1. Open app in browser
2. Look for install icon in address bar (⊕ or computer icon)
3. Click "Install"
4. App opens in its own window like native app!

#### On Mac (Safari):
1. Open app in Safari
2. File menu → Add to Dock
3. App appears in Dock!

### PWA Features

**Works Like Native:**
- Own window (no browser UI)
- App icon on home screen/desktop
- Push notifications (can be added)
- Offline mode
- Fast loading
- Splash screen

**Advantages:**
- ✅ No app store approval needed
- ✅ Instant updates (just deploy)
- ✅ One codebase for all platforms
- ✅ Share via URL
- ✅ Always latest version
- ✅ Smaller size than native
- ✅ Free (no developer fees)

**Limitations:**
- ❌ Not in app stores (but can be added later)
- ❌ Some native features limited (Bluetooth, NFC, etc.)
- ❌ iOS has some PWA restrictions

---

## Option 2: Capacitor (Real Native Apps)

**What it is:**
- Wraps your web app in native iOS/Android container
- Publish to App Store and Google Play
- Access to all native features
- Built by Ionic team

### Setup Capacitor

```bash
# Install Capacitor
npm install @capacitor/core @capacitor/cli
npm install @capacitor/ios @capacitor/android

# Initialize
npx cap init

# When prompted:
# App name: Family AI Platform
# Package ID: com.family.aiplatform
# Web dir: dist

# Build your app
npm run build

# Add platforms
npx cap add ios
npx cap add android

# Sync web assets
npx cap sync

# Open in native IDEs
npx cap open ios      # Opens Xcode (Mac only)
npx cap open android  # Opens Android Studio
```

### Build for iOS (Mac required):

```bash
# Build web app
npm run build
npx cap sync ios
npx cap open ios

# In Xcode:
# 1. Select your team
# 2. Connect iPhone or use simulator
# 3. Click Run (▶️)
# 4. App installs on device!

# For App Store:
# 1. Product → Archive
# 2. Distribute App
# 3. Submit to App Store
```

### Build for Android:

```bash
# Build web app
npm run build
npx cap sync android
npx cap open android

# In Android Studio:
# 1. Build → Build Bundle(s) / APK(s) → Build APK(s)
# 2. APK generated in: android/app/build/outputs/apk/release/
# 3. Sign APK for distribution
# 4. Upload to Google Play Console

# Quick test APK:
cd android
./gradlew assembleDebug
# APK in: app/build/outputs/apk/debug/app-debug.apk
```

### Install APK Directly (Android):

```bash
# After building APK:
adb install app/build/outputs/apk/debug/app-debug.apk

# Or send APK file to Android device and open it
# (Must enable "Install from unknown sources")
```

**Capacitor Benefits:**
- ✅ Real native apps
- ✅ Full native API access
- ✅ Publish to app stores
- ✅ Better iOS integration than PWA
- ✅ Native performance
- ✅ Push notifications, etc.

**Costs:**
- iOS: $99/year Apple Developer Program
- Android: $25 one-time Google Play registration
- Time: App store review process

---

## Option 3: Electron (Desktop Apps)

**What it is:**
- Native desktop apps for Windows, Mac, Linux
- Like VS Code, Discord, Slack
- Full system access

### Setup Electron

```bash
# Install Electron
npm install --save-dev electron electron-builder

# Add to package.json scripts:
"electron": "electron .",
"electron:build": "electron-builder"
```

Create `electron.js`:

```javascript
const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
    icon: path.join(__dirname, 'public/icon.png')
  });

  // In production, load the built app
  if (app.isPackaged) {
    win.loadFile('dist/index.html');
  } else {
    win.loadURL('http://localhost:5173');
  }
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
```

Add to `package.json`:

```json
{
  "main": "electron.js",
  "build": {
    "appId": "com.family.aiplatform",
    "productName": "Family AI Platform",
    "files": ["dist/**/*", "electron.js"],
    "directories": {
      "output": "electron-dist"
    },
    "mac": {
      "category": "public.app-category.education",
      "target": ["dmg", "zip"]
    },
    "win": {
      "target": ["nsis", "portable"]
    },
    "linux": {
      "target": ["AppImage", "deb"],
      "category": "Education"
    }
  }
}
```

### Build Desktop Apps:

```bash
# Build web app first
npm run build

# Build for current platform
npm run electron:build

# Build for specific platforms
npm run electron:build -- --mac
npm run electron:build -- --win
npm run electron:build -- --linux

# Output in electron-dist/ folder
```

**Electron Benefits:**
- ✅ Full system access
- ✅ Works offline by default
- ✅ Package with local AI (Ollama)
- ✅ Distribute directly (no store needed)
- ✅ Auto-update support
- ✅ Menu bar, system tray, etc.

**Size:**
- ~100-150MB (includes Chromium)

---

## Option 4: Tauri (Lightweight Desktop)

**What it is:**
- Like Electron but 10x smaller
- Uses system browser (WebView)
- Written in Rust
- More secure, faster

### Setup Tauri

```bash
# Install Tauri CLI
npm install --save-dev @tauri-apps/cli

# Initialize
npx tauri init

# When prompted:
# App name: Family AI Platform
# Window title: Family AI Platform
# Web assets: dist
# Dev server: http://localhost:5173
# Build command: npm run build

# Run in dev mode
npm run tauri dev

# Build for distribution
npm run tauri build

# Output in src-tauri/target/release/
```

**Tauri Benefits:**
- ✅ 10MB vs 100MB (Electron)
- ✅ Uses less RAM
- ✅ Better security
- ✅ Faster startup
- ✅ All platforms

**Trade-offs:**
- Newer (less community)
- More setup required

---

## Comparison Table

| Platform | Size | Platforms | Store | Cost | Setup Time |
|----------|------|-----------|-------|------|------------|
| **PWA** | ~2MB | All | No | Free | ✅ Done! |
| **Capacitor** | ~50MB | iOS/Android | Yes | $99-124 | 2 hours |
| **Electron** | ~100MB | Desktop | No | Free | 1 hour |
| **Tauri** | ~10MB | Desktop | No | Free | 2 hours |

---

## Recommended Approach

### Start with PWA (Current):
1. Deploy to web (Vercel/Netlify)
2. Users install as PWA
3. Free, instant, works everywhere
4. No app store hassles

### Add Native Later (If Needed):
1. **iOS users want better integration?** → Capacitor
2. **Need app store presence?** → Capacitor
3. **Want desktop installer?** → Electron or Tauri
4. **Need advanced native features?** → Capacitor

---

## PWA is Already Perfect For:

✅ **Family use** - Everyone installs from your URL
✅ **Quick sharing** - Send link, they install instantly
✅ **Always updated** - Push updates without app stores
✅ **Free forever** - No developer fees
✅ **Cross-platform** - iOS, Android, Desktop, all work

**Your app is ready to install RIGHT NOW as a PWA!**

---

## Testing Your PWA

### Local Testing:

```bash
# Build production version
npm run build

# Preview
npm run preview

# Open in browser, try installing
```

### Check PWA Score:

1. Open Chrome DevTools (F12)
2. Lighthouse tab
3. Select "Progressive Web App"
4. Click "Generate report"

Your app should score 90-100!

---

## Offline Mode

Your PWA already caches:
- All app files (HTML, CSS, JS)
- Supabase data (7 days)
- Images and assets

**Works offline:**
- View projects
- Browse interface
- Read cached data

**Requires internet:**
- New Supabase queries
- AI chat (needs Ollama connection)
- Real-time updates

---

## Distribution Options

### Option 1: PWA Link (Current)
```
Share: https://your-app.vercel.app
Users: Click, install, done!
```

### Option 2: Capacitor APK (Android)
```
Build APK → Upload to Google Drive/Dropbox
Send link to family
Download and install APK
```

### Option 3: App Stores
```
Submit to Apple App Store
Submit to Google Play Store
Users download like any app
```

### Option 4: Desktop Installers
```
Build .dmg (Mac), .exe (Windows), .AppImage (Linux)
Host on GitHub Releases
Download and install
```

---

## Quick Start: Use PWA Now

**Your app is already a PWA!**

1. **Deploy** to Vercel/Netlify (see DEPLOYMENT.md)
2. **Share** URL with family
3. **Install** following instructions above
4. **Enjoy** native app experience!

**Then add native builds only if needed.**

---

## Need Native Apps?

**iOS (App Store):**
- Requires Mac + Xcode
- $99/year Apple Developer
- 1-2 week review process
- Follow Capacitor section above

**Android (APK or Play Store):**
- Works on any OS
- Free APK or $25 Play Store
- Instant APK distribution
- Follow Capacitor section above

**Desktop (Installer):**
- Build on any OS
- Free distribution
- No review process
- Follow Electron/Tauri section above

---

## Support & Resources

**PWA:**
- Your app: Already configured!
- Test: Deploy and open in any browser
- Docs: https://web.dev/progressive-web-apps/

**Capacitor:**
- Docs: https://capacitorjs.com/docs
- iOS Guide: https://capacitorjs.com/docs/ios
- Android Guide: https://capacitorjs.com/docs/android

**Electron:**
- Docs: https://www.electronjs.org/docs
- Builder: https://www.electron.build/

**Tauri:**
- Docs: https://tauri.app/v1/guides/

---

## Summary

✅ **PWA: Already done!** Install from browser on any device.

⚠️ **Native apps: Optional.** Add later if you need:
- App store presence
- Advanced native features
- Better iOS integration

**For family use, PWA is perfect and ready now!**

Just deploy and share the link. Everyone installs instantly! 🚀
