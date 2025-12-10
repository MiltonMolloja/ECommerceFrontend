import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ActiveFilter } from '../models';
import { AdvancedSearchParams } from '../models/search-params.model';
import { NumericRange } from '../models/facets.model';

@Injectable({
  providedIn: 'root'
})
export class FilterService {
  private activeFiltersSubject = new BehaviorSubject<ActiveFilter[]>([]);
  public activeFilters$ = this.activeFiltersSubject.asObservable();

  // Rangos de precio y atributos activos
  private priceRangeSubject = new BehaviorSubject<{ min: number; max: number } | null>(null);
  public priceRange$ = this.priceRangeSubject.asObservable();

  private attributeRangesSubject = new BehaviorSubject<Record<string, NumericRange>>({});
  public attributeRanges$ = this.attributeRangesSubject.asObservable();

  /**
   * Agregar filtro activo
   */
  addFilter(filter: ActiveFilter): void {
    const current = this.activeFiltersSubject.value;
    const exists = current.find(
      (f) => f.filterId === filter.filterId && f.valueId === filter.valueId
    );

    if (!exists) {
      this.activeFiltersSubject.next([...current, filter]);
    }
  }

  /**
   * Remover filtro activo
   */
  removeFilter(filterId: string, valueId: string): void {
    const current = this.activeFiltersSubject.value;
    const updated = current.filter((f) => !(f.filterId === filterId && f.valueId === valueId));
    this.activeFiltersSubject.next(updated);
  }

  /**
   * Limpiar todos los filtros
   */
  clearAllFilters(): void {
    this.activeFiltersSubject.next([]);
    this.priceRangeSubject.next(null);
    this.attributeRangesSubject.next({});
  }

  /**
   * Limpiar filtros de un grupo específico
   */
  clearFilterGroup(filterId: string): void {
    const current = this.activeFiltersSubject.value;
    const updated = current.filter((f) => f.filterId !== filterId);
    this.activeFiltersSubject.next(updated);
  }

  /**
   * Establecer rango de precio
   */
  setPriceRange(range: { min: number; max: number } | null): void {
    this.priceRangeSubject.next(range);
  }

  /**
   * Establecer rango de atributo
   */
  setAttributeRange(attributeId: string, range: NumericRange): void {
    const current = this.attributeRangesSubject.value;
    this.attributeRangesSubject.next({
      ...current,
      [attributeId]: range
    });
  }

  /**
   * Remover rango de atributo
   */
  removeAttributeRange(attributeId: string): void {
    const current = this.attributeRangesSubject.value;
    const { [attributeId]: removed, ...rest } = current;
    this.attributeRangesSubject.next(rest);
  }

  /**
   * Obtener filtros activos como objeto para la API (backward compatibility)
   */
  getActiveFiltersAsParams(): Record<string, string[]> {
    const filters = this.activeFiltersSubject.value;
    const result: Record<string, string[]> = {};

    filters.forEach((filter) => {
      if (!result[filter.filterId]) {
        result[filter.filterId] = [];
      }
      result[filter.filterId]!.push(filter.valueId);
    });

    return result;
  }

  /**
   * Convertir filtros activos a parámetros de búsqueda avanzada
   */
  getAdvancedSearchParams(baseParams: Partial<AdvancedSearchParams> = {}): Partial<AdvancedSearchParams> {
    const filters = this.activeFiltersSubject.value;
    const params: Partial<AdvancedSearchParams> = { ...baseParams };

    // Agrupar filtros por tipo
    const brandIds: number[] = [];
    const categoryIds: number[] = [];
    const attributes: Record<string, string[]> = {};
    let minRating: number | undefined;

    filters.forEach((filter) => {
      // Marcas
      if (filter.filterId === 'brand') {
        const brandId = parseInt(filter.valueId, 10);
        if (!isNaN(brandId)) {
          brandIds.push(brandId);
        }
      }
      // Categorías
      else if (filter.filterId === 'category') {
        const categoryId = parseInt(filter.valueId, 10);
        if (!isNaN(categoryId)) {
          categoryIds.push(categoryId);
        }
      }
      // Rating (solo el valor más alto)
      else if (filter.filterId === 'rating') {
        const rating = parseInt(filter.valueId, 10);
        if (!isNaN(rating) && (!minRating || rating > minRating)) {
          minRating = rating;
        }
      }
      // Atributos dinámicos
      else if (filter.filterId.startsWith('attr_')) {
        const attrId = filter.filterId.replace('attr_', '');
        if (!attributes[attrId]) {
          attributes[attrId] = [];
        }
        attributes[attrId]!.push(filter.valueId);
      }
    });

    // Asignar parámetros
    if (brandIds.length > 0) {
      params.brandIds = brandIds;
    }

    if (categoryIds.length > 0) {
      params.categoryIds = categoryIds;
    }

    if (minRating !== undefined) {
      params.minAverageRating = minRating;
    }

    if (Object.keys(attributes).length > 0) {
      params.attributes = attributes;
    }

    // Rango de precio
    const priceRange = this.priceRangeSubject.value;
    if (priceRange) {
      params.priceRange = priceRange;
    }

    // Rangos de atributos
    const attributeRanges = this.attributeRangesSubject.value;
    if (Object.keys(attributeRanges).length > 0) {
      params.attributeRanges = attributeRanges;
    }

    // Habilitar facetas por defecto
    params.includeBrandFacets = true;
    params.includeCategoryFacets = true;
    params.includePriceFacets = true;
    params.includeRatingFacets = true;
    params.includeAttributeFacets = true;

    return params;
  }

  /**
   * Obtener el estado actual de todos los filtros
   */
  getCurrentState(): {
    filters: ActiveFilter[];
    priceRange: { min: number; max: number } | null;
    attributeRanges: Record<string, NumericRange>;
  } {
    return {
      filters: this.activeFiltersSubject.value,
      priceRange: this.priceRangeSubject.value,
      attributeRanges: this.attributeRangesSubject.value
    };
  }
}
