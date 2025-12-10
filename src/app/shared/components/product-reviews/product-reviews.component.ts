import {
  Component,
  Input,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  inject,
  signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';

import { ProductReviewService } from '../../../core/services/product-review.service';
import {
  ProductReview,
  ProductRatingSummary,
  ReviewSortOption,
  ReviewFilterParams
} from '../../../core/models';
import { RatingSummaryComponent } from '../rating-summary/rating-summary.component';
import { ReviewCardComponent } from '../review-card/review-card.component';

/**
 * Componente para mostrar las reviews de un producto con paginación y filtros
 * Incluye resumen de ratings, lista de reviews, ordenamiento y paginación
 */
@Component({
  selector: 'app-product-reviews',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatFormFieldModule,
    MatPaginatorModule,
    MatIconModule,
    MatCheckboxModule,
    RatingSummaryComponent,
    ReviewCardComponent
  ],
  templateUrl: './product-reviews.component.html',
  styleUrls: ['./product-reviews.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductReviewsComponent implements OnInit, OnDestroy {
  private reviewService = inject(ProductReviewService);
  private cdr = inject(ChangeDetectorRef);
  private destroy$ = new Subject<void>();

  @Input({ required: true }) productId!: number;
  @Input() pageSize = 10;
  @Input() showSummary = true;

  // Signals para el estado del componente
  reviews = signal<ProductReview[]>([]);
  ratingSummary = signal<ProductRatingSummary | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);

  // Paginación y filtros
  currentPage = signal(1);
  totalReviews = signal(0);
  totalPages = signal(0);
  sortBy = signal<ReviewSortOption>(ReviewSortOption.NEWEST);
  verifiedOnly = signal(false);

  // Opciones de ordenamiento
  sortOptions = [
    { value: ReviewSortOption.NEWEST, label: 'Más recientes' },
    { value: ReviewSortOption.OLDEST, label: 'Más antiguos' },
    { value: ReviewSortOption.RATING_HIGH, label: 'Mayor valoración' },
    { value: ReviewSortOption.RATING_LOW, label: 'Menor valoración' },
    { value: ReviewSortOption.HELPFUL, label: 'Más útiles' }
  ];

  // Tracks para helpful/not helpful por usuario (simulado)
  userHelpfulMarks = new Set<number>();
  userNotHelpfulMarks = new Set<number>();

  ngOnInit(): void {
    this.loadReviews();
    if (this.showSummary) {
      this.loadRatingSummary();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Carga las reviews del producto
   */
  private loadReviews(): void {
    this.loading.set(true);
    this.error.set(null);

    const filters: ReviewFilterParams = {
      page: this.currentPage(),
      pageSize: this.pageSize,
      sortBy: this.sortBy(),
      verifiedOnly: this.verifiedOnly()
    };

    this.reviewService
      .getProductReviews(this.productId, filters)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.loading.set(false);
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next: (response) => {
          this.reviews.set(response.items);
          this.totalReviews.set(response.totalItems);
          this.totalPages.set(response.totalPages);

          // Si no se cargó el summary antes, usar el del response
          if (!this.ratingSummary() && response.ratingSummary) {
            this.ratingSummary.set(response.ratingSummary);
          }

          this.cdr.markForCheck();
        },
        error: (err) => {

          this.error.set('Error al cargar las valoraciones. Por favor, intenta de nuevo.');
          this.cdr.markForCheck();
        }
      });
  }

  /**
   * Carga el resumen de ratings del producto
   */
  private loadRatingSummary(): void {
    this.reviewService
      .getProductRatingSummary(this.productId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (summary) => {
          this.ratingSummary.set(summary);
          this.cdr.markForCheck();
        },
        error: (err) => {

        }
      });
  }

  /**
   * Maneja el cambio de página
   */
  onPageChange(event: PageEvent): void {
    this.currentPage.set(event.pageIndex + 1);
    this.loadReviews();
    this.scrollToTop();
  }

  /**
   * Maneja el cambio de ordenamiento
   */
  onSortChange(sortOption: ReviewSortOption): void {
    this.sortBy.set(sortOption);
    this.currentPage.set(1);
    this.loadReviews();
  }

  /**
   * Maneja el cambio del filtro de verificación
   */
  onVerifiedFilterChange(checked: boolean): void {
    this.verifiedOnly.set(checked);
    this.currentPage.set(1);
    this.loadReviews();
  }

  /**
   * Maneja el click en helpful de una review
   */
  onHelpfulClicked(reviewId: number): void {
    if (this.userHelpfulMarks.has(reviewId) || this.userNotHelpfulMarks.has(reviewId)) {
      return;
    }

    this.reviewService
      .markReviewAsHelpful(this.productId, reviewId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.userHelpfulMarks.add(reviewId);
          // Actualizar el contador local
          this.updateReviewHelpfulCount(reviewId, true);
          this.cdr.markForCheck();
        },
        error: (err) => {

        }
      });
  }

  /**
   * Maneja el click en not helpful de una review
   */
  onNotHelpfulClicked(reviewId: number): void {
    if (this.userHelpfulMarks.has(reviewId) || this.userNotHelpfulMarks.has(reviewId)) {
      return;
    }

    this.reviewService
      .markReviewAsNotHelpful(this.productId, reviewId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.userNotHelpfulMarks.add(reviewId);
          // Actualizar el contador local
          this.updateReviewHelpfulCount(reviewId, false);
          this.cdr.markForCheck();
        },
        error: (err) => {

        }
      });
  }

  /**
   * Actualiza el contador de helpful/not helpful de una review localmente
   */
  private updateReviewHelpfulCount(reviewId: number, isHelpful: boolean): void {
    const currentReviews = this.reviews();
    const updatedReviews = currentReviews.map(review => {
      if (review.reviewId === reviewId) {
        return {
          ...review,
          helpfulCount: isHelpful ? review.helpfulCount + 1 : review.helpfulCount,
          notHelpfulCount: !isHelpful ? review.notHelpfulCount + 1 : review.notHelpfulCount
        };
      }
      return review;
    });
    this.reviews.set(updatedReviews);
  }

  /**
   * Verifica si el usuario marcó una review como helpful
   */
  hasMarkedHelpful(reviewId: number): boolean {
    return this.userHelpfulMarks.has(reviewId);
  }

  /**
   * Verifica si el usuario marcó una review como not helpful
   */
  hasMarkedNotHelpful(reviewId: number): boolean {
    return this.userNotHelpfulMarks.has(reviewId);
  }

  /**
   * Scroll al inicio de la sección de reviews
   */
  private scrollToTop(): void {
    // Implementar scroll suave al cambiar de página si es necesario
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /**
   * Reintenta cargar las reviews
   */
  retry(): void {
    this.loadReviews();
  }
}
