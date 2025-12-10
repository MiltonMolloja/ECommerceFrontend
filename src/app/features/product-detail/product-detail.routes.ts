import { Routes } from '@angular/router';

/**
 * Rutas del módulo de detalle de producto
 */
export const PRODUCT_DETAIL_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./product-detail.component').then((m) => m.ProductDetailComponent),
    title: 'Detalle del Producto'
  }
];

export default PRODUCT_DETAIL_ROUTES;
