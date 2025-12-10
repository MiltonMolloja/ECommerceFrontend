import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatBadgeModule } from '@angular/material/badge';
import { TranslateModule } from '@ngx-translate/core';
import { FilterOption, ActiveFilter } from '../../models';
import { FilterGroupComponent } from '../filter-group/filter-group.component';
import { FilterService } from '../../services/filter.service';

interface FilterChangeEvent {
  filterId: string;
  optionId?: string;
  checked?: boolean;
  priceRange?: { min: number; max: number };
  attributeRange?: { min: number; max: number };
}

@Component({
  selector: 'app-filters-sidebar',
  standalone: true,
  imports: [CommonModule, FilterGroupComponent, MatButtonModule, MatBadgeModule, TranslateModule],
  // changeDetection: ChangeDetectionStrategy.OnPush, // ← REMOVIDO para detectar cambios automáticamente
  templateUrl: './filters-sidebar.component.html',
  styles: [
    `
      .filters-sidebar {
        background: var(--card-bg);
        border: 1px solid var(--card-border);
        border-radius: 8px;
        padding: 16px;
        position: sticky;
        top: 20px;
        align-self: flex-start;
      }

      .filters-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;
        padding-bottom: 12px;
        border-bottom: 1px solid var(--card-border);

        h2 {
          font-size: 18px;
          font-weight: 700;
          margin: 0;
          color: var(--text-primary);
        }

        .clear-all {
          font-size: 13px;
        }
      }

      .filters-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .active-filter-count {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-width: 20px;
        height: 20px;
        padding: 0 6px;
        background-color: var(--primary-color);
        color: white;
        border-radius: 10px;
        font-size: 12px;
        font-weight: 600;
        margin-left: 8px;
      }
    `
  ]
})
export class FiltersSidebarComponent {
  @Input({ required: true }) filters: FilterOption[] = [];
  
  @Input() loading = false;
  @Output() filterChange = new EventEmitter<
    Record<string, string[]> & { priceRange?: { min: number; max: number } }
  >();

  private filterService = inject(FilterService);

  get hasActiveFilters(): boolean {
    return this.filters.some((f) => f.options.some((o) => o.isSelected));
  }

  onFilterChange(event: FilterChangeEvent): void {
    const { filterId, optionId, checked, priceRange, attributeRange } = event;

    // Manejar filtro de rango de precio
    if (priceRange) {
      const filters = this.filterService.getActiveFiltersAsParams();
      this.filterChange.emit({ ...filters, priceRange } as Record<string, string[]> & {
        priceRange: { min: number; max: number };
      });
      return;
    }

    // Manejar filtro de rango de atributo
    if (attributeRange && filterId.startsWith('attr_')) {
      const filters = this.filterService.getActiveFiltersAsParams();
      // El attributeRange se manejará en el componente padre
      this.filterChange.emit({ ...filters, [`${filterId}_range`]: attributeRange } as any);
      return;
    }

    // Buscar el filtro y la opción
    const filter = this.filters.find((f) => f.id === filterId);
    const option = filter?.options.find((o) => o.id === optionId);

    if (filter && option) {
      if (checked) {
        // Agregar filtro
        const activeFilter: ActiveFilter = {
          filterId: filter.id,
          filterName: filter.name,
          valueId: option.id,
          valueLabel: option.label
        };
        this.filterService.addFilter(activeFilter);
      } else {
        // Remover filtro
        if (optionId) {
          this.filterService.removeFilter(filterId, optionId);
        }
      }

      // Emitir cambios al padre
      const activeFilters = this.filterService.getActiveFiltersAsParams();
      this.filterChange.emit(activeFilters);
    }
  }

  /**
   * Obtiene el conteo total de filtros activos
   */
  get activeFilterCount(): number {
    return this.filters.reduce((count, filter) => {
      const activeOptions = filter.options.filter(o => o.isSelected).length;
      return count + activeOptions;
    }, 0);
  }

  clearAllFilters(): void {
    this.filterService.clearAllFilters();
    this.filterChange.emit({});
  }
}
