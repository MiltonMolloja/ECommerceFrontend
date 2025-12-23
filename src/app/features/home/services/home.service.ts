/**
 * HomeService - Arquitectura Híbrida
 *
 * Ofrece dos estrategias de carga:
 * 1. Endpoint Agregador: Carga inicial con una sola llamada HTTP
 * 2. Endpoints Individuales: Actualizaciones parciales y fallback
 *
 * Features:
 * - Cache en cliente con shareReplay
 * - Fallback automático a endpoints individuales
 * - Polling de ofertas cada 60 segundos
 * - Invalidación de cache manual
 */

import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, of, tap, throwError } from 'rxjs';
import {
  HomePageResponse,
  BannerDto,
  ProductDto,
  CategoryDto,
  HomePageParams,
  HomeSectionParams
} from '@core/models';
import { ApiConfigService } from '@core/services/api-config.service';

@Injectable({ providedIn: 'root' })
export class HomeService {
  private http = inject(HttpClient);
  private apiConfig = inject(ApiConfigService);
  private readonly API_URL = this.apiConfig.getApiUrl('/home');

  /**
   * 🏠 ENDPOINT AGREGADOR
   * Obtiene todos los datos de Home en una sola llamada.
   * Usar para carga inicial de la página.
   *
   * NOTA: No usamos caché en el frontend - el backend ya cachea en Redis por idioma.
   * Esto permite que el cambio de idioma funcione correctamente.
   *
   * @param params - Parámetros opcionales (productsPerSection)
   * @returns Observable con todos los datos de Home
   */
  getHomePageData(params?: HomePageParams): Observable<HomePageResponse> {
    const currentLanguage =
      typeof window !== 'undefined' ? localStorage.getItem('app-language') || 'es' : 'es';

    console.log(
      `[HomeService] 🌐 Fetching home page data from API for language: ${currentLanguage}`
    );

    let httpParams = new HttpParams();
    if (params?.productsPerSection) {
      httpParams = httpParams.set('productsPerSection', params.productsPerSection.toString());
    }

    return this.http.get<HomePageResponse>(this.API_URL, { params: httpParams }).pipe(
      tap((response) => {
        console.log(`[HomeService] ✅ Home page data loaded for language: ${currentLanguage}`, {
          fromCache: response.metadata?.fromCache,
          executionTime: `${response.metadata?.queryExecutionTimeMs}ms`,
          language: response.metadata?.language,
          sections: {
            banners: response.banners?.length || 0,
            featured: response.featuredProducts?.length || 0,
            deals: response.deals?.length || 0,
            bestsellers: response.bestSellers?.length || 0,
            newArrivals: response.newArrivals?.length || 0,
            topRated: response.topRated?.length || 0,
            categories: response.featuredCategories?.length || 0
          }
        });
      }),
      catchError((error) => {
        console.error('[HomeService] ❌ Error fetching home page data:', error);
        return throwError(() => error);
      })
    );
  }

  // ========================================
  // ENDPOINTS INDIVIDUALES
  // ========================================

  /**
   * 🖼️ Obtiene banners activos para el hero section.
   * Cache más largo (10 min) porque banners cambian poco.
   *
   * @param params - Parámetros opcionales (position)
   * @returns Observable con lista de banners
   */
  getBanners(params?: HomeSectionParams): Observable<BannerDto[]> {
    let httpParams = new HttpParams();
    if (params?.position) {
      httpParams = httpParams.set('position', params.position);
    }

    return this.http.get<BannerDto[]>(`${this.API_URL}/banners`, { params: httpParams }).pipe(
      tap((banners) => console.log(`[HomeService] 🖼️ Loaded ${banners.length} banners`)),
      catchError((error) => {
        console.error('[HomeService] ❌ Error fetching banners:', error);
        return of([]);
      })
    );
  }

  /**
   * ⭐ Obtiene productos destacados (IsFeatured = true).
   *
   * @param params - Parámetros opcionales (limit)
   * @returns Observable con lista de productos destacados
   */
  getFeaturedProducts(params?: HomeSectionParams): Observable<ProductDto[]> {
    let httpParams = new HttpParams();
    if (params?.limit) {
      httpParams = httpParams.set('limit', params.limit.toString());
    }

    return this.http.get<ProductDto[]>(`${this.API_URL}/featured`, { params: httpParams }).pipe(
      tap((products) =>
        console.log(`[HomeService] ⭐ Loaded ${products.length} featured products`)
      ),
      catchError((error) => {
        console.error('[HomeService] ❌ Error fetching featured products:', error);
        return of([]);
      })
    );
  }

  /**
   * 🔥 Obtiene ofertas del día (productos con descuento).
   * Cache más corto (1 min) - ideal para polling.
   *
   * @param params - Parámetros opcionales (limit)
   * @returns Observable con lista de productos en oferta
   */
  getDeals(params?: HomeSectionParams): Observable<ProductDto[]> {
    let httpParams = new HttpParams();
    if (params?.limit) {
      httpParams = httpParams.set('limit', params.limit.toString());
    }

    return this.http.get<ProductDto[]>(`${this.API_URL}/deals`, { params: httpParams }).pipe(
      tap((products) => console.log(`[HomeService] 🔥 Loaded ${products.length} deals`)),
      catchError((error) => {
        console.error('[HomeService] ❌ Error fetching deals:', error);
        return of([]);
      })
    );
  }

  /**
   * 🏆 Obtiene productos más vendidos (ordenados por TotalSold).
   *
   * @param params - Parámetros opcionales (limit)
   * @returns Observable con lista de bestsellers
   */
  getBestSellers(params?: HomeSectionParams): Observable<ProductDto[]> {
    let httpParams = new HttpParams();
    if (params?.limit) {
      httpParams = httpParams.set('limit', params.limit.toString());
    }

    return this.http.get<ProductDto[]>(`${this.API_URL}/bestsellers`, { params: httpParams }).pipe(
      tap((products) => console.log(`[HomeService] 🏆 Loaded ${products.length} bestsellers`)),
      catchError((error) => {
        console.error('[HomeService] ❌ Error fetching bestsellers:', error);
        return of([]);
      })
    );
  }

  /**
   * 🆕 Obtiene novedades (productos recientes).
   *
   * @param params - Parámetros opcionales (limit)
   * @returns Observable con lista de productos nuevos
   */
  getNewArrivals(params?: HomeSectionParams): Observable<ProductDto[]> {
    let httpParams = new HttpParams();
    if (params?.limit) {
      httpParams = httpParams.set('limit', params.limit.toString());
    }

    return this.http.get<ProductDto[]>(`${this.API_URL}/new-arrivals`, { params: httpParams }).pipe(
      tap((products) => console.log(`[HomeService] 🆕 Loaded ${products.length} new arrivals`)),
      catchError((error) => {
        console.error('[HomeService] ❌ Error fetching new arrivals:', error);
        return of([]);
      })
    );
  }

  /**
   * ⭐ Obtiene productos mejor valorados.
   *
   * @param params - Parámetros opcionales (limit, minRating)
   * @returns Observable con lista de productos top rated
   */
  getTopRated(params?: HomeSectionParams): Observable<ProductDto[]> {
    let httpParams = new HttpParams();
    if (params?.limit) {
      httpParams = httpParams.set('limit', params.limit.toString());
    }
    if (params?.minRating) {
      httpParams = httpParams.set('minRating', params.minRating.toString());
    }

    return this.http.get<ProductDto[]>(`${this.API_URL}/top-rated`, { params: httpParams }).pipe(
      tap((products) =>
        console.log(`[HomeService] ⭐ Loaded ${products.length} top rated products`)
      ),
      catchError((error) => {
        console.error('[HomeService] ❌ Error fetching top rated products:', error);
        return of([]);
      })
    );
  }

  /**
   * 📂 Obtiene categorías destacadas para mostrar en Home.
   *
   * @param params - Parámetros opcionales (limit)
   * @returns Observable con lista de categorías destacadas
   */
  getFeaturedCategories(params?: HomeSectionParams): Observable<CategoryDto[]> {
    let httpParams = new HttpParams();
    if (params?.limit) {
      httpParams = httpParams.set('limit', params.limit.toString());
    }

    return this.http.get<CategoryDto[]>(`${this.API_URL}/categories`, { params: httpParams }).pipe(
      tap((categories) =>
        console.log(`[HomeService] 📂 Loaded ${categories.length} featured categories`)
      ),
      catchError((error) => {
        console.error('[HomeService] ❌ Error fetching featured categories:', error);
        return of([]);
      })
    );
  }

  // ========================================
  // UTILIDADES
  // ========================================

  /**
   * Limpia el cache del servicio.
   * NOTA: Ya no usamos caché en el frontend, pero mantenemos este método
   * por compatibilidad con código existente.
   */
  clearCache(): void {
    console.log('[HomeService] 🗑️ clearCache() called (no-op - backend handles caching)');
  }

  /**
   * Obtiene información del estado del cache
   * NOTA: Ya no usamos caché en el frontend
   */
  getCacheInfo(): { isCached: boolean; age?: number; expiresIn?: number } {
    return { isCached: false };
  }
}
