import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrganizerService } from '../../services/organizer.service';
import { Session } from '../../types/electron';

@Component({
  selector: 'app-rollback',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="rollback">
      <div class="rollback-header">
        <h2>Rollback History</h2>
        <p class="subtitle">View and rollback previous organization sessions</p>
      </div>

      <div *ngIf="loading()" class="loading">
        Loading sessions...
      </div>

      <div *ngIf="error()" class="error-message">
        {{ error() }}
      </div>

      <div *ngIf="success()" class="success-message">
        {{ success() }}
      </div>

      <div *ngIf="sessions().length === 0 && !loading()" class="empty-state">
        <p>No organization sessions found.</p>
      </div>

      <div *ngIf="sessions().length > 0" class="sessions-list">
        <div *ngFor="let session of sessions()" class="session-card">
          <div class="session-header">
            <div class="session-info">
              <h3>Session {{ session.id.substring(0, 8) }}</h3>
              <p class="session-date">{{ formatDate(session.createdAt) }}</p>
            </div>
            <button 
              (click)="rollbackSession(session.id)" 
              [disabled]="loading()"
              class="btn btn-danger">
              Rollback Session
            </button>
          </div>
          <div class="session-details">
            <p><strong>{{ session.moves.length }}</strong> files moved</p>
            <details>
              <summary>View file movements</summary>
              <div class="moves-list">
                <div *ngFor="let move of session.moves" class="move-item">
                  <span class="from">{{ getFileName(move.from) }}</span>
                  <span class="arrow">→</span>
                  <span class="to">{{ getFileName(move.to) }}</span>
                </div>
              </div>
            </details>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .rollback {
      max-width: 1200px;
      margin: 0 auto;
    }

    .rollback-header {
      margin-bottom: 24px;
    }

    .rollback-header h2 {
      font-size: 28px;
      margin-bottom: 8px;
    }

    .subtitle {
      color: #666;
      font-size: 14px;
    }

    .loading {
      padding: 24px;
      text-align: center;
      color: #666;
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

    .empty-state {
      background: white;
      border-radius: 8px;
      padding: 48px;
      text-align: center;
      color: #666;
    }

    .sessions-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .session-card {
      background: white;
      border-radius: 8px;
      padding: 24px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .session-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 16px;
    }

    .session-info h3 {
      font-size: 18px;
      margin-bottom: 4px;
    }

    .session-date {
      color: #666;
      font-size: 14px;
    }

    .btn-danger {
      background: #d32f2f;
      color: white;
      padding: 8px 16px;
      border-radius: 4px;
      font-size: 14px;
    }

    .btn-danger:hover:not(:disabled) {
      background: #c62828;
    }

    .session-details {
      margin-top: 16px;
    }

    details {
      margin-top: 12px;
    }

    summary {
      cursor: pointer;
      color: #1976d2;
      font-weight: 500;
      margin-bottom: 8px;
    }

    summary:hover {
      text-decoration: underline;
    }

    .moves-list {
      margin-top: 12px;
      padding: 12px;
      background: #f5f5f5;
      border-radius: 4px;
      max-height: 300px;
      overflow-y: auto;
    }

    .move-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 0;
      font-size: 12px;
      border-bottom: 1px solid #e0e0e0;
    }

    .move-item:last-child {
      border-bottom: none;
    }

    .from, .to {
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .arrow {
      color: #999;
    }
  `]
})
export class RollbackComponent implements OnInit {
  sessions = signal<Session[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  success = signal<string | null>(null);

  constructor(private organizerService: OrganizerService) {}

  async ngOnInit() {
    await this.loadSessions();
  }

  async loadSessions() {
    this.loading.set(true);
    this.error.set(null);
    
    try {
      const sessions = await this.organizerService.getSessions();
      // Sort by date, newest first
      sessions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      this.sessions.set(sessions);
    } catch (err: any) {
      this.error.set(err.message || 'Failed to load sessions');
    } finally {
      this.loading.set(false);
    }
  }

  async rollbackSession(sessionId: string) {
    if (!confirm('Are you sure you want to rollback this session? Files will be moved back to their original locations.')) {
      return;
    }

    this.loading.set(true);
    this.error.set(null);
    this.success.set(null);

    try {
      await this.organizerService.rollback(sessionId);
      this.success.set('Session rolled back successfully!');
      await this.loadSessions(); // Refresh the list
    } catch (err: any) {
      this.error.set(err.message || 'Failed to rollback session');
    } finally {
      this.loading.set(false);
    }
  }

  formatDate(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleString();
  }

  getFileName(fullPath: string): string {
    const parts = fullPath.split(/[/\\]/);
    return parts[parts.length - 1];
  }
}

