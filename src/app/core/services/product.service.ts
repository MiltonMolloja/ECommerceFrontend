import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError, of } from 'rxjs';

export interface ProductBasicInfo {
  id: string;
  name: string;
  brand: string;
  imageUrl: string;
  price: number;
  currency: string;
}

interface BackendProductResponse {
  productId?: string;
  id?: string;
  name?: string;
  title?: string;
  brand?: string | { name?: string };
  brandName?: string;
  imageUrls?: string[];
  imageUrl?: string;
  mainImage?: string;
  price?: number;
  currentPrice?: number;
  currency?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private http = inject(HttpClient);
  private readonly API_URL = '/api/products';

  /**
   * Obtener información básica de un producto por ID
   * El nombre se obtiene en el idioma actual (header Accept-Language)
   */
  getProductBasicInfo(productId: string): Observable<ProductBasicInfo | null> {
    return this.http.get<BackendProductResponse>(`${this.API_URL}/${productId}`).pipe(
      map((response) => this.mapToBasicInfo(response)),
      catchError((error) => {
        console.error(`Error obteniendo producto ${productId}:`, error);
        return of(null);
      })
    );
  }

  /**
   * Obtener información básica de múltiples productos
   */
  getProductsBasicInfo(productIds: string[]): Observable<Map<string, ProductBasicInfo>> {
    const requests = productIds.map((id) =>
      this.getProductBasicInfo(id).pipe(map((info) => ({ id, info })))
    );

    return new Observable((observer) => {
      Promise.all(requests.map((req) => req.toPromise())).then((results) => {
        const map = new Map<string, ProductBasicInfo>();
        results.forEach((result) => {
          if (result?.info) {
            map.set(result.id, result.info);
          }
        });
        observer.next(map);
        observer.complete();
      });
    });
  }

  private mapToBasicInfo(response: BackendProductResponse): ProductBasicInfo {
    const id = response.productId?.toString() || response.id?.toString() || '';
    const name = response.name || response.title || 'Sin nombre';
    const brand =
      typeof response.brand === 'string'
        ? response.brand
        : response.brand?.name || response.brandName || '';

    const imageUrl =
      response.imageUrls?.[0] ||
      response.imageUrl ||
      response.mainImage ||
      '/assets/placeholder.png';

    const price = response.price || response.currentPrice || 0;
    const currency = response.currency || 'USD';

    return {
      id,
      name,
      brand,
      imageUrl,
      price,
      currency
    };
  }
}
