import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiConfigService } from './api-config.service';
import {
  ProductReview,
  ProductRatingSummary,
  ProductReviewsResponse,
  ReviewFilterParams
} from '../models';

/**
 * Servicio para gestionar reviews y ratings de productos mediante Gateway API
 */
@Injectable({
  providedIn: 'root'
})
export class ProductReviewService {
  private http = inject(HttpClient);
  private apiConfig = inject(ApiConfigService);
  private readonly baseUrl = this.apiConfig.getApiUrl('/products');

  /**
   * Obtiene las reviews de un producto con paginación y filtros
   */
  getProductReviews(
    productId: number,
    filters?: ReviewFilterParams
  ): Observable<ProductReviewsResponse> {
    let params = new HttpParams();

    if (filters) {
      if (filters.page !== undefined) {
        params = params.set('page', filters.page.toString());
      }
      if (filters.pageSize !== undefined) {
        params = params.set('pageSize', filters.pageSize.toString());
      }
      if (filters.sortBy) {
        params = params.set('sortBy', filters.sortBy);
      }
      if (filters.minRating !== undefined) {
        params = params.set('minRating', filters.minRating.toString());
      }
      if (filters.verifiedOnly !== undefined) {
        params = params.set('verifiedOnly', filters.verifiedOnly.toString());
      }
    }

    return this.http.get<ProductReviewsResponse>(`${this.baseUrl}/${productId}/reviews`, {
      params
    });
  }

  /**
   * Obtiene el resumen de ratings de un producto
   */
  getProductRatingSummary(productId: number): Observable<ProductRatingSummary> {
    return this.http
      .get<Record<string, unknown>>(`${this.baseUrl}/${productId}/reviews/summary`)
      .pipe(
        map((response: Record<string, unknown>) => {
          // El backend devuelve la estructura en 'distribution'
          // Necesitamos aplanarla al nivel raíz para el modelo del frontend
          const distribution = (response['distribution'] as Record<string, number>) || {};

          return {
            productId: response['productId'] as number,
            averageRating: (response['averageRating'] as number) || 0,
            totalReviews: (response['totalReviews'] as number) || 0,
            rating5Star: distribution['rating5Star'] || 0,
            rating4Star: distribution['rating4Star'] || 0,
            rating3Star: distribution['rating3Star'] || 0,
            rating2Star: distribution['rating2Star'] || 0,
            rating1Star: distribution['rating1Star'] || 0,
            ratingDistribution: {
              fiveStar: distribution['rating5Star'] || 0,
              fourStar: distribution['rating4Star'] || 0,
              threeStar: distribution['rating3Star'] || 0,
              twoStar: distribution['rating2Star'] || 0,
              oneStar: distribution['rating1Star'] || 0
            }
          } as ProductRatingSummary;
        })
      );
  }

  /**
   * Obtiene una review específica por ID
   */
  getReviewById(productId: number, reviewId: number): Observable<ProductReview> {
    return this.http.get<ProductReview>(`${this.baseUrl}/${productId}/reviews/${reviewId}`);
  }

  /**
   * Marca una review como útil
   */
  markReviewAsHelpful(productId: number, reviewId: number): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/${productId}/reviews/${reviewId}/helpful`, {});
  }

  /**
   * Marca una review como no útil
   */
  markReviewAsNotHelpful(productId: number, reviewId: number): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/${productId}/reviews/${reviewId}/not-helpful`, {});
  }

  /**
   * Crea una nueva review para un producto
   */
  createReview(productId: number, review: Partial<ProductReview>): Observable<ProductReview> {
    return this.http.post<ProductReview>(`${this.baseUrl}/${productId}/reviews`, review);
  }

  /**
   * Actualiza una review existente
   */
  updateReview(
    productId: number,
    reviewId: number,
    review: Partial<ProductReview>
  ): Observable<ProductReview> {
    return this.http.put<ProductReview>(`${this.baseUrl}/${productId}/reviews/${reviewId}`, review);
  }

  /**
   * Elimina una review
   */
  deleteReview(productId: number, reviewId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${productId}/reviews/${reviewId}`);
  }
}
