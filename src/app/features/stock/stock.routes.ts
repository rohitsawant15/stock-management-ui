import { Routes } from '@angular/router';

export const stockRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./stock-operation.component').then(m => m.StockOperationComponent)
  },
  {
    path: 'history',
    loadComponent: () =>
      import('./stock-history.component').then(m => m.StockHistoryComponent)
  }
];