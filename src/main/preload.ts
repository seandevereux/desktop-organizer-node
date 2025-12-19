import { contextBridge, ipcRenderer } from 'electron';

export interface PreviewMove {
  from: string;
  to: string;
  category: string;
}

export interface PreviewResult {
  moves: PreviewMove[];
}

export interface Session {
  id: string;
  createdAt: Date;
  moves: Array<{ from: string; to: string }>;
}

export interface Config {
  enabledCategories: string[];
}

const organizerAPI = {
  preview: (): Promise<{ success: boolean; data?: PreviewResult; error?: string }> =>
    ipcRenderer.invoke('organizer:preview'),
  
  execute: (): Promise<{ success: boolean; data?: Session; error?: string }> =>
    ipcRenderer.invoke('organizer:execute'),
  
  rollback: (sessionId: string): Promise<{ success: boolean; error?: string }> =>
    ipcRenderer.invoke('organizer:rollback', sessionId),
  
  getSessions: (): Promise<{ success: boolean; data?: Session[]; error?: string }> =>
    ipcRenderer.invoke('organizer:getSessions'),
  
  getConfig: (): Promise<{ success: boolean; data?: Config; error?: string }> =>
    ipcRenderer.invoke('organizer:getConfig'),
  
  saveConfig: (config: Config): Promise<{ success: boolean; error?: string }> =>
    ipcRenderer.invoke('organizer:saveConfig', config),
  
  minimize: (): void => ipcRenderer.send('window:minimize'),
  maximize: (): void => ipcRenderer.send('window:maximize'),
  unmaximize: (): void => ipcRenderer.send('window:unmaximize'),
  toggleMaximize: (): void => ipcRenderer.send('window:toggleMaximize'),
  close: (): void => ipcRenderer.send('window:close'),
  onMaximizeChanged: (callback: (isMaximized: boolean) => void) => {
    ipcRenderer.on('window:maximize-changed', (_event, isMaximized: boolean) => callback(isMaximized));
  },
  checkForUpdates: (): Promise<{ success: boolean; data?: any; error?: string }> =>
    ipcRenderer.invoke('update:check'),
  getVersion: (): Promise<{ success: boolean; data?: string; error?: string }> =>
    ipcRenderer.invoke('update:getVersion'),
  onUpdateAvailable: (callback: (updateInfo: { latestVersion: string; currentVersion: string; downloadUrl?: string }) => void) => {
    ipcRenderer.on('update:available', (_event, updateInfo) => callback(updateInfo));
  },
};

contextBridge.exposeInMainWorld('organizer', organizerAPI);

declare global {
  interface Window {
    organizer: typeof organizerAPI;
  }
}

