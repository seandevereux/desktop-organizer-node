import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';
import { Session } from '../types';

export class SessionService {
  private sessionsPath: string;

  constructor() {
    const appDataPath = this.getAppDataPath();
    this.sessionsPath = path.join(appDataPath, 'sessions.json');
    this.ensureAppDataDir();
  }

  async saveSession(session: Session): Promise<void> {
    const sessions = await this.getAllSessions();
    sessions.push(session);
    await fs.writeFile(this.sessionsPath, JSON.stringify(sessions, null, 2), 'utf-8');
  }

  async getAllSessions(): Promise<Session[]> {
    try {
      const data = await fs.readFile(this.sessionsPath, 'utf-8');
      const sessions = JSON.parse(data) as Session[];
      // Convert date strings back to Date objects
      return sessions.map(s => ({
        ...s,
        createdAt: new Date(s.createdAt),
      }));
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        return [];
      }
      throw error;
    }
  }

  async getSession(id: string): Promise<Session | null> {
    const sessions = await this.getAllSessions();
    return sessions.find(s => s.id === id) || null;
  }

  private getAppDataPath(): string {
    const platform = process.platform;
    if (platform === 'win32') {
      return path.join(os.homedir(), 'AppData', 'Roaming', 'DesktopOrganizer');
    } else if (platform === 'darwin') {
      return path.join(os.homedir(), 'Library', 'Application Support', 'DesktopOrganizer');
    } else {
      return path.join(os.homedir(), '.config', 'DesktopOrganizer');
    }
  }

  private async ensureAppDataDir(): Promise<void> {
    const appDataPath = this.getAppDataPath();
    try {
      await fs.mkdir(appDataPath, { recursive: true });
    } catch (error: any) {
      if (error.code !== 'EEXIST') {
        throw error;
      }
    }
  }
}

