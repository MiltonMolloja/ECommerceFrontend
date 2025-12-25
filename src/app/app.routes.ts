import { Routes } from '@angular/router';
import { externalLoginGuard } from './core/guards/external-login.guard';

export const routes: Routes = [
  {
    path: 'login',
    canActivate: [externalLoginGuard],
    children: []
  },
  {
    path: 'login-callback',
    loadComponent: () =>
      import('./features/auth/callback/auth-callback.component').then(
        (m) => m.AuthCallbackComponent
      )
  },
  {
    path: '',
    loadComponent: () =>
      import('./layouts/main-layout/main-layout.component').then((m) => m.MainLayoutComponent),
    children: [
      {
        path: '',
        loadComponent: () => import('./features/home/home.component').then((m) => m.HomeComponent)
      },
      {
        path: 'catalog',
        loadChildren: () =>
          import('./features/catalog/catalog.routes').then((m) => m.CATALOG_ROUTES)
      },
      {
        path: 'cart',
        loadComponent: () => import('./features/cart/cart.component').then((m) => m.CartComponent)
      },
      {
        path: 'checkout',
        loadComponent: () => import('./features/checkout/checkout').then((m) => m.CheckoutComponent)
      },
      {
        path: 'order-confirmation',
        loadComponent: () =>
          import('./features/order-confirmation/order-confirmation').then(
            (m) => m.OrderConfirmationComponent
          )
      },
      {
        path: 'payment-error',
        loadComponent: () =>
          import('./features/payment-error/payment-error').then((m) => m.PaymentErrorComponent)
      },
      {
        path: 'orders',
        loadChildren: () => import('./features/orders/orders.routes').then((m) => m.ORDERS_ROUTES)
      },
      {
        path: 's',
        loadChildren: () =>
          import('./features/product-search/product-search.routes').then(
            (m) => m.PRODUCT_SEARCH_ROUTES
          )
      },
      {
        path: 'search',
        redirectTo: 's',
        pathMatch: 'full'
      },
      {
        path: 'deals',
        redirectTo: 's?hasDiscount=true',
        pathMatch: 'full'
      },
      {
        path: 'product/:id',
        loadChildren: () =>
          import('./features/product-detail/product-detail.routes').then(
            (m) => m.PRODUCT_DETAIL_ROUTES
          )
      },
      {
        path: 'help',
        loadComponent: () => import('./features/help/help').then((m) => m.HelpComponent)
      }
    ]
  },
  {
    path: '**',
    redirectTo: ''
  }
];
