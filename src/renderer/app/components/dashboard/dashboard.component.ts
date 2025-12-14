import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrganizerService } from '../../services/organizer.service';
import { PreviewMove, Session } from '../../types/electron';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="dashboard">
      <div class="dashboard-header">
        <h2>Organize Desktop</h2>
        <p class="subtitle">Preview and organize files on your desktop by category</p>
      </div>

      <div class="actions">
        <button 
          (click)="loadPreview()" 
          [disabled]="loading()"
          class="btn btn-primary">
          {{ previewData() ? 'Refresh Preview' : 'Preview Changes' }}
        </button>
        <button 
          (click)="organize()" 
          [disabled]="loading() || !previewData() || previewData()!.moves.length === 0"
          class="btn btn-success">
          Organize Desktop
        </button>
      </div>

      <div *ngIf="error()" class="error-message">
        {{ error() }}
      </div>

      <div *ngIf="success()" class="success-message">
        {{ success() }}
      </div>

      <div *ngIf="loading()" class="loading">
        Loading...
      </div>

      <div *ngIf="previewData() && previewData()!.moves.length > 0" class="preview-section">
        <h3>Preview Changes ({{ previewData()!.moves.length }} files)</h3>
        <div class="moves-list">
          <div *ngFor="let move of previewData()!.moves" class="move-item">
            <div class="move-info">
              <span class="file-name">{{ getFileName(move.from) }}</span>
              <span class="category-badge">{{ move.category }}</span>
            </div>
            <div class="move-path">
              <span class="from">{{ getRelativePath(move.from) }}</span>
              <span class="arrow">→</span>
              <span class="to">{{ getRelativePath(move.to) }}</span>
            </div>
          </div>
        </div>
      </div>

      <div *ngIf="previewData() && previewData()!.moves.length === 0" class="empty-state">
        <p>No files need to be organized. Your desktop is already organized!</p>
      </div>
    </div>
  `,
  styles: [`
    .dashboard {
      max-width: 1200px;
      margin: 0 auto;
    }

    .dashboard-header {
      margin-bottom: 24px;
    }

    .dashboard-header h2 {
      font-size: 28px;
      margin-bottom: 8px;
    }

    .subtitle {
      color: #666;
      font-size: 14px;
    }

    .actions {
      display: flex;
      gap: 12px;
      margin-bottom: 24px;
    }

    .btn {
      padding: 10px 20px;
      font-size: 14px;
      border-radius: 4px;
      font-weight: 500;
    }

    .btn-primary {
      background: #1976d2;
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      background: #1565c0;
    }

    .btn-success {
      background: #388e3c;
      color: white;
    }

    .btn-success:hover:not(:disabled) {
      background: #2e7d32;
    }

    .error-message {
      background: #ffebee;
      color: #c62828;
      padding: 12px;
      border-radius: 4px;
      margin-bottom: 16px;
    }

    .success-message {
      background: #e8f5e9;
      color: #2e7d32;
      padding: 12px;
      border-radius: 4px;
      margin-bottom: 16px;
    }

    .loading {
      padding: 24px;
      text-align: center;
      color: #666;
    }

    .preview-section {
      background: white;
      border-radius: 8px;
      padding: 24px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .preview-section h3 {
      margin-bottom: 16px;
      font-size: 20px;
    }

    .moves-list {
      max-height: 500px;
      overflow-y: auto;
    }

    .move-item {
      padding: 12px;
      border-bottom: 1px solid #e0e0e0;
    }

    .move-item:last-child {
      border-bottom: none;
    }

    .move-info {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 8px;
    }

    .file-name {
      font-weight: 500;
      color: #333;
    }

    .category-badge {
      background: #e3f2fd;
      color: #1976d2;
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 500;
    }

    .move-path {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 12px;
      color: #666;
    }

    .from {
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .arrow {
      color: #999;
    }

    .to {
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .empty-state {
      background: white;
      border-radius: 8px;
      padding: 48px;
      text-align: center;
      color: #666;
    }
  `]
})
export class DashboardComponent {
  previewData = signal<{ moves: PreviewMove[] } | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);
  success = signal<string | null>(null);

  constructor(private organizerService: OrganizerService) {}

  async loadPreview() {
    this.loading.set(true);
    this.error.set(null);
    this.success.set(null);
    
    try {
      const preview = await this.organizerService.preview();
      this.previewData.set(preview);
    } catch (err: any) {
      this.error.set(err.message || 'Failed to load preview');
    } finally {
      this.loading.set(false);
    }
  }

  async organize() {
    if (!this.previewData() || this.previewData()!.moves.length === 0) {
      return;
    }

    if (!confirm(`Are you sure you want to organize ${this.previewData()!.moves.length} files?`)) {
      return;
    }

    this.loading.set(true);
    this.error.set(null);
    this.success.set(null);

    try {
      const session = await this.organizerService.execute();
      this.success.set(`Successfully organized ${session.moves.length} files! Session ID: ${session.id}`);
      this.previewData.set(null); // Clear preview after organizing
    } catch (err: any) {
      this.error.set(err.message || 'Failed to organize files');
    } finally {
      this.loading.set(false);
    }
  }

  getFileName(fullPath: string): string {
    const parts = fullPath.split(/[/\\]/);
    return parts[parts.length - 1];
  }

  getRelativePath(fullPath: string): string {
    // Extract just the folder name or file name
    const parts = fullPath.split(/[/\\]/);
    if (parts.length > 1) {
      return parts.slice(-2).join('/');
    }
    return parts[parts.length - 1];
  }
}

