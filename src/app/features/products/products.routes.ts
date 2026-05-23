import { Routes } from '@angular/router';
import { roleGuard } from '../../core/guards/role.guard';

export const productRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./product-list.component').then(m => m.ProductListComponent)
  },
  {
    path: 'new',
    // Only ADMIN and MANAGER can create products
    canActivate: [roleGuard(['SUPER_ADMIN', 'ADMIN', 'MANAGER'])],
    loadComponent: () =>
      import('./product-form.component').then(m => m.ProductFormComponent)
  },
  {
    path: 'edit/:id',
    // Only ADMIN and MANAGER can edit products
    canActivate: [roleGuard(['SUPER_ADMIN', 'ADMIN', 'MANAGER'])],
    loadComponent: () =>
      import('./product-form.component').then(m => m.ProductFormComponent)
  }
];