import { Routes } from '@angular/router';
import { LayoutComponent } from './layout.component';
import { roleGuard } from '../core/guards/role.guard';

export const layoutRoutes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('../features/dashboard/dashboard.component')
            .then(m => m.DashboardComponent)
        // All authenticated users can see dashboard
      },
      {
        path: 'products',
        loadChildren: () =>
          import('../features/products/products.routes')
            .then(m => m.productRoutes)
        // All authenticated users can VIEW products
        // Create/Edit/Delete is controlled inside the component
      },
      {
        path: 'stock',
        canActivate: [roleGuard(['SUPER_ADMIN', 'ADMIN', 'INVENTORY_OPERATOR'])],
        loadChildren: () =>
          import('../features/stock/stock.routes')
            .then(m => m.stockRoutes)
      },
      {
        path: 'users',
        canActivate: [roleGuard(['SUPER_ADMIN', 'ADMIN'])],
        loadChildren: () =>
          import('../features/users/users.routes')
            .then(m => m.userRoutes)
      },
      {
        path: 'tenants',
        canActivate: [roleGuard(['SUPER_ADMIN'])],
        loadChildren: () =>
          import('../features/tenants/tenants.routes')
            .then(m => m.tenantRoutes)
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }
    ]
  }
];