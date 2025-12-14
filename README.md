# Desktop Organizer

A safe, non-destructive desktop application that automatically organizes files on your desktop by file type. Built with Electron and Angular.

## Features

- **Automatic File Sorting**: Categorizes files by type (Images, Documents, Videos, Audio, Archives, Code, etc.)
- **Preview Mode**: See all proposed file movements before applying changes
- **Session Management**: Each organization action creates a timestamped session
- **Rollback System**: Fully reversible - rollback any session to restore files to their original locations
- **Configuration**: Enable or disable specific categories
- **100% Safe**: Files are never deleted, only moved

## Prerequisites

- Node.js 18+
- npm or yarn

## Installation

1. Install dependencies:

```bash
npm install
```

## Development

### First Time Setup

1. Install dependencies:

```bash
npm install
```

2. Build the project:

```bash
npm run build
```

3. Start the application:

```bash
npm start
```

## Usage

1. **Preview Changes**: Click "Preview Changes" to see what files will be organized
2. **Organize**: Click "Organize Desktop" to apply the changes
3. **Rollback**: Go to the Rollback tab to view and rollback previous sessions
4. **Configure**: Go to the Configuration tab to enable/disable categories

## Data Storage

All data is stored locally:

- **Sessions**: `%APPDATA%/DesktopOrganizer/sessions.json`
- **Config**: `%APPDATA%/DesktopOrganizer/config.json`

## Safety Features

- Files are never deleted
- Filename conflicts are automatically resolved with numbered suffixes
- Full rollback capability for every session
- Preview before applying changes
- Confirmation dialogs for destructive actions
- Path security checks to prevent directory traversal
- Type verification during rollback to prevent data corruption

## Building for Production

### Create Windows Installer

1. **Build the application:**

   ```bash
   npm run build
   ```

2. **Create the installer:**

   ```bash
   npm run dist:win
   ```

   This will create a Windows installer (`.exe`) in the `release/` folder.

### Build Options

- **Windows Installer**: `npm run dist:win` - Creates a Windows installer (.exe)
- **Directory Build**: `npm run dist:dir` - Creates unpacked app files (for testing)
- **All Platforms**: `npm run dist` - Builds for current platform

### Installer Output

After building, you'll find:

- **Installer**: `release/Desktop Organizer-1.0.0-Setup.exe`
- **Unpacked App**: `release/win-unpacked/` (for testing)

### Installation

Users can:

1. Run the `.exe` installer
2. Choose installation directory (default: `C:\Users\<User>\AppData\Local\Desktop Organizer`)
3. Create desktop shortcut (optional)
4. Install and launch the app

### Windows Defender SmartScreen Warning

When users run the installer, they may see:

> "Windows protected your PC" or "Windows Defender SmartScreen prevented an unrecognized app from starting"

**This is normal** for unsigned applications. Users can:

1. Click **"More info"**
2. Click **"Run anyway"**
3. Proceed with installation

To remove this warning, you would need to purchase a code signing certificate from a Certificate Authority (costs $100-400/year).

### Requirements

- Windows 7 or later
- No additional dependencies required (all bundled)

## License

MIT
