import { Routes } from '@angular/router';

export const authRoutes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    // Lazy load the component itself — no module needed in standalone
    loadComponent: () =>
      import('./login.component')
        .then(m => m.LoginComponent)
  }
];