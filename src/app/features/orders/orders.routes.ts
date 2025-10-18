import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth-guard';

export const ORDERS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./orders-list/orders-list').then((m) => m.OrdersList),
    canActivate: [authGuard]
  },
  {
    path: 'new',
    loadComponent: () => import('./orders-create/orders-create').then((m) => m.OrdersCreate),
    canActivate: [authGuard]
  },
  {
    path: ':id',
    loadComponent: () => import('./order-detail/order-detail').then((m) => m.OrderDetail),
    canActivate: [authGuard]
  }
];
