import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ProductRatingSummary } from '../../../core/models';

/**
 * Componente para mostrar el resumen de ratings de un producto
 * Incluye el rating promedio, número total de reviews y distribución por estrellas
 */
@Component({
  selector: 'app-rating-summary',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatProgressBarModule
  ],
  templateUrl: './rating-summary.component.html',
  styleUrls: ['./rating-summary.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RatingSummaryComponent {
  @Input({ required: true }) ratingSummary!: ProductRatingSummary;
  @Input() showDetails = true;
  
  // Exponer Math para usar en el template
  readonly Math = Math;

  /**
   * Genera un array de números para renderizar estrellas
   */
  getStarArray(count: number): number[] {
    return Array(Math.floor(count)).fill(0);
  }

  /**
   * Verifica si hay una media estrella
   */
  hasHalfStar(rating: number): boolean {
    return rating % 1 >= 0.5;
  }

  /**
   * Calcula el porcentaje de reviews para una calificación específica
   */
  getPercentage(count: number): number {
    if (!this.ratingSummary.totalReviews) return 0;
    return (count / this.ratingSummary.totalReviews) * 100;
  }

  /**
   * Obtiene el color de la estrella según el índice
   */
  getStarColor(index: number, rating: number): string {
    if (index < Math.floor(rating)) {
      return 'primary';
    } else if (index === Math.floor(rating) && this.hasHalfStar(rating)) {
      return 'primary';
    }
    return '';
  }

  /**
   * Determina si debe mostrar una estrella completa, media o vacía
   */
  getStarIcon(index: number, rating: number): string {
    if (index < Math.floor(rating)) {
      return 'star';
    } else if (index === Math.floor(rating) && this.hasHalfStar(rating)) {
      return 'star_half';
    }
    return 'star_border';
  }

  /**
   * Obtiene los datos de distribución de ratings
   */
  getRatingDistributionData(): Array<{ stars: number; count: number; percentage: number }> {
    return [
      {
        stars: 5,
        count: this.ratingSummary.rating5Star,
        percentage: this.getPercentage(this.ratingSummary.rating5Star)
      },
      {
        stars: 4,
        count: this.ratingSummary.rating4Star,
        percentage: this.getPercentage(this.ratingSummary.rating4Star)
      },
      {
        stars: 3,
        count: this.ratingSummary.rating3Star,
        percentage: this.getPercentage(this.ratingSummary.rating3Star)
      },
      {
        stars: 2,
        count: this.ratingSummary.rating2Star,
        percentage: this.getPercentage(this.ratingSummary.rating2Star)
      },
      {
        stars: 1,
        count: this.ratingSummary.rating1Star,
        percentage: this.getPercentage(this.ratingSummary.rating1Star)
      }
    ];
  }
}
