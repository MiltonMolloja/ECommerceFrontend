import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  signal,
  computed,
  inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../../../core/services/cart.service';
import { ProductCategory } from '../../../../core/models';

/**
 * Modelo de producto para la info (simplificado)
 */
export interface ProductInfo {
  productId: number | string;
  name: string;
  brandId?: number;
  brand: string;
  category?: string; // Deprecated - usar primaryCategory
  primaryCategory?: ProductCategory;
  categories?: ProductCategory[];
  price: {
    current: number;
    original?: number;
    currency: string;
    discount?: number;
  };
  rating: {
    average: number;
    count: number;
  };
  availability: {
    inStock: boolean;
    quantity?: number;
  };
  features?: string[];
  imageUrl?: string;
}

/**
 * Componente de información del producto
 * Características:
 * - Título, marca y categoría
 * - Precio con descuento
 * - Rating summary
 * - Stock availability
 * - Selector de cantidad
 * - Botón "Agregar al carrito"
 * - Features destacadas
 */
@Component({
  selector: 'app-product-detail-info',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatBadgeModule,
    MatChipsModule,
    MatDividerModule,
    MatFormFieldModule,
    MatInputModule
  ],
  templateUrl: './product-detail-info.component.html',
  styleUrls: ['./product-detail-info.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductDetailInfoComponent {
  private cartService = inject(CartService);

  @Input({ required: true }) product!: ProductInfo;
  @Output() addToCartClicked = new EventEmitter<number>();
  @Output() reviewsLinkClicked = new EventEmitter<void>();

  // Estado reactivo
  quantity = signal(1);
  addingToCart = signal(false);

  // Computed signals
  hasDiscount = computed(() => {
    const product = this.product;
    return product?.price?.original !== undefined && product.price.original > product.price.current;
  });

  discountPercentage = computed(() => {
    if (!this.hasDiscount()) return 0;
    const product = this.product;
    if (product.price.discount !== undefined) {
      return Math.round(product.price.discount);
    }
    const original = product.price.original || 0;
    const current = product.price.current;
    return Math.round(((original - current) / original) * 100);
  });

  isInStock = computed(() => this.product?.availability?.inStock ?? false);

  stockQuantity = computed(() => this.product?.availability?.quantity);

  maxQuantity = computed(() => {
    const stock = this.stockQuantity();
    // El límite es exactamente el stock disponible
    return stock !== undefined && stock > 0 ? stock : 1;
  });

  totalPrice = computed(() => {
    return this.product?.price?.current * this.quantity();
  });

  /**
   * Incrementar cantidad
   */
  incrementQuantity(): void {
    const current = this.quantity();
    const max = this.maxQuantity();
    if (current < max) {
      this.quantity.set(current + 1);
    }
  }

  /**
   * Decrementar cantidad
   */
  decrementQuantity(): void {
    const current = this.quantity();
    if (current > 1) {
      this.quantity.set(current - 1);
    }
  }

  /**
   * Validar y ajustar cantidad manual
   */
  onQuantityChange(): void {
    const current = this.quantity();
    const max = this.maxQuantity();

    if (current < 1) {
      this.quantity.set(1);
    } else if (current > max) {
      this.quantity.set(max);
    }
  }

  /**
   * Agregar al carrito
   */
  addToCart(): void {
    if (!this.isInStock() || this.addingToCart()) {
      return;
    }

    this.addingToCart.set(true);

    // Simular delay para feedback visual
    setTimeout(() => {
      // Agregar la cantidad especificada (sin nombre, se obtiene dinámicamente)
      for (let i = 0; i < this.quantity(); i++) {
        this.cartService.addToCart({
          id: this.product.productId.toString(),
          price: this.product.price.current,
          currency: this.product.price.currency,
          imageUrl: this.product.imageUrl || '/assets/placeholder.png',
          brand: this.product.brand,
          inStock: this.product.availability.inStock
        });
      }

      this.addingToCart.set(false);
      this.addToCartClicked.emit(this.quantity());
    }, 300);
  }

  /**
   * Generar array de estrellas para el rating
   */
  getStars(rating: number): { full: number; half: boolean; empty: number } {
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5;
    const empty = 5 - full - (half ? 1 : 0);

    return { full, half, empty };
  }

  /**
   * Formatear precio
   */
  formatPrice(price: number, currency: string): string {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: currency || 'USD'
    }).format(price);
  }

  /**
   * Manejar click en el enlace de reviews
   */
  onReviewsLinkClick(): void {
    this.reviewsLinkClicked.emit();
  }
}
