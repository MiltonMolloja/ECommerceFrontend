import { Component, Input, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface ProductImage {
  image: string;
  link?: string | string[];
}

@Component({
  selector: 'app-product-carousel',
  standalone: true,
  imports: [CommonModule, RouterLink, MatButtonModule, MatIconModule],
  templateUrl: './product-carousel.component.html',
  styleUrls: ['./product-carousel.component.scss']
})
export class ProductCarouselComponent {
  @Input({ required: true }) title!: string;
  @Input() products: ProductImage[] = [];
  @ViewChild('carouselTrack') carouselTrack!: ElementRef<HTMLDivElement>;

  trackByIndex(index: number): number {
    return index;
  }

  scrollLeft(): void {
    const track = this.carouselTrack.nativeElement;
    track.scrollBy({ left: -600, behavior: 'smooth' });
  }

  scrollRight(): void {
    const track = this.carouselTrack.nativeElement;
    track.scrollBy({ left: 600, behavior: 'smooth' });
  }
}
