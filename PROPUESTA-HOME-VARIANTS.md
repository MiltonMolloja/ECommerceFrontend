# 🎨 Propuesta: Variantes Visuales para Home

## Objetivo
Mejorar la experiencia visual del home usando **variantes CSS** del mismo componente `ProductCarouselComponent`, sin crear componentes nuevos.

## Cambios Propuestos

### 1. Actualizar ProductCarouselComponent

#### TypeScript (product-carousel.component.ts)
```typescript
export class ProductCarouselComponent {
  products = input<ProductDto[]>([]);
  viewAllLink = input<string>('');
  variant = input<'default' | 'deals' | 'bestseller' | 'featured' | 'new' | 'top-rated'>('default');
  
  addToCart = output<ProductDto>();
  
  // ... resto del código
}
```

#### HTML (product-carousel.component.html)
```html
<section class="product-carousel" [attr.data-variant]="variant()">
  <div class="carousel-header">
    @if (viewAllLink()) {
      <a [routerLink]="viewAllLink()" class="view-all-link">
        Ver todos
        <mat-icon>arrow_forward</mat-icon>
      </a>
    }
    <div class="nav-buttons">
      <button mat-icon-button class="nav-btn" (click)="scrollLeft()">
        <mat-icon>chevron_left</mat-icon>
      </button>
      <button mat-icon-button class="nav-btn" (click)="scrollRight()">
        <mat-icon>chevron_right</mat-icon>
      </button>
    </div>
  </div>

  @if (products().length > 0) {
    <div class="carousel-track" #carouselTrack>
      @for (product of products(); track trackByProductId($index, product)) {
        <mat-card class="product-card" [routerLink]="getProductLink(product)">
          
          <!-- Badges según variante -->
          <div class="badges-container">
            @if (variant() === 'deals' && hasDiscount(product)) {
              <div class="discount-badge-large">
                <span class="discount-percent">-{{ getDiscountPercentage(product) }}%</span>
                <span class="discount-label">OFF</span>
              </div>
            }
            
            @if (variant() === 'bestseller') {
              <div class="ranking-badge">
                <mat-icon>emoji_events</mat-icon>
                <span>#{{ $index + 1 }}</span>
              </div>
            }
            
            @if (variant() === 'featured') {
              <div class="featured-badge">
                <mat-icon>star</mat-icon>
                <span>Destacado</span>
              </div>
            }
            
            @if (variant() === 'new') {
              <div class="new-badge">
                <mat-icon>fiber_new</mat-icon>
                <span>Nuevo</span>
              </div>
            }
            
            @if (variant() === 'top-rated' && product.averageRating) {
              <div class="rating-badge-large">
                <mat-icon>star</mat-icon>
                <span>{{ product.averageRating | number:'1.1-1' }}</span>
              </div>
            }
          </div>

          <!-- Product Image -->
          <div class="product-image-container">
            <img 
              [src]="getProductImage(product)" 
              [alt]="product.name" 
              class="product-image"
              loading="lazy"
            />
          </div>
          
          <!-- Product Content -->
          <mat-card-content class="product-content">
            <h3 class="product-name" [title]="product.name">
              {{ product.name }}
            </h3>
            
            <!-- Rating (más prominente en top-rated) -->
            @if (product.averageRating && product.averageRating > 0) {
              <div class="rating">
                @for (star of getStars(product.averageRating); track $index) {
                  <mat-icon class="star" [class.filled]="star === 1">
                    {{ star === 1 ? 'star' : 'star_border' }}
                  </mat-icon>
                }
                @if (product.totalReviews && product.totalReviews > 0) {
                  <span class="reviews">({{ product.totalReviews }})</span>
                }
              </div>
            }
            
            <!-- Price -->
            <div class="prices">
              <span class="price">${{ product.price.toFixed(2) }}</span>
              @if (hasDiscount(product)) {
                <span class="original-price">
                  ${{ getOriginalPrice(product).toFixed(2) }}
                </span>
              }
            </div>
            
            <!-- Savings (más prominente en deals) -->
            @if (hasDiscount(product) && variant() === 'deals') {
              <div class="savings-large">
                <mat-icon>trending_down</mat-icon>
                <span>Ahorrás ${{ getSavings(product).toFixed(2) }}</span>
              </div>
            } @else if (hasDiscount(product)) {
              <div class="savings">
                Ahorrás ${{ getSavings(product).toFixed(2) }}
              </div>
            }
            
            <!-- Add to Cart Button -->
            <button 
              mat-raised-button 
              color="primary"
              class="add-to-cart"
              (click)="onAddToCart(product, $event)"
            >
              <mat-icon>shopping_cart</mat-icon>
              Agregar al carrito
            </button>
          </mat-card-content>
        </mat-card>
      }
    </div>
  } @else {
    <div class="empty-state">
      <mat-icon>inventory_2</mat-icon>
      <p>No hay productos disponibles</p>
    </div>
  }
</section>
```

#### SCSS (product-carousel.component.scss)
```scss
.product-carousel {
  background: var(--card-bg);
  padding: 1rem 1.5rem;
  margin-bottom: 1.5rem;
  border-radius: 4px;
  transition: background-color 0.3s ease;

  // ========================================
  // VARIANTE: DEALS (Ofertas del Día)
  // ========================================
  &[data-variant="deals"] {
    background: linear-gradient(135deg, #fff5f5 0%, #ffffff 100%);
    
    .product-card {
      border: 2px solid transparent;
      
      &:hover {
        border-color: #d32f2f;
        box-shadow: 0 8px 24px rgba(211, 47, 47, 0.2);
      }
    }
    
    .discount-badge-large {
      position: absolute;
      top: 0;
      right: 0;
      background: linear-gradient(135deg, #d32f2f 0%, #c62828 100%);
      color: white;
      padding: 0.75rem;
      border-radius: 0 4px 0 12px;
      z-index: 2;
      box-shadow: 0 4px 12px rgba(211, 47, 47, 0.4);
      text-align: center;
      min-width: 60px;
      
      .discount-percent {
        display: block;
        font-size: 1.5rem;
        font-weight: 700;
        line-height: 1;
      }
      
      .discount-label {
        display: block;
        font-size: 0.625rem;
        font-weight: 600;
        letter-spacing: 1px;
        margin-top: 2px;
      }
    }
    
    .savings-large {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      background-color: #fff3e0;
      color: #d32f2f;
      padding: 0.5rem;
      border-radius: 4px;
      font-weight: 600;
      margin-bottom: 1rem;
      
      mat-icon {
        font-size: 1.125rem;
        width: 1.125rem;
        height: 1.125rem;
      }
    }
    
    .price {
      font-size: 1.75rem !important;
      font-weight: 700 !important;
    }
  }

  // ========================================
  // VARIANTE: BESTSELLER (Los Más Vendidos)
  // ========================================
  &[data-variant="bestseller"] {
    background: linear-gradient(135deg, #fffbf0 0%, #ffffff 100%);
    
    .ranking-badge {
      position: absolute;
      top: 0.5rem;
      left: 0.5rem;
      background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
      color: #111;
      padding: 0.5rem 0.75rem;
      border-radius: 20px;
      z-index: 2;
      box-shadow: 0 4px 12px rgba(255, 215, 0, 0.4);
      display: flex;
      align-items: center;
      gap: 0.25rem;
      font-weight: 700;
      font-size: 1rem;
      
      mat-icon {
        font-size: 1.25rem;
        width: 1.25rem;
        height: 1.25rem;
        color: #ff6f00;
      }
    }
    
    .product-card {
      &:hover {
        box-shadow: 0 8px 24px rgba(255, 215, 0, 0.3);
      }
    }
  }

  // ========================================
  // VARIANTE: FEATURED (Productos Destacados)
  // ========================================
  &[data-variant="featured"] {
    .product-card {
      width: 280px; // Más ancho que default
    }
    
    .featured-badge {
      position: absolute;
      top: 0.5rem;
      left: 0.5rem;
      background: linear-gradient(135deg, var(--amazon-orange) 0%, #ff9800 100%);
      color: white;
      padding: 0.5rem 1rem;
      border-radius: 20px;
      z-index: 2;
      box-shadow: 0 4px 12px rgba(255, 152, 0, 0.4);
      display: flex;
      align-items: center;
      gap: 0.25rem;
      font-weight: 600;
      
      mat-icon {
        font-size: 1.125rem;
        width: 1.125rem;
        height: 1.125rem;
      }
    }
    
    .product-content {
      padding: 1.25rem;
    }
    
    .product-name {
      font-size: 1.125rem;
      font-weight: 500;
      height: 3.5rem;
    }
  }

  // ========================================
  // VARIANTE: NEW (Recién Llegados)
  // ========================================
  &[data-variant="new"] {
    background: linear-gradient(135deg, #f0f9ff 0%, #ffffff 100%);
    
    .new-badge {
      position: absolute;
      top: 0.5rem;
      left: 0.5rem;
      background: linear-gradient(135deg, #2196f3 0%, #1976d2 100%);
      color: white;
      padding: 0.5rem 1rem;
      border-radius: 20px;
      z-index: 2;
      box-shadow: 0 4px 12px rgba(33, 150, 243, 0.4);
      display: flex;
      align-items: center;
      gap: 0.25rem;
      font-weight: 600;
      
      mat-icon {
        font-size: 1.25rem;
        width: 1.25rem;
        height: 1.25rem;
      }
    }
    
    .product-card {
      &:hover {
        box-shadow: 0 8px 24px rgba(33, 150, 243, 0.2);
      }
    }
  }

  // ========================================
  // VARIANTE: TOP-RATED (Mejor Valorados)
  // ========================================
  &[data-variant="top-rated"] {
    background: linear-gradient(135deg, #fff8f0 0%, #ffffff 100%);
    
    .rating-badge-large {
      position: absolute;
      top: 0.5rem;
      right: 0.5rem;
      background: linear-gradient(135deg, var(--amazon-orange) 0%, #ff9800 100%);
      color: white;
      padding: 0.5rem 0.75rem;
      border-radius: 20px;
      z-index: 2;
      box-shadow: 0 4px 12px rgba(255, 152, 0, 0.4);
      display: flex;
      align-items: center;
      gap: 0.25rem;
      font-weight: 700;
      font-size: 1.125rem;
      
      mat-icon {
        font-size: 1.25rem;
        width: 1.25rem;
        height: 1.25rem;
      }
    }
    
    .rating {
      background-color: #fff8f0;
      padding: 0.5rem;
      border-radius: 4px;
      margin-bottom: 0.75rem;
      
      .star {
        font-size: 1.125rem;
        width: 1.125rem;
        height: 1.125rem;
      }
      
      .reviews {
        font-weight: 600;
        color: var(--amazon-orange);
      }
    }
  }

  // ========================================
  // ESTILOS COMUNES
  // ========================================
  
  .carousel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;

    .view-all-link {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      color: #007185;
      text-decoration: none;
      font-size: 0.875rem;
      font-weight: 500;
      transition: color 0.2s ease;

      &:hover {
        color: #c7511f;
        text-decoration: underline;
      }

      mat-icon {
        font-size: 1rem;
        width: 1rem;
        height: 1rem;
      }
    }

    .nav-buttons {
      display: flex;
      gap: 0.5rem;

      .nav-btn {
        width: 40px;
        height: 40px;
        border: 1px solid var(--border-color);
        border-radius: 50%;
        transition: all 0.3s ease;

        &:hover:not(:disabled) {
          background-color: var(--card-hover-bg);
          transform: scale(1.1);
        }

        &:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }
      }
    }
  }

  .carousel-track {
    display: flex;
    gap: 1rem;
    overflow-x: auto;
    overflow-y: hidden;
    scroll-behavior: smooth;
    padding: 0.5rem 0;
    scrollbar-width: thin;
    scrollbar-color: #ddd transparent;

    &::-webkit-scrollbar {
      height: 8px;
    }

    &::-webkit-scrollbar-track {
      background: transparent;
    }

    &::-webkit-scrollbar-thumb {
      background-color: #ddd;
      border-radius: 4px;

      &:hover {
        background-color: #bbb;
      }
    }
  }

  .product-card {
    position: relative;
    flex: 0 0 auto;
    width: 250px;
    cursor: pointer;
    transition: all 0.3s ease;
    border: 1px solid var(--card-border);
    background-color: var(--card-bg);
    overflow: visible;

    &:hover {
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1),
                  0 4px 6px -4px rgba(0, 0, 0, 0.1);
      transform: translateY(-4px);

      .product-image {
        transform: scale(1.05);
      }
    }

    .badges-container {
      position: relative;
      height: 0;
    }

    .product-image-container {
      position: relative;
      aspect-ratio: 1;
      background-color: var(--card-hover-bg);
      border-radius: 4px;
      overflow: hidden;
      margin-bottom: 0.75rem;

      .product-image {
        width: 100%;
        height: 100%;
        object-fit: contain;
        padding: 0.5rem;
        transition: transform 300ms;
      }
    }

    .product-content {
      padding: 1rem;

      .product-name {
        color: var(--text-primary);
        font-size: 1rem;
        font-weight: 400;
        margin-bottom: 0.5rem;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
        height: 3rem;
        line-height: 1.5;
      }

      .rating {
        display: flex;
        align-items: center;
        gap: 0.25rem;
        margin-bottom: 0.75rem;

        .star {
          font-size: 1rem;
          width: 1rem;
          height: 1rem;
          color: var(--border-color);

          &.filled {
            color: var(--amazon-orange);
          }
        }

        .reviews {
          font-size: 0.875rem;
          color: #1976d2;
          margin-left: 0.25rem;
        }
      }

      .prices {
        display: flex;
        align-items: baseline;
        gap: 0.5rem;
        margin-bottom: 0.25rem;

        .price {
          color: #d32f2f;
          font-size: 1.5rem;
          font-weight: 500;
        }

        .original-price {
          color: var(--text-secondary);
          font-size: 0.875rem;
          text-decoration: line-through;
        }
      }

      .savings {
        font-size: 0.875rem;
        color: #d32f2f;
        margin-bottom: 1rem;
        font-weight: 500;
      }

      .add-to-cart {
        width: 100%;
        background-color: var(--amazon-orange);
        color: #111;
        transition: all 0.2s ease;

        &:hover {
          background-color: var(--amazon-yellow);
          transform: scale(1.02);
        }

        mat-icon {
          margin-right: 0.5rem;
          font-size: 1rem;
          width: 1rem;
          height: 1rem;
        }
      }
    }
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 3rem 1rem;
    color: #666;

    mat-icon {
      font-size: 4rem;
      width: 4rem;
      height: 4rem;
      margin-bottom: 1rem;
      opacity: 0.5;
    }

    p {
      font-size: 1.125rem;
      margin: 0;
    }
  }
}
```

### 2. Actualizar home.component.html

```html
<!-- Ofertas del Día (con polling) -->
@if (deals().length > 0) {
  <section class="deals-section">
    <div class="section-header">
      <h2>🔥 Ofertas del Día</h2>
      <p class="subtitle">Actualizadas cada minuto</p>
    </div>
    <app-product-carousel
      [products]="deals()"
      [viewAllLink]="'/s?hasDiscount=true'"
      [variant]="'deals'"
      (addToCart)="onAddToCart($event)"
    />
  </section>
}

<!-- Best Sellers -->
@if (bestSellers().length > 0) {
  <section class="bestsellers-section">
    <div class="section-header">
      <h2>🏆 Los Más Vendidos</h2>
    </div>
    <app-product-carousel
      [products]="bestSellers()"
      [viewAllLink]="'/s?sortBy=bestseller'"
      [variant]="'bestseller'"
      (addToCart)="onAddToCart($event)"
    />
  </section>
}

<!-- Productos Destacados -->
@if (featuredProducts().length > 0) {
  <section class="featured-section">
    <div class="section-header">
      <h2>⭐ Productos Destacados</h2>
    </div>
    <app-product-carousel
      [products]="featuredProducts()"
      [viewAllLink]="'/s?isFeatured=true'"
      [variant]="'featured'"
      (addToCart)="onAddToCart($event)"
    />
  </section>
}

<!-- Novedades -->
@if (newArrivals().length > 0) {
  <section class="new-arrivals-section">
    <div class="section-header">
      <h2>🆕 Recién Llegados</h2>
    </div>
    <app-product-carousel
      [products]="newArrivals()"
      [viewAllLink]="'/s?sortBy=newest'"
      [variant]="'new'"
      (addToCart)="onAddToCart($event)"
    />
  </section>
}

<!-- Mejor Valorados -->
@if (topRated().length > 0) {
  <section class="top-rated-section">
    <div class="section-header">
      <h2>⭐ Mejor Valorados</h2>
      <p class="subtitle">4+ estrellas</p>
    </div>
    <app-product-carousel
      [products]="topRated()"
      [viewAllLink]="'/s?minRating=4&sortBy=rating'"
      [variant]="'top-rated'"
      (addToCart)="onAddToCart($event)"
    />
  </section>
}
```

## Ventajas de este Enfoque

### ✅ Mantenibilidad
- Un solo componente para mantener
- Cambios en la lógica se aplican a todas las variantes
- Menos duplicación de código

### ✅ Performance
- No se crean componentes adicionales
- CSS condicional es muy eficiente
- Lazy loading de imágenes compartido

### ✅ Consistencia
- Misma estructura HTML base
- Comportamiento consistente
- Fácil agregar nuevas variantes

### ✅ Flexibilidad
- Fácil cambiar variantes sin tocar código
- Se puede combinar con otras props
- Extensible para futuras necesidades

## Diferencias Visuales por Variante

### 🔥 Deals (Ofertas)
- Badge de descuento GRANDE en esquina superior derecha
- Fondo con gradiente rojo suave
- Precio más grande (1.75rem)
- Ahorro destacado con icono
- Borde rojo en hover

### 🏆 Bestseller (Más Vendidos)
- Badge de ranking con medalla (#1, #2, #3)
- Fondo con gradiente dorado suave
- Badge dorado con icono de trofeo
- Sombra dorada en hover

### ⭐ Featured (Destacados)
- Cards más anchas (280px vs 250px)
- Badge "Destacado" con estrella naranja
- Nombre de producto más grande
- Más padding interno

### 🆕 New (Recién Llegados)
- Badge "Nuevo" azul con icono
- Fondo con gradiente azul suave
- Sombra azul en hover
- Estilo fresco y moderno

### ⭐ Top Rated (Mejor Valorados)
- Badge grande de rating en esquina
- Rating destacado con fondo naranja claro
- Estrellas más grandes
- Número de reseñas en naranja

## Mockup Visual

```
┌─────────────────────────────────────────────────────────────┐
│ 🔥 Ofertas del Día                                          │
├─────────────────────────────────────────────────────────────┤
│  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐                   │
│  │ -50% │  │ -30% │  │ -25% │  │ -40% │  ← Badges grandes │
│  │  OFF │  │  OFF │  │  OFF │  │  OFF │                    │
│  │      │  │      │  │      │  │      │                    │
│  │ IMG  │  │ IMG  │  │ IMG  │  │ IMG  │                    │
│  │      │  │      │  │      │  │      │                    │
│  │$99   │  │$149  │  │$79   │  │$199  │  ← Precio grande  │
│  │💰$50 │  │💰$30 │  │💰$25 │  │💰$80 │  ← Ahorro         │
│  └──────┘  └──────┘  └──────┘  └──────┘                   │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ 🏆 Los Más Vendidos                                         │
├─────────────────────────────────────────────────────────────┤
│  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐                   │
│  │🏆 #1 │  │🏆 #2 │  │🏆 #3 │  │🏆 #4 │  ← Ranking        │
│  │      │  │      │  │      │  │      │                    │
│  │ IMG  │  │ IMG  │  │ IMG  │  │ IMG  │                    │
│  │      │  │      │  │      │  │      │                    │
│  │$99   │  │$149  │  │$79   │  │$199  │                   │
│  └──────┘  └──────┘  └──────┘  └──────┘                   │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ ⭐ Productos Destacados                                      │
├─────────────────────────────────────────────────────────────┤
│  ┌────────┐  ┌────────┐  ┌────────┐                        │
│  │⭐Destac│  │⭐Destac│  │⭐Destac│  ← Badge destacado      │
│  │        │  │        │  │        │                         │
│  │  IMG   │  │  IMG   │  │  IMG   │  ← Cards más grandes   │
│  │        │  │        │  │        │                         │
│  │ $99    │  │ $149   │  │ $79    │                        │
│  └────────┘  └────────┘  └────────┘                        │
└─────────────────────────────────────────────────────────────┘
```

## Implementación

Para implementar esta propuesta, necesitas:

1. ✅ Actualizar `product-carousel.component.ts` (agregar input `variant`)
2. ✅ Actualizar `product-carousel.component.html` (agregar badges condicionales)
3. ✅ Actualizar `product-carousel.component.scss` (agregar estilos por variante)
4. ✅ Actualizar `home.component.html` (pasar prop `variant` a cada carousel)

**Tiempo estimado**: 30-45 minutos
**Archivos modificados**: 4 archivos
**Líneas de código**: ~500 líneas (principalmente CSS)

¿Quieres que implemente estos cambios?
