import { Injectable, inject } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';

export interface UrlFilters {
  query?: string;
  categories?: number[];
  brands?: number[];
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  inStock?: boolean;
  hasDiscount?: boolean;
  isFeatured?: boolean;
  sortBy?: string;
  sortOrder?: string;
  page?: number;
  pageSize?: number;
  attributes?: Record<string, string[]>;
}

@Injectable({
  providedIn: 'root'
})
export class UrlSyncService {
  private readonly router = inject(Router);
  private readonly location = inject(Location);

  /**
   * Sincroniza filtros con URL query params
   */
  syncFiltersToUrl(filters: UrlFilters, replaceUrl: boolean = false): void {
    const queryParams: any = {};

    // Query de búsqueda
    if (filters.query) {
      queryParams['k'] = filters.query;
    }

    // Categorías
    if (filters.categories && filters.categories.length > 0) {
      queryParams['categories'] = filters.categories.join(',');
    }

    // Marcas
    if (filters.brands && filters.brands.length > 0) {
      queryParams['brands'] = filters.brands.join(',');
    }

    // Rango de precio
    if (filters.minPrice !== undefined) {
      queryParams['minPrice'] = filters.minPrice.toString();
    }
    if (filters.maxPrice !== undefined) {
      queryParams['maxPrice'] = filters.maxPrice.toString();
    }

    // Rating
    if (filters.minRating !== undefined && filters.minRating > 0) {
      queryParams['minRating'] = filters.minRating.toString();
    }

    // Flags booleanos
    if (filters.inStock) {
      queryParams['inStock'] = 'true';
    }
    if (filters.hasDiscount) {
      queryParams['hasDiscount'] = 'true';
    }
    if (filters.isFeatured) {
      queryParams['isFeatured'] = 'true';
    }

    // Ordenamiento
    if (filters.sortBy) {
      queryParams['sortBy'] = filters.sortBy;
    }
    if (filters.sortOrder) {
      queryParams['sortOrder'] = filters.sortOrder;
    }

    // Paginación
    if (filters.page && filters.page > 1) {
      queryParams['page'] = filters.page.toString();
    }
    if (filters.pageSize && filters.pageSize !== 20) {
      queryParams['pageSize'] = filters.pageSize.toString();
    }

    // Atributos dinámicos
    if (filters.attributes) {
      Object.entries(filters.attributes).forEach(([key, values]) => {
        if (values && values.length > 0) {
          queryParams[`attr_${key}`] = values.join(',');
        }
      });
    }

    // Navegar con los nuevos query params
    this.router.navigate([], {
      relativeTo: inject(ActivatedRoute),
      queryParams,
      queryParamsHandling: '', // Reemplaza todos los params
      replaceUrl // Si es true, no agrega a history
    });
  }

  /**
   * Parsea filtros desde URL query params
   */
  parseFiltersFromUrl(queryParams: any): UrlFilters {
    const filters: UrlFilters = {};

    // Query
    if (queryParams['k'] || queryParams['query']) {
      filters.query = queryParams['k'] || queryParams['query'];
    }

    // Categorías
    if (queryParams['categories']) {
      filters.categories = this.parseNumberArray(queryParams['categories']);
    }

    // Marcas
    if (queryParams['brands']) {
      filters.brands = this.parseNumberArray(queryParams['brands']);
    }

    // Precio
    if (queryParams['minPrice']) {
      filters.minPrice = parseFloat(queryParams['minPrice']);
    }
    if (queryParams['maxPrice']) {
      filters.maxPrice = parseFloat(queryParams['maxPrice']);
    }

    // Rating
    if (queryParams['minRating']) {
      filters.minRating = parseFloat(queryParams['minRating']);
    }

    // Flags booleanos
    if (queryParams['inStock']) {
      filters.inStock = queryParams['inStock'] === 'true';
    }
    if (queryParams['hasDiscount']) {
      filters.hasDiscount = queryParams['hasDiscount'] === 'true';
    }
    if (queryParams['isFeatured']) {
      filters.isFeatured = queryParams['isFeatured'] === 'true';
    }

    // Ordenamiento
    if (queryParams['sortBy']) {
      filters.sortBy = queryParams['sortBy'];
    }
    if (queryParams['sortOrder']) {
      filters.sortOrder = queryParams['sortOrder'];
    }

    // Paginación
    if (queryParams['page']) {
      filters.page = parseInt(queryParams['page'], 10);
    }
    if (queryParams['pageSize']) {
      filters.pageSize = parseInt(queryParams['pageSize'], 10);
    }

    // Atributos dinámicos (attr_RAM, attr_Processor, etc.)
    filters.attributes = {};
    Object.keys(queryParams).forEach(key => {
      if (key.startsWith('attr_')) {
        const attrName = key.substring(5); // Remove 'attr_' prefix
        filters.attributes![attrName] = queryParams[key].split(',');
      }
    });

    // Si no hay atributos, eliminar el objeto vacío
    if (Object.keys(filters.attributes).length === 0) {
      delete filters.attributes;
    }

    return filters;
  }

  /**
   * Genera una URL compartible con filtros
   */
  getShareableUrl(filters: UrlFilters): string {
    const baseUrl = window.location.origin;
    const path = '/s'; // Ruta de búsqueda

    const queryParams = new URLSearchParams();

    if (filters.query) queryParams.set('k', filters.query);
    if (filters.categories?.length) queryParams.set('categories', filters.categories.join(','));
    if (filters.brands?.length) queryParams.set('brands', filters.brands.join(','));
    if (filters.minPrice) queryParams.set('minPrice', filters.minPrice.toString());
    if (filters.maxPrice) queryParams.set('maxPrice', filters.maxPrice.toString());
    if (filters.minRating) queryParams.set('minRating', filters.minRating.toString());
    if (filters.inStock) queryParams.set('inStock', 'true');
    if (filters.hasDiscount) queryParams.set('hasDiscount', 'true');
    if (filters.isFeatured) queryParams.set('isFeatured', 'true');
    if (filters.sortBy) queryParams.set('sortBy', filters.sortBy);
    if (filters.sortOrder) queryParams.set('sortOrder', filters.sortOrder);

    if (filters.attributes) {
      Object.entries(filters.attributes).forEach(([key, values]) => {
        if (values?.length) {
          queryParams.set(`attr_${key}`, values.join(','));
        }
      });
    }

    const queryString = queryParams.toString();
    return queryString ? `${baseUrl}${path}?${queryString}` : `${baseUrl}${path}`;
  }

  /**
   * Copia URL al clipboard
   */
  async copyShareableUrl(filters: UrlFilters): Promise<boolean> {
    const url = this.getShareableUrl(filters);

    try {
      await navigator.clipboard.writeText(url);
      return true;
    } catch (error) {

      return false;
    }
  }

  /**
   * Helper para parsear arrays de números desde strings
   */
  private parseNumberArray(value: string): number[] {
    if (!value) return [];

    return value
      .split(',')
      .map(v => parseInt(v.trim(), 10))
      .filter(v => !isNaN(v));
  }
}
