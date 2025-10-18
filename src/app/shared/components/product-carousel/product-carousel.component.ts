import { Component, Input, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';

export interface ProductImage {
  image: string;
  link?: string | string[];
}

export interface ProductCard {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviews: number;
  image: string;
}

@Component({
  selector: 'app-product-carousel',
  standalone: true,
  imports: [CommonModule, RouterLink, MatButtonModule, MatIconModule, MatCardModule],
  templateUrl: './product-carousel.component.html',
  styleUrls: ['./product-carousel.component.scss']
})
export class ProductCarouselComponent {
  @Input({ required: true }) title!: string;
  @Input() products: ProductImage[] | ProductCard[] = [];
  @Input() showPrices = false;
  @ViewChild('carouselTrack') carouselTrack!: ElementRef<HTMLDivElement>;

  trackByIndex(index: number): number {
    return index;
  }

  isProductCard(product: ProductImage | ProductCard): product is ProductCard {
    return 'price' in product;
  }

  getStars(rating: number): number[] {
    return Array(5)
      .fill(0)
      .map((_, i) => (i < Math.floor(rating) ? 1 : 0));
  }

  getDiscount(product: ProductCard): number {
    if (!product.originalPrice) return 0;
    return Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
  }

  scrollLeft(): void {
    const track = this.carouselTrack.nativeElement;
    track.scrollBy({ left: -560, behavior: 'smooth' });
  }

  scrollRight(): void {
    const track = this.carouselTrack.nativeElement;
    track.scrollBy({ left: 560, behavior: 'smooth' });
  }
}
