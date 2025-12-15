/**
 * ProductCarouselComponent - Carrusel horizontal de productos
 *
 * Recibe ProductDto[] del backend y muestra un carrusel scrolleable
 * Features:
 * - Navegación con botones prev/next
 * - Scroll suave
 * - Muestra precio, rating, descuento
 * - Botón "Add to Cart"
 * - Link "Ver todos" opcional
 * - Navegación a detalle de producto
 */

import { Component, input, ViewChild, ElementRef, output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { TranslateModule } from '@ngx-translate/core';
import { ProductDto } from '@core/models';

@Component({
  selector: 'app-product-carousel',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    TranslateModule
  ],
  templateUrl: './product-carousel.component.html',
  styleUrls: ['./product-carousel.component.scss']
})
export class ProductCarouselComponent {
  private router = inject(Router);

  // Inputs
  products = input<ProductDto[]>([]);
  viewAllLink = input<string>('');
  variant = input<'default' | 'deals' | 'bestseller' | 'featured' | 'new' | 'top-rated'>('default');

  // Outputs
  addToCart = output<ProductDto>();

  // ViewChild para scroll
  @ViewChild('carouselTrack') carouselTrack!: ElementRef<HTMLDivElement>;

  /**
   * Track by para optimizar rendering
   */
  trackByProductId(index: number, product: ProductDto): number {
    return product.productId;
  }

  /**
   * Obtiene array de estrellas para rating
   */
  getStars(rating: number): number[] {
    return Array(5)
      .fill(0)
      .map((_, i) => (i < Math.floor(rating) ? 1 : 0));
  }

  /**
   * Calcula el porcentaje de descuento
   */
  getDiscountPercentage(product: ProductDto): number {
    return Math.round(product.discountPercentage);
  }

  /**
   * Obtiene el precio original antes del descuento
   */
  getOriginalPrice(product: ProductDto): number {
    return product.originalPrice || product.price;
  }

  /**
   * Calcula el ahorro en dinero
   */
  getSavings(product: ProductDto): number {
    if (!product.originalPrice) return 0;
    return product.originalPrice - product.price;
  }

  /**
   * Verifica si el producto tiene descuento
   */
  hasDiscount(product: ProductDto): boolean {
    return product.hasDiscount;
  }

  /**
   * Obtiene la URL de la imagen del producto
   */
  getProductImage(product: ProductDto): string {
    return product.primaryImageUrl || '/assets/images/product-placeholder.jpg';
  }

  /**
   * Obtiene el link al detalle del producto
   */
  getProductLink(product: ProductDto): string {
    return `/product/${product.productId}`;
  }

  /**
   * Scroll hacia la izquierda
   */
  scrollLeft(): void {
    const track = this.carouselTrack?.nativeElement;
    if (track) {
      track.scrollBy({ left: -560, behavior: 'smooth' });
    }
  }

  /**
   * Scroll hacia la derecha
   */
  scrollRight(): void {
    const track = this.carouselTrack?.nativeElement;
    if (track) {
      track.scrollBy({ left: 560, behavior: 'smooth' });
    }
  }

  /**
   * Emite evento para agregar al carrito
   */
  onAddToCart(product: ProductDto, event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.addToCart.emit(product);
  }

  /**
   * Navega al link "Ver todos" parseando la URL con query params
   */
  navigateToViewAll(): void {
    const url = this.viewAllLink();
    if (!url) return;

    if (url.includes('?')) {
      const [path, queryString] = url.split('?');
      const queryParams: Record<string, string> = {};

      if (queryString) {
        queryString.split('&').forEach((param) => {
          const [key, value] = param.split('=');
          if (key) {
            queryParams[key] = value || 'true';
          }
        });
      }

      this.router.navigate([path], { queryParams });
    } else {
      this.router.navigate([url]);
    }
  }
}
