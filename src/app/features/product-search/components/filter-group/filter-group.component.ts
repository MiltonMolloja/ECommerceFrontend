import { Component, Input, Output, EventEmitter, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { MatSliderModule } from '@angular/material/slider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { FilterOption, FilterType, FilterValue } from '../../models';

interface FilterChangeEvent {
  filterId: string;
  optionId?: string;
  checked?: boolean;
  priceRange?: { min: number; max: number };
  attributeRange?: { min: number; max: number };
}

@Component({
  selector: 'app-filter-group',
  standalone: true,
  imports: [
    CommonModule,
    MatExpansionModule,
    MatCheckboxModule,
    MatRadioModule,
    MatSliderModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    FormsModule
  ],
  // changeDetection: ChangeDetectionStrategy.OnPush, // ← REMOVIDO para detectar cambios automáticamente
  templateUrl: './filter-group.component.html',
  styleUrls: ['./filter-group.component.scss']
})
export class FilterGroupComponent implements OnInit {
  @Input({ required: true }) filter!: FilterOption;

  @Output() filterChange = new EventEmitter<FilterChangeEvent>();

  private breakpointObserver = inject(BreakpointObserver);

  FilterType = FilterType;
  private priceChangeTimeout?: ReturnType<typeof setTimeout>;

  // Signals para funcionalidades avanzadas
  searchQuery = signal('');
  isExpanded = signal(false);
  showAllOptions = signal(false);
  isMobileOrTablet = signal(false);

  ngOnInit(): void {
    // Detectar si es móvil o tablet para colapsar filtros
    this.breakpointObserver
      .observe([Breakpoints.Handset, Breakpoints.TabletPortrait, Breakpoints.TabletLandscape])
      .subscribe((result) => {
        this.isMobileOrTablet.set(result.matches);
      });
  }

  /**
   * Determina si el panel debe estar expandido
   * En móvil/tablet: colapsado por defecto
   * En desktop: expandido según filter.isExpanded
   */
  get shouldBeExpanded(): boolean {
    // Si es móvil/tablet, colapsar por defecto
    if (this.isMobileOrTablet()) {
      return false;
    }
    // En desktop, usar la configuración del filtro
    return this.filter.isExpanded !== false;
  }

  onCheckboxChange(optionId: string, checked: boolean): void {
    this.filterChange.emit({
      filterId: this.filter.id,
      optionId,
      checked
    });
  }

  onRadioChange(optionId: string): void {
    this.filterChange.emit({
      filterId: this.filter.id,
      optionId,
      checked: true
    });
  }

  /**
   * Maneja cambios en los inputs de precio con validación
   */
  onPriceInputChange(): void {
    // Cancelar timeout previo
    if (this.priceChangeTimeout) {
      clearTimeout(this.priceChangeTimeout);
    }

    // Validar que los valores estén dentro del rango
    if (this.filter.range) {
      if (
        this.filter.range.selectedMin !== undefined &&
        this.filter.range.selectedMin < this.filter.range.min
      ) {
        this.filter.range.selectedMin = this.filter.range.min;
      }
      if (
        this.filter.range.selectedMax !== undefined &&
        this.filter.range.selectedMax > this.filter.range.max
      ) {
        this.filter.range.selectedMax = this.filter.range.max;
      }
    }
  }

  /**
   * Maneja cambios en el slider (con debounce implícito)
   */
  onSliderChange(): void {
    // El slider ya tiene su propio debounce, emitir directamente
    this.emitPriceChange();
  }

  /**
   * Maneja el blur de los inputs (cuando el usuario termina de editar)
   */
  onPriceChange(): void {
    this.emitPriceChange();
  }

  /**
   * Emite el cambio de precio o atributo numérico después de validar
   */
  private emitPriceChange(): void {
    if (
      this.filter.range &&
      this.filter.range.selectedMin !== undefined &&
      this.filter.range.selectedMax !== undefined
    ) {
      // Validar que min no sea mayor que max
      if (this.filter.range.selectedMin > this.filter.range.selectedMax) {
        const temp: number = this.filter.range.selectedMin;
        this.filter.range.selectedMin = this.filter.range.selectedMax;
        this.filter.range.selectedMax = temp;
      }

      // Asegurar que estén dentro del rango válido
      this.filter.range.selectedMin = Math.max(
        this.filter.range.min,
        this.filter.range.selectedMin
      );
      this.filter.range.selectedMax = Math.min(
        this.filter.range.max,
        this.filter.range.selectedMax
      );

      // Determinar si es un filtro de precio o atributo numérico
      const isAttributeRange = this.filter.id.startsWith('attr_');

      this.filterChange.emit({
        filterId: this.filter.id,
        ...(isAttributeRange
          ? {
              attributeRange: {
                min: this.filter.range.selectedMin,
                max: this.filter.range.selectedMax
              }
            }
          : {
              priceRange: {
                min: this.filter.range.selectedMin,
                max: this.filter.range.selectedMax
              }
            })
      });
    }
  }

  /**
   * Formatea el precio con separadores de miles (sin abreviar)
   */
  formatPrice(value: number | undefined): string {
    if (value === undefined || value === null) return '$0';
    if (!value && value !== 0) return '$0';

    // Mostrar número completo con separadores de miles
    return `$${value.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
  }

  /**
   * Calcula un step apropiado basado en el rango de precios
   */
  calculateStep(min: number, max: number): number {
    const range = max - min;

    // Para rangos muy grandes (más de 1M), usar steps más grandes
    if (range > 5000000) return 100000; // 100K
    if (range > 1000000) return 50000; // 50K
    if (range > 500000) return 10000; // 10K
    if (range > 100000) return 5000; // 5K
    if (range > 10000) return 1000; // 1K
    if (range > 1000) return 100; // 100

    return 1; // Default
  }

  /**
   * Obtiene las opciones visibles según búsqueda y límite
   */
  getVisibleOptions(): FilterValue[] {
    let options = this.filter.options;

    // Aplicar filtro de búsqueda si existe
    if (this.searchQuery() && this.filter.searchable) {
      const query = this.searchQuery().toLowerCase();
      options = options.filter((opt) => opt.label.toLowerCase().includes(query));
    }

    // Aplicar límite de opciones visibles si no se muestra todo
    if (!this.showAllOptions() && this.filter.expandable && this.filter.maxVisibleOptions) {
      options = options.slice(0, this.filter.maxVisibleOptions);
    }

    return options;
  }

  /**
   * Verifica si hay más opciones disponibles
   */
  hasMoreOptions(): boolean {
    if (!this.filter.expandable || !this.filter.maxVisibleOptions) {
      return false;
    }

    const totalOptions =
      this.searchQuery() && this.filter.searchable
        ? this.filter.options.filter((opt) =>
            opt.label.toLowerCase().includes(this.searchQuery().toLowerCase())
          ).length
        : this.filter.options.length;

    return totalOptions > this.filter.maxVisibleOptions;
  }

  /**
   * Alterna entre mostrar todas las opciones o solo las visibles
   */
  toggleShowAll(): void {
    this.showAllOptions.set(!this.showAllOptions());
  }

  /**
   * Actualiza la búsqueda dentro del filtro
   */
  onSearchChange(query: string): void {
    this.searchQuery.set(query);
    // Resetear el estado de mostrar todo al buscar
    this.showAllOptions.set(false);
  }

  /**
   * Limpia la búsqueda
   */
  clearSearch(): void {
    this.searchQuery.set('');
  }

  /**
   * Formatea valores numéricos de atributos con unidad
   */
  formatNumericValue(value: number | undefined): string {
    if (value === undefined || value === null) return '0';

    const unit = this.filter.unit || '';

    // Si es un atributo de precio, usar formato de precio
    if (this.filter.id === 'price') {
      return this.formatPrice(value);
    }

    // Para valores numéricos simples con unidad
    if (value < 1000) {
      return `${value.toLocaleString('en-US', { maximumFractionDigits: 1 })}${unit}`;
    }

    // Para valores grandes (ej: GB, MHz)
    if (value < 1000000) {
      const thousands = value / 1000;
      return `${thousands.toLocaleString('en-US', { maximumFractionDigits: 1 })}K${unit}`;
    }

    const millions = value / 1000000;
    return `${millions.toLocaleString('en-US', { maximumFractionDigits: 2 })}M${unit}`;
  }

  /**
   * Obtiene el label de rango formateado
   */
  getRangeLabel(): string {
    if (!this.filter.range) return '';

    const min = this.formatNumericValue(this.filter.range.selectedMin);
    const max = this.formatNumericValue(this.filter.range.selectedMax);

    return `${min} - ${max}`;
  }

  /**
   * Determina si es un filtro de atributo dinámico
   */
  get isAttributeFilter(): boolean {
    return this.filter.id.startsWith('attr_');
  }

  /**
   * Obtiene el conteo total de opciones seleccionadas
   */
  get selectedCount(): number {
    return this.filter.options.filter((o) => o.isSelected).length;
  }
}
