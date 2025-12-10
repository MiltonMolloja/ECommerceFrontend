# Product Detail - Guía de Uso

## Navegación al Detalle de Producto

### Desde un Componente TypeScript

```typescript
import { Router } from '@angular/router';
import { inject } from '@angular/core';

export class ProductCardComponent {
  private router = inject(Router);

  navigateToProduct(productId: string): void {
    this.router.navigate(['/product', productId]);
  }

  // Con query params adicionales (opcional)
  navigateToProductWithSource(productId: string, source: string): void {
    this.router.navigate(['/product', productId], {
      queryParams: { source }
    });
  }
}
```

### Desde un Template HTML

```html
<!-- Link simple -->
<a [routerLink]="['/product', product.id]">
  Ver detalle
</a>

<!-- Link con clase CSS -->
<a
  [routerLink]="['/product', product.id]"
  class="product-link"
  [attr.aria-label]="'Ver detalle de ' + product.name"
>
  {{ product.name }}
</a>

<!-- Botón que navega -->
<button
  mat-raised-button
  (click)="router.navigate(['/product', product.id])"
>
  Ver Producto
</button>
```

### Desde Búsqueda o Listado

```html
<!-- En un listado de productos -->
<div class="product-grid">
  <mat-card
    *ngFor="let product of products()"
    class="product-card"
    [routerLink]="['/product', product.id]"
    role="link"
    tabindex="0"
  >
    <img [src]="product.image" [alt]="product.name" />
    <h3>{{ product.name }}</h3>
    <p class="price">{{ product.price | currency }}</p>
  </mat-card>
</div>
```

## Uso Standalone de Componentes

### ProductDetailImagesComponent

```typescript
import { ProductDetailImagesComponent } from '@features/product-detail';

@Component({
  standalone: true,
  imports: [ProductDetailImagesComponent],
  template: `
    <app-product-detail-images
      [images]="productImages"
      [productName]="productName"
    ></app-product-detail-images>
  `
})
export class MyComponent {
  productImages = [
    'https://example.com/image1.jpg',
    'https://example.com/image2.jpg',
    'https://example.com/image3.jpg'
  ];
  productName = 'iPhone 15 Pro';
}
```

### ProductDetailInfoComponent

```typescript
import { ProductDetailInfoComponent, ProductInfo } from '@features/product-detail';

@Component({
  standalone: true,
  imports: [ProductDetailInfoComponent],
  template: `
    <app-product-detail-info
      [product]="productInfo"
      (addToCartClicked)="onAddToCart($event)"
    ></app-product-detail-info>
  `
})
export class MyComponent {
  productInfo: ProductInfo = {
    productId: '123',
    name: 'iPhone 15 Pro',
    brand: 'Apple',
    category: 'Smartphones',
    price: {
      current: 999.99,
      original: 1199.99,
      currency: 'USD',
      discount: 16.67
    },
    rating: {
      average: 4.5,
      count: 1234
    },
    availability: {
      inStock: true,
      quantity: 25
    },
    features: [
      'A17 Pro chip',
      '6.1" Super Retina XDR',
      'Pro camera system',
      '5G capable'
    ],
    imageUrl: 'https://example.com/iphone.jpg'
  };

  onAddToCart(quantity: number): void {
    console.log(`Adding ${quantity} items to cart`);
    // Implementar lógica
  }
}
```

### ProductSpecificationsComponent

```typescript
import { ProductSpecificationsComponent } from '@features/product-detail';

@Component({
  standalone: true,
  imports: [ProductSpecificationsComponent],
  template: `
    <app-product-specifications
      [specifications]="specs"
      [groupByPrefix]="true"
    ></app-product-specifications>
  `
})
export class MyComponent {
  specs = {
    // Pantalla
    'Pantalla: Tamaño': '6.1 pulgadas',
    'Pantalla: Tipo': 'Super Retina XDR',
    'Pantalla: Resolución': '2556 x 1179 px',

    // Procesador
    'Procesador: Chip': 'A17 Pro',
    'Procesador: Núcleos': '6 núcleos',

    // Memoria
    'Memoria: RAM': '8 GB',
    'Memoria: Almacenamiento': '256 GB',

    // Batería
    'Batería: Capacidad': '3274 mAh',
    'Batería: Tipo': 'Litio-Ion',

    // Cámara
    'Cámara: Principal': '48 MP',
    'Cámara: Ultra angular': '12 MP',
    'Cámara: Frontal': '12 MP',

    // Dimensiones
    'Dimensiones: Alto': '146.6 mm',
    'Dimensiones: Ancho': '70.6 mm',
    'Dimensiones: Grosor': '8.25 mm',
    'Dimensiones: Peso': '187 g',

    // Sistema
    'Sistema: OS': 'iOS 17',

    // Conectividad
    'Conectividad: 5G': 'Sí',
    'Conectividad: WiFi': 'WiFi 6E',
    'Conectividad: Bluetooth': '5.3',

    // General
    'Color': 'Titanio Natural',
    'Material': 'Titanio y vidrio',
    'Resistencia': 'IP68'
  };
}
```

## Integración con Servicios

### Con ProductSearchService

```typescript
import { ProductSearchService } from '@features/product-search';
import { Router } from '@angular/router';

@Component({...})
export class SearchResultsComponent {
  private searchService = inject(ProductSearchService);
  private router = inject(Router);

  navigateToProduct(productId: string): void {
    // Opcionalmente, obtener datos antes de navegar
    this.searchService.getProductById(productId).subscribe({
      next: (product) => {
        this.router.navigate(['/product', productId]);
      },
      error: (err) => {
        console.error('Product not found', err);
      }
    });
  }
}
```

### Con CartService

```typescript
import { CartService } from '@core/services';

@Component({...})
export class ProductDetailComponent {
  private cartService = inject(CartService);

  addProductToCart(product: ProductInfo, quantity: number): void {
    for (let i = 0; i < quantity; i++) {
      this.cartService.addToCart({
        id: product.productId.toString(),
        name: product.name,
        price: product.price.current,
        currency: product.price.currency,
        imageUrl: product.imageUrl || '/assets/placeholder.png',
        brand: product.brand,
        inStock: product.availability.inStock
      });
    }
  }
}
```

## Ejemplo de Mock Data para Testing

```typescript
// mock-product-data.ts
export const MOCK_PRODUCT_RESPONSE = {
  productId: 1,
  name: 'Samsung Galaxy S24 Ultra',
  description: 'El smartphone más potente de Samsung con AI avanzada',
  price: 1299.99,
  originalPrice: 1499.99,
  currency: 'USD',
  discountPercentage: 13,
  averageRating: 4.7,
  reviewCount: 856,
  imageUrls: [
    'https://example.com/s24-ultra-front.jpg',
    'https://example.com/s24-ultra-back.jpg',
    'https://example.com/s24-ultra-side.jpg',
    'https://example.com/s24-ultra-display.jpg'
  ],
  brand: { name: 'Samsung', id: 'samsung' },
  category: { name: 'Smartphones', id: 'smartphones' },
  inStock: true,
  stock: 45,
  features: [
    'S Pen incluido',
    'Cámara de 200MP con AI',
    'Snapdragon 8 Gen 3',
    'Batería de 5000mAh',
    'Pantalla Dynamic AMOLED 2X de 6.8"',
    'Carga rápida de 45W'
  ],
  specifications: {
    'Pantalla: Tamaño': '6.8 pulgadas',
    'Pantalla: Tipo': 'Dynamic AMOLED 2X',
    'Pantalla: Resolución': '3120 x 1440 px',
    'Pantalla: Tasa de refresco': '120 Hz',
    'Procesador: Chip': 'Snapdragon 8 Gen 3',
    'Procesador: CPU': 'Octa-core',
    'Procesador: GPU': 'Adreno 750',
    'Memoria: RAM': '12 GB',
    'Memoria: Almacenamiento': '512 GB',
    'Memoria: Tipo': 'UFS 4.0',
    'Cámara: Principal': '200 MP f/1.7',
    'Cámara: Ultra angular': '12 MP f/2.2',
    'Cámara: Telefoto': '50 MP f/3.4 (5x)',
    'Cámara: Periscopio': '10 MP f/2.4 (3x)',
    'Cámara: Frontal': '12 MP f/2.2',
    'Cámara: Zoom': 'Hasta 100x',
    'Batería: Capacidad': '5000 mAh',
    'Batería: Carga rápida': '45W',
    'Batería: Carga inalámbrica': '15W',
    'Dimensiones: Alto': '162.3 mm',
    'Dimensiones: Ancho': '79.0 mm',
    'Dimensiones: Grosor': '8.6 mm',
    'Dimensiones: Peso': '232 g',
    'Sistema: OS': 'Android 14',
    'Sistema: UI': 'One UI 6.1',
    'Conectividad: 5G': 'Sí (Sub-6, mmWave)',
    'Conectividad: WiFi': 'WiFi 7',
    'Conectividad: Bluetooth': '5.3',
    'Conectividad: NFC': 'Sí',
    'Conectividad: USB': 'Type-C 3.2',
    'Seguridad: Biometría': 'Huella ultrasónica',
    'Seguridad: Reconocimiento facial': 'Sí',
    'Resistencia: Certificación': 'IP68',
    'Resistencia: Gorilla Glass': 'Victus 2',
    'Color': 'Titanium Gray',
    'Material: Marco': 'Titanio',
    'Material: Trasera': 'Gorilla Glass Victus 2',
    'Extras: S Pen': 'Incluido',
    'Extras: Samsung DeX': 'Sí',
    'Extras: Dolby Atmos': 'Sí'
  }
};

// En tests
import { MOCK_PRODUCT_RESPONSE } from './mock-product-data';

it('should display product information', () => {
  component.productResponse.set(MOCK_PRODUCT_RESPONSE);
  fixture.detectChanges();

  expect(component.productInfo()?.name).toBe('Samsung Galaxy S24 Ultra');
  expect(component.productImages().length).toBe(4);
});
```

## Personalización de Estilos

### Temas de Material

```scss
// En tu archivo de tema global
@use '@angular/material' as mat;

// Definir colores personalizados para product-detail
$custom-primary: mat.define-palette(mat.$indigo-palette);
$custom-accent: mat.define-palette(mat.$pink-palette);
$custom-warn: mat.define-palette(mat.$red-palette);

// Aplicar al tema
$custom-theme: mat.define-light-theme((
  color: (
    primary: $custom-primary,
    accent: $custom-accent,
    warn: $custom-warn,
  )
));

// Incluir en product-detail específicamente
.product-detail-page {
  @include mat.all-component-themes($custom-theme);
}
```

### Estilos CSS Custom

```scss
// Override de estilos específicos
.product-detail-container {
  --product-primary-color: #1976d2;
  --product-discount-color: #d32f2f;
  --product-success-color: #388e3c;
  --product-border-radius: 8px;
  --product-spacing: 16px;
}

// Uso en componentes hijos
.price-container {
  .current-price {
    color: var(--product-discount-color);
  }
}
```

## Interceptores para Logging

```typescript
// product-view.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';
import { tap } from 'rxjs/operators';

export const productViewInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.url.includes('/api/products/') && req.method === 'GET') {
    return next(req).pipe(
      tap({
        next: (response) => {
          console.log('📦 Product loaded:', response);
          // Track analytics
        },
        error: (error) => {
          console.error('❌ Product load failed:', error);
          // Track error
        }
      })
    );
  }
  return next(req);
};
```

## Guards para Protección de Rutas

```typescript
// product-exists.guard.ts
import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

export const productExistsGuard: CanActivateFn = (route) => {
  const http = inject(HttpClient);
  const router = inject(Router);
  const productId = route.params['id'];

  return http.get(`/api/products/${productId}`).pipe(
    map(() => true),
    catchError(() => {
      router.navigate(['/404']);
      return of(false);
    })
  );
};

// En routes
{
  path: 'product/:id',
  canActivate: [productExistsGuard],
  loadChildren: () => import('./product-detail.routes')
}
```

## Tips y Buenas Prácticas

### 1. Manejo de Errores

```typescript
// Siempre proporcionar feedback al usuario
private loadProduct(id: string): void {
  this.loading.set(true);
  this.error.set(null);

  this.http.get<ProductDetailResponse>(`/api/products/${id}`)
    .pipe(
      retry(2), // Reintentar 2 veces antes de fallar
      catchError((error) => {
        this.error.set('Error al cargar el producto');
        this.snackBar.open('Error al cargar', 'Cerrar', { duration: 5000 });
        return of(null);
      }),
      finalize(() => this.loading.set(false))
    )
    .subscribe();
}
```

### 2. Performance

```typescript
// Usar OnPush change detection
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush
})

// Usar trackBy en listas
trackByImageIndex(index: number): number {
  return index;
}

// Lazy load de imágenes
<img loading="lazy" [src]="image" />
```

### 3. Accesibilidad

```html
<!-- Labels descriptivos -->
<button
  mat-icon-button
  aria-label="Imagen anterior"
  [attr.aria-disabled]="!hasPrevious()"
>
  <mat-icon>chevron_left</mat-icon>
</button>

<!-- Roles semánticos -->
<nav aria-label="Breadcrumb">
  <ol>...</ol>
</nav>

<section aria-labelledby="reviews-heading">
  <h2 id="reviews-heading">Opiniones</h2>
</section>
```

### 4. SEO

```typescript
// Actualizar título y meta tags
import { Title, Meta } from '@angular/platform-browser';

private updateMetaTags(product: ProductDetailResponse): void {
  this.title.setTitle(`${product.name} - Mi Tienda`);

  this.meta.updateTag({
    name: 'description',
    content: product.description || ''
  });

  this.meta.updateTag({
    property: 'og:title',
    content: product.name || ''
  });

  this.meta.updateTag({
    property: 'og:image',
    content: product.imageUrls?.[0] || ''
  });
}
```

## Troubleshooting

### Imágenes no cargan
```typescript
// Verificar CORS y URLs
// Implementar fallback
get currentImage(): string {
  return this.images[this.selectedIndex()] || '/assets/placeholder.png';
}
```

### Precio no formatea correctamente
```typescript
// Verificar locale en app.config.ts
providers: [
  { provide: LOCALE_ID, useValue: 'es-AR' }
]
```

### Reviews no aparecen
```typescript
// Verificar que productId sea número
productIdNumber = computed(() => {
  const id = this.product()?.productId;
  return typeof id === 'number' ? id : parseInt(id as string, 10);
});
```

## Recursos Adicionales

- [Angular Material Documentation](https://material.angular.io/)
- [Angular Signals Guide](https://angular.dev/guide/signals)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Material Design 3](https://m3.material.io/)
