import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ActiveFilter } from '../models';

@Injectable({
  providedIn: 'root'
})
export class FilterService {
  private activeFiltersSubject = new BehaviorSubject<ActiveFilter[]>([]);
  public activeFilters$ = this.activeFiltersSubject.asObservable();

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
   * Obtener filtros activos como objeto para la API
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
}
