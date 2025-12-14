import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { RollbackComponent } from './components/rollback/rollback.component';
import { ConfigComponent } from './components/config/config.component';

export const routes: Routes = [
  { path: '', component: DashboardComponent },
  { path: 'rollback', component: RollbackComponent },
  { path: 'config', component: ConfigComponent },
];

