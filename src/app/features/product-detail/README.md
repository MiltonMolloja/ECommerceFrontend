# Product Detail Feature

Página completa de detalle de producto implementada con Angular 17+ y Material Design.

## Estructura de Archivos

```
product-detail/
├── product-detail.component.ts          # Componente principal
├── product-detail.component.html        # Template principal
├── product-detail.component.scss        # Estilos principales
├── product-detail.routes.ts             # Configuración de rutas
├── index.ts                             # Barrel file
├── README.md                            # Documentación
└── components/
    ├── product-detail-images/           # Galería de imágenes
    │   ├── product-detail-images.component.ts
    │   ├── product-detail-images.component.html
    │   └── product-detail-images.component.scss
    ├── product-detail-info/             # Información y acciones
    │   ├── product-detail-info.component.ts
    │   ├── product-detail-info.component.html
    │   └── product-detail-info.component.scss
    └── product-specifications/          # Especificaciones técnicas
        ├── product-specifications.component.ts
        ├── product-specifications.component.html
        └── product-specifications.component.scss
```

## Componentes

### ProductDetailComponent (Principal)

**Responsabilidades:**
- Gestión del estado global de la página
- Carga de datos del producto desde la API
- Integración de todos los sub-componentes
- Manejo de errores y estados de carga
- Navegación y breadcrumbs
- Analytics tracking

**Características:**
- Standalone component con Angular Signals
- Lazy loading con rutas
- Soporte multi-idioma con LanguageService
- Skeleton screens durante la carga
- Manejo de errores con retry
- Responsive design completo

**API:**
```typescript
// Route parameter
productId: string (de /product/:id)

// Signals
loading: Signal<boolean>
error: Signal<string | null>
productResponse: Signal<ProductDetailResponse | null>
productImages: Signal<string[]>
productInfo: Signal<ProductInfo | null>
productSpecifications: Signal<Record<string, string>>
```

### ProductDetailImagesComponent

**Responsabilidades:**
- Galería de imágenes del producto
- Navegación entre imágenes
- Thumbnail carousel
- Estados de carga y error

**Características:**
- Imagen principal grande con aspect ratio 1:1
- Navegación con flechas (anterior/siguiente)
- Indicadores de posición
- Thumbnails clicables con scroll horizontal
- Lazy loading de imágenes
- Estados de loading y error
- Animaciones suaves

**Inputs:**
```typescript
@Input() images: string[]           // Array de URLs de imágenes
@Input() productName: string        // Nombre para alt text
```

### ProductDetailInfoComponent

**Responsabilidades:**
- Mostrar información del producto
- Gestión de cantidad
- Integración con el carrito
- Visualización de precio y descuentos

**Características:**
- Título, marca y categoría
- Precio con descuento visual
- Badge de descuento porcentual
- Rating summary con estrellas
- Stock availability indicator
- Selector de cantidad (+-) con validación
- Botón "Agregar al carrito" con loading state
- Features destacadas con iconos
- Total price calculator

**Inputs/Outputs:**
```typescript
@Input() product: ProductInfo
@Output() addToCartClicked: EventEmitter<number>

interface ProductInfo {
  productId: number | string;
  name: string;
  brand: string;
  category: string;
  price: {
    current: number;
    original?: number;
    currency: string;
    discount?: number;
  };
  rating: { average: number; count: number; };
  availability: { inStock: boolean; quantity?: number; };
  features?: string[];
  imageUrl?: string;
}
```

### ProductSpecificationsComponent

**Responsabilidades:**
- Mostrar especificaciones técnicas
- Agrupar specs por categorías
- Formato de tabla expandible

**Características:**
- Mat-expansion-panel para grupos
- Auto-agrupación por prefijos (Batería, Pantalla, etc.)
- Diseño tipo tabla limpio
- Primera sección expandida por defecto
- Responsive (columna única en móvil)
- Empty state cuando no hay specs

**Inputs:**
```typescript
@Input() specifications: Record<string, string>
@Input() groupByPrefix: boolean = true
```

**Grupos automáticos:**
- Dimensiones y Peso
- Pantalla
- Procesador
- Memoria y Almacenamiento
- Cámara
- Batería
- Conectividad
- Sistema Operativo
- Diseño y Materiales
- Especificaciones Generales (fallback)

## Integración con ProductReviewsComponent

El componente reutiliza el `ProductReviewsComponent` ya existente en `shared/components/product-reviews`:

```html
<app-product-reviews
  [productId]="productIdNumber()"
  [pageSize]="10"
  [showSummary]="true"
></app-product-reviews>
```

## Layout Responsive

### Desktop (≥960px)
```
+----------------------------------+
|  Breadcrumbs                     |
+----------------------------------+
| Images (55%) | Info (45%)        |
| Gallery      | - Title, Brand    |
|              | - Price, Discount |
|              | - Rating          |
|              | - Add to Cart     |
+----------------------------------+
|  Product Specifications          |
+----------------------------------+
|  Product Reviews                 |
+----------------------------------+
```

### Mobile (<600px)
```
+----------------------------------+
| Back Button                      |
+----------------------------------+
| Images Gallery (100%)            |
+----------------------------------+
| Product Info (100%)              |
+----------------------------------+
| Specifications                   |
+----------------------------------+
| Reviews                          |
+----------------------------------+
| [Sticky Cart Button]             |
+----------------------------------+
```

## Características de Accesibilidad

- Semántica HTML correcta (nav, section, h1-h6)
- ARIA labels en botones y controles
- Textos alternativos en imágenes
- Navegación por teclado completa
- Contraste de colores WCAG AA
- Focus visible en elementos interactivos
- Breadcrumbs con aria-label="Breadcrumb"
- Anuncios de estado de carga

## Estados de la Página

### Loading
- Spinner centrado con texto "Cargando producto..."
- Skeleton screens (futuro enhancement)

### Error
- Card con icono de error
- Mensaje descriptivo
- Botones "Reintentar" y "Volver"

### Success
- Contenido completo del producto
- Animación fade-in al cargar

## Integraciones

### CartService
```typescript
// Agregar producto al carrito
this.cartService.addToCart({
  id: string,
  name: string,
  price: number,
  currency: string,
  imageUrl: string,
  brand?: string,
  inStock: boolean
});
```

### LanguageService
- Auto-recarga cuando cambia el idioma
- Effect que detecta cambios de idioma

### Analytics (Console Log)
```typescript
// Product View
trackProductView(product)

// Add to Cart
trackAddToCart(product, quantity)
```

## API Backend

**Endpoint:** `GET /api/products/:id`

**Response esperado:**
```typescript
interface ProductDetailResponse {
  productId?: string | number;
  id?: string | number;
  name?: string;
  title?: string;
  description?: string;
  price?: number;
  currentPrice?: number;
  originalPrice?: number;
  currency?: string;
  discount?: number;
  discountPercentage?: number;
  rating?: number;
  averageRating?: number;
  reviewCount?: number;
  ratingCount?: number;
  imageUrls?: string[];
  imageUrl?: string;
  brand?: { name?: string; id?: string };
  brandName?: string;
  category?: { name?: string; id?: string };
  categoryName?: string;
  inStock?: boolean;
  stock?: number;
  stockQuantity?: number;
  features?: string[];
  specifications?: Record<string, string>;
}
```

## Routing

**Ruta:** `/product/:id`

**Configuración:**
```typescript
{
  path: 'product/:id',
  loadChildren: () =>
    import('./features/product-detail/product-detail.routes').then(
      (m) => m.PRODUCT_DETAIL_ROUTES
    )
}
```

**Navegación:**
```typescript
// Desde código
router.navigate(['/product', productId]);

// Desde template
<a [routerLink]="['/product', productId]">Ver detalle</a>
```

## Sticky Add to Cart (Mobile)

En dispositivos móviles (<600px), aparece un botón sticky en la parte inferior:

**Características:**
- Fijo en bottom de la pantalla
- Muestra precio actual
- Botón rápido para agregar 1 unidad
- z-index: 100
- Box shadow para elevación

## Mejoras Futuras

### Planificadas
- [ ] Zoom de imagen al hacer hover (desktop)
- [ ] Fullscreen image modal
- [ ] Share buttons (redes sociales)
- [ ] "Productos relacionados" section
- [ ] Skeleton screens detallados
- [ ] Imagen 360° viewer
- [ ] Video del producto
- [ ] Q&A section
- [ ] Wish list integration
- [ ] Comparison feature
- [ ] Size guide modal
- [ ] Stock notifications
- [ ] Recently viewed products

### Optimizaciones
- [ ] Image lazy loading mejorado
- [ ] Preload de imágenes críticas
- [ ] Server-side rendering (SSR)
- [ ] Meta tags dinámicos para SEO
- [ ] Structured data (Schema.org)
- [ ] Open Graph tags
- [ ] Performance monitoring
- [ ] Error boundary component

## Testing

### Unit Tests
```bash
ng test --include='**/product-detail/**/*.spec.ts'
```

### E2E Tests
- Navegación a producto
- Visualización de imágenes
- Cambio de cantidad
- Agregar al carrito
- Cambio de idioma
- Manejo de errores

## Performance

**Métricas objetivo:**
- First Contentful Paint: <1.8s
- Largest Contentful Paint: <2.5s
- Time to Interactive: <3.5s
- Cumulative Layout Shift: <0.1

**Optimizaciones aplicadas:**
- Lazy loading de componentes
- OnPush change detection
- Computed signals para derivaciones
- Imagen lazy loading
- Code splitting por ruta

## Dependencias

**Angular Material:**
- MatButtonModule
- MatIconModule
- MatCardModule
- MatProgressSpinnerModule
- MatDividerModule
- MatSnackBarModule
- MatBadgeModule
- MatChipsModule
- MatFormFieldModule
- MatInputModule
- MatExpansionModule

**RxJS:**
- Subject (para destroy$)
- takeUntil (cleanup)
- finalize (loading state)

## Soporte de Navegadores

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Licencia

Propiedad de ECommerce Platform. Uso interno solamente.
