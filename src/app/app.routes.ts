import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'auth',
    loadChildren: () =>
      import('./features/auth/auth.routes')
        .then(m => m.authRoutes)
  },
  {
    path: '',
    canActivate: [authGuard],  // ← all routes under layout are now protected
    loadChildren: () =>
      import('./layout/layout.routes')
        .then(m => m.layoutRoutes)
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];