/**
 * HeroBannerComponent - Carrusel de banners
 * 
 * Recibe banners del backend (BannerDto[])
 * Features:
 * - Auto-slide cada 5 segundos
 * - Navegación manual (prev/next)
 * - Indicadores de posición
 * - Soporte para imágenes mobile
 * - Links navegables
 */

import { Component, OnInit, OnDestroy, signal, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { BannerDto } from '@core/models';

@Component({
  selector: 'app-hero-banner',
  standalone: true,
  imports: [CommonModule, RouterModule, MatButtonModule, MatIconModule],
  templateUrl: './hero-banner.html',
  styleUrl: './hero-banner.scss'
})
export class HeroBanner implements OnInit, OnDestroy {
  // Input: Banners del backend
  banners = input<BannerDto[]>([]);

  // Estado del carrusel
  currentSlide = signal(0);
  private intervalId: number | undefined = undefined;

  // Computed: Banner actual
  currentBanner = computed(() => {
    const index = this.currentSlide();
    const bannersList = this.banners();
    return bannersList[index] || null;
  });

  // Computed: Verificar si hay banners
  hasBanners = computed(() => this.banners().length > 0);

  ngOnInit(): void {
    if (this.hasBanners()) {
      this.startAutoSlide();
    }
  }

  ngOnDestroy(): void {
    this.stopAutoSlide();
  }

  /**
   * Inicia el auto-slide cada 5 segundos
   */
  startAutoSlide(): void {
    this.intervalId = window.setInterval(() => {
      this.next();
    }, 5000);
  }

  /**
   * Detiene el auto-slide
   */
  stopAutoSlide(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }
  }

  /**
   * Navega al siguiente banner
   */
  next(): void {
    const bannersList = this.banners();
    if (bannersList.length > 0) {
      this.currentSlide.set((this.currentSlide() + 1) % bannersList.length);
    }
  }

  /**
   * Navega al banner anterior
   */
  prev(): void {
    const bannersList = this.banners();
    if (bannersList.length > 0) {
      this.currentSlide.set((this.currentSlide() - 1 + bannersList.length) % bannersList.length);
    }
  }

  /**
   * Navega a un banner específico
   */
  goToSlide(index: number): void {
    this.currentSlide.set(index);
    // Reiniciar el auto-slide
    this.stopAutoSlide();
    this.startAutoSlide();
  }

  /**
   * Pausa el auto-slide al hacer hover
   */
  onMouseEnter(): void {
    this.stopAutoSlide();
  }

  /**
   * Reanuda el auto-slide al salir del hover
   */
  onMouseLeave(): void {
    this.startAutoSlide();
  }

  /**
   * Obtiene la imagen apropiada según el tamaño de pantalla
   */
  getImageUrl(banner: BannerDto): string {
    // En mobile, usar imageUrlMobile si existe
    if (banner.imageUrlMobile && window.innerWidth < 768) {
      return banner.imageUrlMobile;
    }
    return banner.imageUrl;
  }
}
