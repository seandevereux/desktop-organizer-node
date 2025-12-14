import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrganizerService } from '../../services/organizer.service';
import { Config } from '../../types/electron';

@Component({
  selector: 'app-config',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="config">
      <div class="config-header">
        <h2>Configuration</h2>
        <p class="subtitle">Enable or disable file categories for organization</p>
      </div>

      <div *ngIf="loading()" class="loading">
        Loading configuration...
      </div>

      <div *ngIf="error()" class="error-message">
        {{ error() }}
      </div>

      <div *ngIf="success()" class="success-message">
        {{ success() }}
      </div>

      <div *ngIf="!loading()" class="config-content">
        <div class="categories-list">
          <div *ngFor="let category of allCategories()" class="category-item">
            <label>
              <input 
                type="checkbox" 
                [checked]="enabledCategories().includes(category)"
                (change)="toggleCategory(category, $event)"
              />
              <span>{{ category }}</span>
            </label>
          </div>
        </div>

        <div class="config-actions">
          <button 
            (click)="saveConfig()" 
            [disabled]="loading() || saving()"
            class="btn btn-primary">
            Save Configuration
          </button>
          <button 
            (click)="resetConfig()" 
            [disabled]="loading() || saving()"
            class="btn btn-secondary">
            Reset to Defaults
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .config {
      max-width: 800px;
      margin: 0 auto;
    }

    .config-header {
      margin-bottom: 24px;
    }

    .config-header h2 {
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

    .config-content {
      background: white;
      border-radius: 8px;
      padding: 24px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .categories-list {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 12px;
      margin-bottom: 24px;
    }

    .category-item {
      padding: 8px;
    }

    .category-item label {
      display: flex;
      align-items: center;
      cursor: pointer;
      font-size: 14px;
    }

    .category-item input[type="checkbox"] {
      width: 18px;
      height: 18px;
      cursor: pointer;
    }

    .config-actions {
      display: flex;
      gap: 12px;
      padding-top: 16px;
      border-top: 1px solid #e0e0e0;
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

    .btn-secondary {
      background: #757575;
      color: white;
    }

    .btn-secondary:hover:not(:disabled) {
      background: #616161;
    }
  `]
})
export class ConfigComponent implements OnInit {
  allCategories = signal<string[]>([
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
  ]);
  
  enabledCategories = signal<string[]>([]);
  loading = signal(false);
  saving = signal(false);
  error = signal<string | null>(null);
  success = signal<string | null>(null);

  constructor(private organizerService: OrganizerService) {}

  async ngOnInit() {
    await this.loadConfig();
  }

  async loadConfig() {
    this.loading.set(true);
    this.error.set(null);
    
    try {
      const config = await this.organizerService.getConfig();
      this.enabledCategories.set(config.enabledCategories);
    } catch (err: any) {
      this.error.set(err.message || 'Failed to load configuration');
    } finally {
      this.loading.set(false);
    }
  }

  toggleCategory(category: string, event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    const current = this.enabledCategories();
    
    if (checked) {
      this.enabledCategories.set([...current, category]);
    } else {
      this.enabledCategories.set(current.filter(c => c !== category));
    }
  }

  async saveConfig() {
    this.saving.set(true);
    this.error.set(null);
    this.success.set(null);

    try {
      const config: Config = {
        enabledCategories: this.enabledCategories(),
      };
      await this.organizerService.saveConfig(config);
      this.success.set('Configuration saved successfully!');
    } catch (err: any) {
      this.error.set(err.message || 'Failed to save configuration');
    } finally {
      this.saving.set(false);
    }
  }

  async resetConfig() {
    if (!confirm('Reset to default configuration? All categories will be enabled.')) {
      return;
    }

    this.enabledCategories.set([...this.allCategories()]);
    await this.saveConfig();
  }
}

