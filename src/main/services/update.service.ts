import * as https from 'https';
import { app } from 'electron';

export interface UpdateManifest {
  apps: {
    'desktop-organizer': {
      Windows: {
        latestVersion: string;
        versions: Array<{
          appName: string;
          version: string;
          platform: string;
          downloadUrl: string;
          fileSize: number;
          releaseDate: string;
          changelog: string;
        }>;
      };
    };
  };
  lastUpdated: string;
}

export interface UpdateCheckResult {
  hasUpdate: boolean;
  latestVersion: string;
  currentVersion: string;
  downloadUrl?: string;
  fileSize?: number;
  releaseDate?: string;
  changelog?: string;
}

export class UpdateService {
  private readonly UPDATE_API_URL = 'https://www.distrolutions.com/api/updates/manifest';
  private readonly APP_NAME = 'desktop-organizer';
  private readonly CURRENT_VERSION = app.getVersion();

  async checkForUpdates(): Promise<UpdateCheckResult> {
    try {
      const manifest = await this.fetchManifest();
      const windowsInfo = manifest.apps[this.APP_NAME]?.Windows;
      
      if (!windowsInfo) {
        throw new Error('App not found in manifest');
      }

      const latestVersion = windowsInfo.latestVersion;
      const hasUpdate = this.isNewerVersion(latestVersion, this.CURRENT_VERSION);

      if (hasUpdate) {
        const latestVersionInfo = windowsInfo.versions.find(v => v.version === latestVersion);
        return {
          hasUpdate: true,
          latestVersion,
          currentVersion: this.CURRENT_VERSION,
          downloadUrl: latestVersionInfo?.downloadUrl,
          fileSize: latestVersionInfo?.fileSize,
          releaseDate: latestVersionInfo?.releaseDate,
          changelog: latestVersionInfo?.changelog,
        };
      }

      return {
        hasUpdate: false,
        latestVersion,
        currentVersion: this.CURRENT_VERSION,
      };
    } catch (error: any) {
      console.error('Failed to check for updates:', error);
      throw new Error(`Update check failed: ${error.message}`);
    }
  }

  getCurrentVersion(): string {
    return this.CURRENT_VERSION;
  }

  private async fetchManifest(): Promise<UpdateManifest> {
    return new Promise((resolve, reject) => {
      https.get(this.UPDATE_API_URL, (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          try {
            const manifest = JSON.parse(data) as UpdateManifest;
            resolve(manifest);
          } catch (error: any) {
            reject(new Error(`Failed to parse manifest: ${error.message}`));
          }
        });
      }).on('error', (error) => {
        reject(error);
      });
    });
  }

  private isNewerVersion(latest: string, current: string): boolean {
    const latestParts = latest.split('.').map(Number);
    const currentParts = current.split('.').map(Number);

    for (let i = 0; i < Math.max(latestParts.length, currentParts.length); i++) {
      const latestPart = latestParts[i] || 0;
      const currentPart = currentParts[i] || 0;

      if (latestPart > currentPart) {
        return true;
      } else if (latestPart < currentPart) {
        return false;
      }
    }

    return false; // Versions are equal
  }
}

