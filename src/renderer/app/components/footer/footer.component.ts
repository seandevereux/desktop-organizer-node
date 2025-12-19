/// <reference path="../../types/electron.d.ts" />
import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";

@Component({
  selector: "app-footer",
  standalone: true,
  imports: [CommonModule],
  template: `
    <footer class="app-footer">
      <div class="footer-content">
        <div class="footer-brand">
          <span class="brand-text">© {{ currentYear }} Distrolutions</span>
        </div>
        <div class="footer-version">
          <span class="version-text">Version {{ appVersion }}</span>
          <span
            *ngIf="updateAvailable"
            class="update-badge"
            (click)="openUpdateLink()"
            title="Update available"
          >
            Update Available
          </span>
        </div>
      </div>
    </footer>
  `,
  styles: [
    `
      .app-footer {
        background: #f5f5f5;
        border-top: 1px solid #e0e0e0;
        padding: 12px 24px;
        margin-top: auto;
      }

      .footer-content {
        display: flex;
        justify-content: space-between;
        align-items: center;
        max-width: 100%;
      }

      .footer-brand {
        display: flex;
        align-items: center;
      }

      .brand-text {
        color: #666;
        font-size: 13px;
        font-weight: 500;
      }

      .footer-version {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .version-text {
        color: #999;
        font-size: 12px;
      }

      .update-badge {
        background: #1976d2;
        color: white;
        padding: 4px 12px;
        border-radius: 12px;
        font-size: 11px;
        font-weight: 500;
        cursor: pointer;
        transition: background-color 0.2s;
      }

      .update-badge:hover {
        background: #1565c0;
      }
    `,
  ],
})
export class FooterComponent implements OnInit {
  currentYear = new Date().getFullYear();
  appVersion = "1.2.0";
  updateAvailable = false;
  updateUrl?: string;

  ngOnInit() {
    this.loadVersion();
    this.checkForUpdates();

    // Listen for update available events from main process
    if (window.organizer.onUpdateAvailable) {
      window.organizer.onUpdateAvailable((updateInfo) => {
        this.updateAvailable = true;
        this.updateUrl = updateInfo.downloadUrl;
      });
    }
  }

  async loadVersion() {
    try {
      const result = await window.organizer.getVersion();
      if (result.success && result.data) {
        this.appVersion = result.data;
      }
    } catch (error) {
      console.error("Failed to load version:", error);
    }
  }

  async checkForUpdates() {
    try {
      const result = await window.organizer.checkForUpdates();
      if (result.success && result.data) {
        if (result.data.hasUpdate) {
          this.updateAvailable = true;
          this.updateUrl = result.data.downloadUrl;
        }
      }
    } catch (error) {
      console.error("Failed to check for updates:", error);
    }
  }

  openUpdateLink() {
    if (this.updateUrl) {
      // Open download URL in default browser
      window.open(this.updateUrl, "_blank");
    }
  }
}
