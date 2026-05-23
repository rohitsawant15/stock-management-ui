import { Routes } from '@angular/router';
import { roleGuard } from '../../core/guards/role.guard';

export const userRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./user-list.component').then(m => m.UserListComponent)
  },
  {
    path: 'register',
    // Only ADMIN and SUPER_ADMIN can register users
    canActivate: [roleGuard(['SUPER_ADMIN', 'ADMIN'])],
    loadComponent: () =>
      import('./user-register.component').then(m => m.UserRegisterComponent)
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./user-detail.component').then(m => m.UserDetailComponent)
  }
];