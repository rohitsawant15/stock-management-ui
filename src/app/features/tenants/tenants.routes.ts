import { Routes } from '@angular/router';

export const tenantRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./tenant-list.component').then(m => m.TenantListComponent)
  },
  {
    path: 'new',
    loadComponent: () =>
      import('./tenant-form.component').then(m => m.TenantFormComponent)
  }
];