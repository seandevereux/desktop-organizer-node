# Building the Installer

## Windows Defender SmartScreen Warning

When you run the installer, Windows may show a warning:
> "Windows protected your PC" or "Windows Defender SmartScreen prevented an unrecognized app from starting"

### Why This Happens

This is **normal** for unsigned applications. Windows shows this warning because:
- The app is not code-signed with a certificate from a trusted Certificate Authority
- Windows doesn't recognize the publisher
- This is a security feature to protect users from potentially harmful software

### Solutions

**Option 1: Click "More info" then "Run anyway"**
1. Click "More info" on the warning screen
2. Click "Run anyway"
3. The installer will proceed normally

**Option 2: Code Sign Your App (For Distribution)**
To remove the warning completely, you need a code signing certificate:
- Purchase from a Certificate Authority (DigiCert, Sectigo, etc.) - costs $100-400/year
- Or use a self-signed certificate (still shows warning but identifies your app)

**Option 3: Add Exception (For Testing)**
1. Right-click the `.exe` file
2. Select "Properties"
3. Check "Unblock" at the bottom if available
4. Click OK

### Note

This warning is **expected** and **safe** for your own applications. Users will see it, but can proceed by clicking "More info" → "Run anyway".

---

## Issue: Code Signing Tool Extraction

If you encounter the error:
```
ERROR: Cannot create symbolic link : A required privilege is not held by the client.
```

This happens because electron-builder needs administrator privileges to extract code signing tools (even though we're not signing the app).

## Solutions

### Option 1: Run as Administrator (Recommended)

1. **Close your current terminal**
2. **Right-click** on your terminal/command prompt
3. **Select "Run as administrator"**
4. Navigate to your project directory:
   ```bash
   cd C:\Users\s3and\desktop-organizer-node
   ```
5. Run the build command:
   ```bash
   npm run dist:win:installer
   ```

### Option 2: Enable Developer Mode (Windows 10/11)

1. Open **Settings** → **Privacy & Security** → **For developers**
2. Enable **Developer Mode**
3. Restart your terminal
4. Run: `npm run dist:win:installer`

### Option 3: Build Portable Version (No Installer)

The portable version doesn't require code signing tools:

```bash
npm run dist:win
```

This creates a portable `.exe` file that users can run directly without installation.

### Option 4: Manual Cache Fix

1. Open PowerShell or Command Prompt **as Administrator**
2. Navigate to the cache directory:
   ```powershell
   cd $env:LOCALAPPDATA\electron-builder\Cache\winCodeSign
   ```
3. Delete all folders in this directory
4. Try building again

## Build Commands

- **Portable Build** (no installer, no admin needed): `npm run dist:win`
- **Installer Build** (requires admin): `npm run dist:win:installer`
- **Directory Build** (for testing): `npm run dist:dir`

## Output Location

After successful build, find your installer/executable in:
- `release/Desktop Organizer-1.0.0-Setup.exe` (installer)
- `release/Desktop Organizer-1.0.0.exe` (portable)

