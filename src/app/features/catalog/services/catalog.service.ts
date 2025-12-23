import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiConfigService } from '../../../core/services/api-config.service';
import { Product, DataCollection } from '../../../core/models';

/**
 * Servicio para gestionar productos del catálogo mediante Gateway API
 */
@Injectable({
  providedIn: 'root'
})
export class CatalogService {
  private http = inject(HttpClient);
  private apiConfig = inject(ApiConfigService);
  private readonly baseUrl = this.apiConfig.getApiUrl('/products');

  /**
   * Obtiene todos los productos con paginación
   */
  getProducts(page = 1, take = 100): Observable<DataCollection<Product>> {
    const params = new HttpParams().set('page', page.toString()).set('take', take.toString());

    return this.http.get<DataCollection<Product>>(this.baseUrl, { params });
  }

  /**
   * Obtiene un producto por ID
   */
  getProductById(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.baseUrl}/${id}`);
  }

  /**
   * Obtiene productos por IDs específicos
   */
  getProductsByIds(ids: number[], page = 1): Observable<DataCollection<Product>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('take', ids.length.toString())
      .set('ids', ids.join(','));

    return this.http.get<DataCollection<Product>>(this.baseUrl, { params });
  }
}
