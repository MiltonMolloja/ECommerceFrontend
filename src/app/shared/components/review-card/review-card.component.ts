import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { ProductReview } from '../../../core/models';

/**
 * Componente para mostrar una review individual de producto
 * Incluye rating, título, comentario, fecha y botones de helpful
 */
@Component({
  selector: 'app-review-card',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatChipsModule,
    MatDividerModule
  ],
  templateUrl: './review-card.component.html',
  styleUrls: ['./review-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReviewCardComponent {
  @Input({ required: true }) review!: ProductReview;
  @Input() showDivider = true;
  @Input() userHasMarkedHelpful = false;
  @Input() userHasMarkedNotHelpful = false;

  @Output() helpfulClicked = new EventEmitter<number>();
  @Output() notHelpfulClicked = new EventEmitter<number>();

  /**
   * Genera un array de números para renderizar estrellas
   */
  getStarArray(): number[] {
    return Array(5).fill(0);
  }

  /**
   * Determina el icono de estrella a mostrar
   */
  getStarIcon(index: number): string {
    return index < this.review.rating ? 'star' : 'star_border';
  }

  /**
   * Maneja el click en el botón de helpful
   */
  onHelpfulClick(): void {
    if (!this.userHasMarkedHelpful) {
      this.helpfulClicked.emit(this.review.reviewId);
    }
  }

  /**
   * Maneja el click en el botón de not helpful
   */
  onNotHelpfulClick(): void {
    if (!this.userHasMarkedNotHelpful) {
      this.notHelpfulClicked.emit(this.review.reviewId);
    }
  }

  /**
   * Calcula el tiempo transcurrido desde la creación de la review
   */
  getTimeAgo(): string {
    const now = new Date();
    const reviewDate = new Date(this.review.createdAt);
    const diffInMs = now.getTime() - reviewDate.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) {
      const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
      if (diffInHours === 0) {
        const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
        return diffInMinutes <= 1 ? 'Hace un momento' : `Hace ${diffInMinutes} minutos`;
      }
      return diffInHours === 1 ? 'Hace 1 hora' : `Hace ${diffInHours} horas`;
    } else if (diffInDays === 1) {
      return 'Hace 1 día';
    } else if (diffInDays < 30) {
      return `Hace ${diffInDays} días`;
    } else if (diffInDays < 365) {
      const diffInMonths = Math.floor(diffInDays / 30);
      return diffInMonths === 1 ? 'Hace 1 mes' : `Hace ${diffInMonths} meses`;
    } else {
      const diffInYears = Math.floor(diffInDays / 365);
      return diffInYears === 1 ? 'Hace 1 año' : `Hace ${diffInYears} años`;
    }
  }

  /**
   * Formatea la fecha de la review
   */
  getFormattedDate(): string {
    const date = new Date(this.review.createdAt);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}
