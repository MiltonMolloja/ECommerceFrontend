import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { BannerSlide } from '../../models/product.model';

@Component({
  selector: 'app-hero-banner',
  imports: [CommonModule, MatButtonModule, MatIconModule],
  templateUrl: './hero-banner.html',
  styleUrl: './hero-banner.scss'
})
export class HeroBanner implements OnInit, OnDestroy {
  currentSlide = signal(0);
  private intervalId?: number;

  banners: BannerSlide[] = [
    {
      id: 1,
      title: 'Tech Deals of the Season',
      description: 'Save up to 40% on electronics',
      image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=2070',
      buttonText: 'Shop Now'
    },
    {
      id: 2,
      title: 'Latest Gadgets & Devices',
      description: 'Explore cutting-edge technology',
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=2070',
      buttonText: 'Discover More'
    },
    {
      id: 3,
      title: 'Special Offers',
      description: "Limited time deals you don't want to miss",
      image: 'https://images.unsplash.com/photo-1607083206968-13611e3d76db?q=80&w=2070',
      buttonText: 'View Offers'
    }
  ];

  ngOnInit(): void {
    this.startAutoSlide();
  }

  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  startAutoSlide(): void {
    this.intervalId = window.setInterval(() => {
      this.next();
    }, 5000);
  }

  next(): void {
    this.currentSlide.set((this.currentSlide() + 1) % this.banners.length);
  }

  prev(): void {
    this.currentSlide.set((this.currentSlide() - 1 + this.banners.length) % this.banners.length);
  }

  goToSlide(index: number): void {
    this.currentSlide.set(index);
  }
}
