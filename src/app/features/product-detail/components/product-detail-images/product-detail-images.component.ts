import {
  Component,
  Input,
  OnInit,
  ChangeDetectionStrategy,
  signal,
  computed
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';

/**
 * Componente de galería de imágenes del producto
 * Características:
 * - Imagen principal grande
 * - Carrusel de thumbnails
 * - Navegación con flechas
 * - Indicadores de posición
 * - Diseño responsive
 */
@Component({
  selector: 'app-product-detail-images',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatCardModule],
  templateUrl: './product-detail-images.component.html',
  styleUrls: ['./product-detail-images.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductDetailImagesComponent implements OnInit {
  @Input({ required: true }) images: string[] = [];
  @Input() productName = '';

  // Estado reactivo
  selectedIndex = signal(0);
  isImageLoading = signal(true);
  imageError = signal(false);

  // Computed signals
  currentImage = computed(() => {
    const index = this.selectedIndex();
    return this.images[index] || '/assets/placeholder.png';
  });

  hasPrevious = computed(() => this.selectedIndex() > 0);
  hasNext = computed(() => this.selectedIndex() < this.images.length - 1);

  ngOnInit(): void {
    // Validar que haya al menos una imagen
    if (!this.images || this.images.length === 0) {
      this.images = ['/assets/placeholder.png'];
    }
  }

  /**
   * Seleccionar una imagen por índice
   */
  selectImage(index: number): void {
    if (index >= 0 && index < this.images.length) {
      this.selectedIndex.set(index);
      this.isImageLoading.set(true);
      this.imageError.set(false);
    }
  }

  /**
   * Navegar a la imagen anterior
   */
  previousImage(): void {
    if (this.hasPrevious()) {
      this.selectImage(this.selectedIndex() - 1);
    }
  }

  /**
   * Navegar a la imagen siguiente
   */
  nextImage(): void {
    if (this.hasNext()) {
      this.selectImage(this.selectedIndex() + 1);
    }
  }

  /**
   * Manejar la carga exitosa de la imagen
   */
  onImageLoad(): void {
    this.isImageLoading.set(false);
    this.imageError.set(false);
  }

  /**
   * Manejar error al cargar la imagen
   */
  onImageError(): void {
    this.isImageLoading.set(false);
    this.imageError.set(true);
  }

  /**
   * Obtener el rango visible de thumbnails (para scroll)
   */
  getVisibleThumbnails(): number[] {
    return Array.from({ length: this.images.length }, (_, i) => i);
  }
}
