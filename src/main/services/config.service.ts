import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';
import { Config } from '../types';

export class ConfigService {
  private configPath: string;
  private defaultConfig: Config = {
    enabledCategories: [
      'Images',
      'Documents',
      'Videos',
      'Audio',
      'Archives',
      'Code',
      'Shortcuts',
      'Executables',
      'Fonts',
      'Folders',
      'Other',
    ],
  };

  constructor() {
    const appDataPath = this.getAppDataPath();
    this.configPath = path.join(appDataPath, 'config.json');
    this.ensureAppDataDir();
  }

  async getConfig(): Promise<Config> {
    try {
      const data = await fs.readFile(this.configPath, 'utf-8');
      return JSON.parse(data) as Config;
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        // Return default config if file doesn't exist
        await this.saveConfig(this.defaultConfig);
        return this.defaultConfig;
      }
      throw error;
    }
  }

  async saveConfig(config: Config): Promise<void> {
    await fs.writeFile(this.configPath, JSON.stringify(config, null, 2), 'utf-8');
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

