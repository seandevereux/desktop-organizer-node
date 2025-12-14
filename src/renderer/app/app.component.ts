import { Component, OnInit } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  template: `
    <div class="splash-screen" [class.hidden]="!showSplash">
      <div class="splash-content">
        <div class="splash-logo-container">
          <img *ngIf="showIcon" [src]="iconPath" alt="Desktop Organizer" class="splash-logo" (error)="onIconError($event)">
          <div class="splash-logo-placeholder" *ngIf="!showIcon">📁</div>
        </div>
        <h1 class="splash-title">Desktop Organizer</h1>
        <div class="splash-loader">
          <div class="loader-bar"></div>
        </div>
      </div>
    </div>
    <div class="app-container" [class.fade-in]="!showSplash">
      <div class="title-bar">
        <div class="title-bar-drag-region">
          <img *ngIf="showIcon" [src]="iconPath" alt="Desktop Organizer" class="app-logo" (error)="onIconError($event)">
          <span class="title">Desktop Organizer</span>
        </div>
        <div class="window-controls">
          <button class="window-control minimize" (click)="minimize()" title="Minimize">−</button>
          <button class="window-control close" (click)="close()" title="Close">×</button>
        </div>
      </div>
      <header class="app-header">
        <nav class="nav-tabs">
          <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">Dashboard</a>
          <a routerLink="/rollback" routerLinkActive="active">Rollback</a>
          <a routerLink="/config" routerLinkActive="active">Configuration</a>
        </nav>
      </header>
      <main class="app-main">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    .splash-screen {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      transition: opacity 0.5s ease-out, visibility 0.5s ease-out;
      opacity: 1;
      visibility: visible;
    }

    .splash-screen.hidden {
      opacity: 0;
      visibility: hidden;
      pointer-events: none;
    }

    .splash-content {
      text-align: center;
      color: white;
    }

    .splash-logo-container {
      margin-bottom: 24px;
      animation: logoFloat 2s ease-in-out infinite;
    }

    .splash-logo {
      width: 80px;
      height: 80px;
      object-fit: contain;
      filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2));
    }

    .splash-logo-placeholder {
      font-size: 80px;
      line-height: 80px;
    }

    .splash-title {
      font-size: 32px;
      font-weight: 600;
      margin-bottom: 32px;
      animation: titleFadeIn 0.8s ease-out;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    }

    .splash-loader {
      width: 200px;
      height: 4px;
      background: rgba(255, 255, 255, 0.3);
      border-radius: 2px;
      overflow: hidden;
      margin: 0 auto;
    }

    .loader-bar {
      height: 100%;
      background: white;
      border-radius: 2px;
      animation: loaderProgress 2s ease-in-out;
      box-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
    }

    @keyframes logoFloat {
      0%, 100% {
        transform: translateY(0px);
      }
      50% {
        transform: translateY(-10px);
      }
    }

    @keyframes titleFadeIn {
      from {
        opacity: 0;
        transform: translateY(-20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes loaderProgress {
      from {
        width: 0%;
      }
      to {
        width: 100%;
      }
    }

    .app-container {
      display: flex;
      flex-direction: column;
      height: 100vh;
      overflow: hidden;
      border-radius: 8px;
      opacity: 0;
      transition: opacity 0.5s ease-in;
    }

    .app-container.fade-in {
      opacity: 1;
    }

    :host {
      display: block;
      border-radius: 8px;
      overflow: hidden;
    }

    .title-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #1976d2;
      color: white;
      height: 32px;
      -webkit-app-region: drag;
      user-select: none;
    }

    .title-bar-drag-region {
      flex: 1;
      display: flex;
      align-items: center;
      padding-left: 12px;
      gap: 8px;
      -webkit-app-region: drag;
    }

    .app-logo {
      width: 20px;
      height: 20px;
      object-fit: contain;
      -webkit-app-region: drag;
    }

    .title {
      font-size: 13px;
      font-weight: 500;
    }

    .window-controls {
      display: flex;
      -webkit-app-region: no-drag;
    }

    .window-control {
      width: 46px;
      height: 32px;
      border: none;
      background: transparent;
      color: white;
      font-size: 16px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background-color 0.2s;
    }

    .window-control:hover {
      background: rgba(255, 255, 255, 0.1);
    }

    .window-control.close:hover {
      background: #e81123;
    }

    .app-header {
      background: white;
      border-bottom: 1px solid #e0e0e0;
      padding: 16px 24px;
    }

    .nav-tabs {
      display: flex;
      gap: 24px;
    }

    .nav-tabs a {
      text-decoration: none;
      color: #666;
      padding: 8px 16px;
      border-radius: 4px;
      transition: background-color 0.2s;
    }

    .nav-tabs a:hover {
      background: #f0f0f0;
    }

    .nav-tabs a.active {
      color: #1976d2;
      background: #e3f2fd;
      font-weight: 500;
    }

    .app-main {
      flex: 1;
      overflow: auto;
      padding: 24px;
    }
  `]
})
export class AppComponent implements OnInit {
  iconPath = 'assets/icon.ico';
  showIcon = true;
  showSplash = true;

  ngOnInit() {
    // Try to load icon, fallback gracefully if not found
    const img = new Image();
    img.onerror = () => {
      this.showIcon = false;
    };
    img.src = this.iconPath;

    // Show splash screen for 2 seconds, then fade out
    setTimeout(() => {
      this.showSplash = false;
    }, 2000);
  }

  onIconError(event: any) {
    this.showIcon = false;
  }

  minimize() {
    window.organizer.minimize();
  }

  close() {
    window.organizer.close();
  }
}

