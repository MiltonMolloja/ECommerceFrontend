# Guía de Uso del Sistema de Reviews y Ratings

Esta guía muestra cómo integrar el sistema completo de reviews y ratings en tu aplicación Angular.

## 1. Estructura de Archivos Creados

```
src/app/
├── core/
│   ├── models/
│   │   ├── catalog/
│   │   │   └── review.model.ts          # Modelos de datos
│   │   └── index.ts                     # Actualizado con export de review.model
│   └── services/
│       └── product-review.service.ts    # Servicio para API de reviews
│
└── shared/
    └── components/
        ├── rating-summary/
        │   ├── rating-summary.component.ts
        │   ├── rating-summary.component.html
        │   ├── rating-summary.component.scss
        │   └── index.ts
        ├── review-card/
        │   ├── review-card.component.ts
        │   ├── review-card.component.html
        │   ├── review-card.component.scss
        │   └── index.ts
        └── product-reviews/
            ├── product-reviews.component.ts
            ├── product-reviews.component.html
            ├── product-reviews.component.scss
            ├── README.md
            └── index.ts
```

## 2. Ejemplo Básico de Uso

### En la página de detalle de producto:

```typescript
// product-detail.component.ts
import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ProductReviewsComponent } from '../../shared/components/product-reviews';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [
    CommonModule,
    ProductReviewsComponent
  ],
  template: `
    <div class="product-detail-page">
      <!-- Información del producto -->
      <section class="product-info">
        <h1>{{ productName }}</h1>
        <!-- Más detalles del producto -->
      </section>

      <!-- Sistema de Reviews -->
      <section class="product-reviews-section">
        <app-product-reviews
          [productId]="productId()"
          [pageSize]="10"
          [showSummary]="true">
        </app-product-reviews>
      </section>
    </div>
  `,
  styles: [`
    .product-detail-page {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
    }

    .product-reviews-section {
      margin-top: 3rem;
    }
  `]
})
export class ProductDetailComponent implements OnInit {
  productId = signal<number>(0);
  productName = 'Producto Ejemplo';

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    // Obtener el ID del producto desde la ruta
    this.route.params.subscribe(params => {
      this.productId.set(+params['id']);
    });
  }
}
```

## 3. Uso Individual de Componentes

### Solo mostrar el resumen de ratings:

```typescript
import { Component } from '@angular/core';
import { RatingSummaryComponent } from '../../shared/components/rating-summary';
import { ProductRatingSummary } from '../../core/models';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [RatingSummaryComponent],
  template: `
    <div class="product-card">
      <h3>{{ productName }}</h3>
      <app-rating-summary
        [ratingSummary]="ratingSummary"
        [showDetails]="false">
      </app-rating-summary>
    </div>
  `
})
export class ProductCardComponent {
  productName = 'Mi Producto';

  ratingSummary: ProductRatingSummary = {
    productId: 1,
    averageRating: 4.5,
    totalReviews: 127,
    rating5Star: 80,
    rating4Star: 30,
    rating3Star: 10,
    rating2Star: 5,
    rating1Star: 2,
    ratingDistribution: {
      fiveStar: 80,
      fourStar: 30,
      threeStar: 10,
      twoStar: 5,
      oneStar: 2
    }
  };
}
```

### Mostrar una lista personalizada de reviews:

```typescript
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReviewCardComponent } from '../../shared/components/review-card';
import { ProductReviewService } from '../../core/services/product-review.service';
import { ProductReview } from '../../core/models';

@Component({
  selector: 'app-custom-reviews-list',
  standalone: true,
  imports: [CommonModule, ReviewCardComponent],
  template: `
    <div class="reviews-container">
      <h2>Últimas opiniones</h2>

      @for (review of reviews; track review.reviewId) {
        <app-review-card
          [review]="review"
          [showDivider]="!$last"
          (helpfulClicked)="onHelpfulClicked($event)"
          (notHelpfulClicked)="onNotHelpfulClicked($event)">
        </app-review-card>
      }
    </div>
  `
})
export class CustomReviewsListComponent implements OnInit {
  reviews: ProductReview[] = [];

  constructor(private reviewService: ProductReviewService) {}

  ngOnInit(): void {
    this.loadLatestReviews();
  }

  loadLatestReviews(): void {
    this.reviewService.getProductReviews(1, { pageSize: 5 })
      .subscribe(response => {
        this.reviews = response.items;
      });
  }

  onHelpfulClicked(reviewId: number): void {
    this.reviewService.markReviewAsHelpful(1, reviewId).subscribe();
  }

  onNotHelpfulClicked(reviewId: number): void {
    this.reviewService.markReviewAsNotHelpful(1, reviewId).subscribe();
  }
}
```

## 4. Uso del Servicio Directamente

```typescript
import { Component, inject } from '@angular/core';
import { ProductReviewService } from '../../core/services/product-review.service';
import { ReviewSortOption } from '../../core/models';

@Component({
  selector: 'app-reviews-manager',
  template: `<!-- tu template -->`
})
export class ReviewsManagerComponent {
  private reviewService = inject(ProductReviewService);

  // Obtener reviews con filtros personalizados
  loadFilteredReviews(): void {
    this.reviewService.getProductReviews(123, {
      page: 1,
      pageSize: 20,
      sortBy: ReviewSortOption.RATING_HIGH,
      minRating: 4,
      verifiedOnly: true
    }).subscribe(response => {
      console.log('Reviews:', response.items);
      console.log('Summary:', response.ratingSummary);
    });
  }

  // Obtener solo el resumen
  loadSummary(): void {
    this.reviewService.getProductRatingSummary(123)
      .subscribe(summary => {
        console.log('Average Rating:', summary.averageRating);
        console.log('Total Reviews:', summary.totalReviews);
      });
  }

  // Crear una nueva review
  createNewReview(): void {
    this.reviewService.createReview(123, {
      rating: 5,
      title: 'Excelente producto',
      comment: 'Muy contento con la compra'
    }).subscribe(newReview => {
      console.log('Review created:', newReview);
    });
  }
}
```

## 5. Configuración de Rutas

```typescript
// app.routes.ts
import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'products/:id',
    loadComponent: () =>
      import('./pages/product-detail/product-detail.component')
        .then(m => m.ProductDetailComponent),
    data: { title: 'Detalle del Producto' }
  },
  // ... otras rutas
];
```

## 6. Personalización de Estilos

### Modificar colores globales:

```scss
// styles.scss o tema personalizado

// Colores de estrellas
.star-icon {
  &.mat-primary {
    color: #ff9800 !important; // Naranja en lugar de amarillo
  }
}

// Colores de progress bars
mat-progress-bar {
  &[color="primary"] {
    --mdc-linear-progress-active-indicator-color: #4caf50;
  }
}
```

### Ajustar espaciados:

```scss
// En tu componente padre
.product-reviews-section {
  app-product-reviews {
    ::ng-deep .product-reviews {
      gap: 2rem; // Más espacio entre secciones
    }

    ::ng-deep .reviews-card {
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      border-radius: 12px;
    }
  }
}
```

## 7. Manejo de Estados

```typescript
import { Component, signal } from '@angular/core';
import { ProductReviewsComponent } from '../../shared/components/product-reviews';

@Component({
  selector: 'app-product-page',
  standalone: true,
  imports: [ProductReviewsComponent],
  template: `
    @if (productLoaded()) {
      <app-product-reviews
        [productId]="productId()"
        [pageSize]="10">
      </app-product-reviews>
    } @else {
      <div class="loading">Cargando producto...</div>
    }
  `
})
export class ProductPageComponent {
  productId = signal(0);
  productLoaded = signal(false);

  // Simular carga de producto
  ngOnInit(): void {
    setTimeout(() => {
      this.productId.set(123);
      this.productLoaded.set(true);
    }, 1000);
  }
}
```

## 8. Testing

### Ejemplo de test unitario:

```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ProductReviewsComponent } from './product-reviews.component';
import { ProductReviewService } from '../../../core/services/product-review.service';
import { of } from 'rxjs';

describe('ProductReviewsComponent', () => {
  let component: ProductReviewsComponent;
  let fixture: ComponentFixture<ProductReviewsComponent>;
  let service: ProductReviewService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ProductReviewsComponent,
        HttpClientTestingModule
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProductReviewsComponent);
    component = fixture.componentInstance;
    service = TestBed.inject(ProductReviewService);
  });

  it('should load reviews on init', () => {
    const mockResponse = {
      items: [],
      totalItems: 0,
      page: 1,
      pageSize: 10,
      totalPages: 0
    };

    spyOn(service, 'getProductReviews').and.returnValue(of(mockResponse));
    component.productId = 123;
    component.ngOnInit();

    expect(service.getProductReviews).toHaveBeenCalledWith(
      123,
      jasmine.any(Object)
    );
  });
});
```

## 9. Accesibilidad

Los componentes incluyen:
- **ARIA labels** en todos los botones interactivos
- **Roles semánticos** apropiados
- **Navegación por teclado** completa
- **Contraste de colores** WCAG AA compliant
- **Texto alternativo** para iconos

## 10. Performance Tips

```typescript
// Usar OnPush change detection (ya implementado)
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush
})

// Lazy load del componente
loadComponent: () =>
  import('./shared/components/product-reviews')
    .then(m => m.ProductReviewsComponent)

// Implementar virtual scrolling para listas muy largas
import { ScrollingModule } from '@angular/cdk/scrolling';
```

## Endpoints del Backend Requeridos

El sistema espera los siguientes endpoints en tu API:

- `GET /api/products/{productId}/reviews?page=1&pageSize=10&sortBy=newest`
- `GET /api/products/{productId}/reviews/summary`
- `POST /api/products/{productId}/reviews/{reviewId}/helpful`
- `POST /api/products/{productId}/reviews/{reviewId}/not-helpful`
- `POST /api/products/{productId}/reviews`
- `PUT /api/products/{productId}/reviews/{reviewId}`
- `DELETE /api/products/{productId}/reviews/{reviewId}`

## Próximos Pasos

1. Integrar el componente en tus páginas de productos
2. Configurar los endpoints en tu backend
3. Personalizar estilos según tu marca
4. Implementar formulario para crear reviews
5. Añadir imágenes a las reviews (opcional)
6. Implementar moderación de reviews (opcional)

## Soporte

Para más información, consulta:
- [README.md](./src/app/shared/components/product-reviews/README.md)
- [Angular Material Documentation](https://material.angular.io)
- [Documentación de modelos](./src/app/core/models/catalog/review.model.ts)
