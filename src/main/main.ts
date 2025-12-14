import { app, BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import { OrganizerService } from './services/organizer.service';
import { SessionService } from './services/session.service';
import { ConfigService } from './services/config.service';

let mainWindow: BrowserWindow | null = null;

const organizerService = new OrganizerService();
const sessionService = new SessionService();
const configService = new ConfigService();

function createWindow() {
  const isDev = process.env.NODE_ENV === 'development';
  
  // Get icon path - try .ico first (Windows), then .png (fallback)
  const iconPath = process.platform === 'win32' 
    ? path.join(__dirname, '../assets/icon.ico')
    : path.join(__dirname, '../assets/icon.png');
  
  // Check if icon exists, fallback to png if ico doesn't exist
  let finalIconPath: string | undefined;
  if (fs.existsSync(iconPath)) {
    finalIconPath = iconPath;
  } else {
    const fallbackIcon = path.join(__dirname, '../assets/icon.png');
    if (fs.existsSync(fallbackIcon)) {
      finalIconPath = fallbackIcon;
    }
  }

  mainWindow = new BrowserWindow({
    width: 1000,
    height: 700,
    icon: finalIconPath, // Window icon (title bar and taskbar)
    frame: false, // Remove title bar and menu bar
    titleBarStyle: 'hidden', // Hide title bar (macOS)
    autoHideMenuBar: true, // Hide menu bar (Windows/Linux)
    resizable: false, // Disable window resizing
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      devTools: isDev, // Only enable DevTools in development mode
    },
  });
  
  // Add error handlers
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
    console.error('Failed to load:', errorCode, errorDescription, validatedURL);
  });

  mainWindow.webContents.on('console-message', (event, level, message) => {
    console.log(`[Renderer ${level}]:`, message);
  });

  mainWindow.webContents.on('did-finish-load', () => {
    console.log('Page loaded successfully');
  });
  
  // When main.js is compiled to dist/main.js, __dirname is dist/
  // So we need to go to dist/renderer/browser/index.html
  const filePath = path.join(__dirname, 'renderer/browser/index.html');
  
  // Only open dev tools in development mode
  if (isDev) {
    console.log('Loading file from:', filePath);
    console.log('__dirname is:', __dirname);
    console.log('File exists check:', fs.existsSync(filePath));
    mainWindow.webContents.openDevTools();
  } else {
    // Disable DevTools keyboard shortcuts in production
    mainWindow.webContents.on('before-input-event', (event, input) => {
      // Block Ctrl+Shift+I (DevTools)
      if (input.control && input.shift && input.key.toLowerCase() === 'i') {
        event.preventDefault();
      }
      // Block Ctrl+Shift+1 (DevTools - alternative)
      if (input.control && input.shift && input.key === '1') {
        event.preventDefault();
      }
      // Block F12 (DevTools)
      if (input.key === 'F12') {
        event.preventDefault();
      }
    });
  }
  
  if (isDev) {
    // In dev mode, try Angular dev server first, then fallback to file
    mainWindow.loadURL('http://localhost:4200').catch((err) => {
      console.log('Dev server not available, loading from file:', err);
      mainWindow?.loadFile(filePath).catch((fileErr) => {
        console.error('Failed to load file:', fileErr);
      });
    });
  } else {
    // In production, load from file
    mainWindow.loadFile(filePath).catch((err) => {
      console.error('Failed to load file:', err);
    });
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  // Set app icon for macOS dock (optional, window icon handles Windows/Linux)
  if (process.platform === 'darwin') {
    const iconPath = path.join(__dirname, '../assets/icon.png');
    if (fs.existsSync(iconPath)) {
      app.dock?.setIcon(iconPath);
    }
  }

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Window control IPC handlers
ipcMain.on('window:minimize', () => {
  if (mainWindow) {
    mainWindow.minimize();
  }
});

ipcMain.on('window:maximize', () => {
  if (mainWindow) {
    mainWindow.maximize();
  }
});

ipcMain.on('window:unmaximize', () => {
  if (mainWindow) {
    mainWindow.unmaximize();
  }
});

ipcMain.on('window:toggleMaximize', () => {
  if (mainWindow) {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
    // Notify renderer of window state change
    mainWindow.webContents.send('window:maximize-changed', mainWindow.isMaximized());
  }
});

ipcMain.on('window:close', () => {
  if (mainWindow) {
    mainWindow.close();
  }
});

// IPC Handlers
ipcMain.handle('organizer:preview', async () => {
  try {
    const config = await configService.getConfig();
    const preview = await organizerService.preview(config.enabledCategories);
    return { success: true, data: preview };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('organizer:execute', async () => {
  try {
    const config = await configService.getConfig();
    const session = await organizerService.execute(config.enabledCategories);
    await sessionService.saveSession(session);
    return { success: true, data: session };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('organizer:rollback', async (_event, sessionId: string) => {
  try {
    const session = await sessionService.getSession(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }
    await organizerService.rollback(session);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('organizer:getSessions', async () => {
  try {
    const sessions = await sessionService.getAllSessions();
    return { success: true, data: sessions };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('organizer:getConfig', async () => {
  try {
    const config = await configService.getConfig();
    return { success: true, data: config };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('organizer:saveConfig', async (_event, config: any) => {
  try {
    await configService.saveConfig(config);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

