# Sistema de Reviews y Ratings de Productos

Este módulo proporciona un sistema completo de reviews y ratings para productos, construido con Angular Material y siguiendo las mejores prácticas de Angular.

## Componentes

### 1. RatingSummaryComponent

Muestra el resumen de ratings de un producto con visualización de estrellas y distribución de valoraciones.

**Uso:**
```typescript
<app-rating-summary
  [ratingSummary]="ratingSummary"
  [showDetails]="true">
</app-rating-summary>
```

**Inputs:**
- `ratingSummary` (required): Objeto ProductRatingSummary con los datos de rating
- `showDetails`: Boolean para mostrar/ocultar la distribución detallada (default: true)

### 2. ReviewCardComponent

Renderiza una review individual de producto con todas sus características.

**Uso:**
```typescript
<app-review-card
  [review]="review"
  [showDivider]="true"
  [userHasMarkedHelpful]="false"
  [userHasMarkedNotHelpful]="false"
  (helpfulClicked)="onHelpfulClicked($event)"
  (notHelpfulClicked)="onNotHelpfulClicked($event)">
</app-review-card>
```

**Inputs:**
- `review` (required): Objeto ProductReview
- `showDivider`: Mostrar divisor al final (default: true)
- `userHasMarkedHelpful`: Indica si el usuario marcó como útil
- `userHasMarkedNotHelpful`: Indica si el usuario marcó como no útil

**Outputs:**
- `helpfulClicked`: Emite el reviewId cuando se marca como útil
- `notHelpfulClicked`: Emite el reviewId cuando se marca como no útil

### 3. ProductReviewsComponent

Componente principal que integra todo el sistema de reviews con paginación y filtros.

**Uso:**
```typescript
<app-product-reviews
  [productId]="123"
  [pageSize]="10"
  [showSummary]="true">
</app-product-reviews>
```

**Inputs:**
- `productId` (required): ID del producto
- `pageSize`: Número de reviews por página (default: 10)
- `showSummary`: Mostrar resumen de ratings (default: true)

## Servicio

### ProductReviewService

Proporciona métodos para interactuar con la API de reviews.

**Métodos principales:**
```typescript
// Obtener reviews paginadas con filtros
getProductReviews(productId: number, filters?: ReviewFilterParams): Observable<ProductReviewsResponse>

// Obtener resumen de ratings
getProductRatingSummary(productId: number): Observable<ProductRatingSummary>

// Marcar review como útil
markReviewAsHelpful(productId: number, reviewId: number): Observable<void>

// Marcar review como no útil
markReviewAsNotHelpful(productId: number, reviewId: number): Observable<void>

// Crear nueva review
createReview(productId: number, review: Partial<ProductReview>): Observable<ProductReview>
```

## Ejemplo de uso completo

```typescript
import { Component } from '@angular/core';
import { ProductReviewsComponent } from './shared/components/product-reviews/product-reviews.component';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [ProductReviewsComponent],
  template: `
    <div class="product-detail">
      <!-- Información del producto -->

      <!-- Sistema de reviews -->
      <section class="reviews-section">
        <app-product-reviews
          [productId]="productId"
          [pageSize]="10"
          [showSummary]="true">
        </app-product-reviews>
      </section>
    </div>
  `
})
export class ProductDetailComponent {
  productId = 123;
}
```

## Características

- **Visualización de ratings**: Muestra promedio con estrellas y distribución detallada
- **Paginación**: Integración con MatPaginator para navegación eficiente
- **Ordenamiento**: Múltiples opciones (más recientes, rating alto/bajo, más útiles)
- **Filtros**: Filtro por compras verificadas
- **Interactividad**: Botones de helpful/not helpful con contadores
- **Badges**: Indicador visual de "Compra verificada"
- **Responsive**: Diseño adaptativo para todos los dispositivos
- **Estados**: Loading, error y estados vacíos
- **Accesibilidad**: ARIA labels y navegación por teclado
- **Performance**: ChangeDetection OnPush y uso de Signals

## Modelos

```typescript
interface ProductReview {
  reviewId: number;
  productId: number;
  userId: number;
  rating: number;
  title?: string;
  comment?: string;
  isVerifiedPurchase: boolean;
  helpfulCount: number;
  notHelpfulCount: number;
  isApproved: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface ProductRatingSummary {
  productId: number;
  averageRating: number;
  totalReviews: number;
  rating5Star: number;
  rating4Star: number;
  rating3Star: number;
  rating2Star: number;
  rating1Star: number;
  ratingDistribution: RatingDistribution;
  lastUpdated?: Date;
}
```

## Endpoints API

- `GET /api/products/{productId}/reviews` - Obtener reviews paginadas
- `GET /api/products/{productId}/reviews/summary` - Obtener resumen de ratings
- `POST /api/products/{productId}/reviews/{reviewId}/helpful` - Marcar como útil
- `POST /api/products/{productId}/reviews/{reviewId}/not-helpful` - Marcar como no útil
- `POST /api/products/{productId}/reviews` - Crear nueva review
- `PUT /api/products/{productId}/reviews/{reviewId}` - Actualizar review
- `DELETE /api/products/{productId}/reviews/{reviewId}` - Eliminar review

## Configuración

El servicio utiliza la URL del API Gateway configurada en `environment.ts`:

```typescript
apiGatewayUrl: 'http://localhost:45000'
```

## Estilos y Temas

Los componentes utilizan Angular Material y siguen Material Design guidelines. Los colores se adaptan automáticamente al tema configurado en la aplicación.

### Personalización de colores:

Las estrellas usan el color amarillo estándar (#ffc107) para mejor visibilidad.
Las progress bars utilizan los colores del tema Material:
- primary: para ratings altos (4-5 estrellas)
- accent: para ratings medios (3 estrellas)
- warn: para ratings bajos (1-2 estrellas)

## Notas de rendimiento

- Los componentes usan `ChangeDetectionStrategy.OnPush` para optimizar el rendimiento
- Las subscripciones se limpian automáticamente con `takeUntil`
- Se utiliza Signals para estado reactivo eficiente
- Las reviews se cargan de forma paginada para evitar sobrecarga
