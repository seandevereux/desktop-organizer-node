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

export interface OrganizerAPI {
  preview(): Promise<{ success: boolean; data?: PreviewResult; error?: string }>;
  execute(): Promise<{ success: boolean; data?: Session; error?: string }>;
  rollback(sessionId: string): Promise<{ success: boolean; error?: string }>;
  getSessions(): Promise<{ success: boolean; data?: Session[]; error?: string }>;
  getConfig(): Promise<{ success: boolean; data?: Config; error?: string }>;
  saveConfig(config: Config): Promise<{ success: boolean; error?: string }>;
  minimize(): void;
  maximize(): void;
  unmaximize(): void;
  toggleMaximize(): void;
  close(): void;
  checkForUpdates(): Promise<{ success: boolean; data?: any; error?: string }>;
  getVersion(): Promise<{ success: boolean; data?: string; error?: string }>;
}

declare global {
  interface Window {
    organizer: OrganizerAPI;
  }
}

