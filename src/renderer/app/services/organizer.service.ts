import { Injectable } from '@angular/core';
import { PreviewMove, PreviewResult, Session, Config } from '../types/electron';

@Injectable({
  providedIn: 'root'
})
export class OrganizerService {
  async preview(): Promise<PreviewResult> {
    const result = await window.organizer.preview();
    if (!result.success || !result.data) {
      throw new Error(result.error || 'Failed to preview changes');
    }
    return result.data;
  }

  async execute(): Promise<Session> {
    const result = await window.organizer.execute();
    if (!result.success || !result.data) {
      throw new Error(result.error || 'Failed to organize files');
    }
    return result.data;
  }

  async rollback(sessionId: string): Promise<void> {
    const result = await window.organizer.rollback(sessionId);
    if (!result.success) {
      throw new Error(result.error || 'Failed to rollback session');
    }
  }

  async getSessions(): Promise<Session[]> {
    const result = await window.organizer.getSessions();
    if (!result.success || !result.data) {
      throw new Error(result.error || 'Failed to load sessions');
    }
    return result.data;
  }

  async getConfig(): Promise<Config> {
    const result = await window.organizer.getConfig();
    if (!result.success || !result.data) {
      throw new Error(result.error || 'Failed to load config');
    }
    return result.data;
  }

  async saveConfig(config: Config): Promise<void> {
    const result = await window.organizer.saveConfig(config);
    if (!result.success) {
      throw new Error(result.error || 'Failed to save config');
    }
  }
}

