import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { MatSliderModule } from '@angular/material/slider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { FilterOption, FilterType } from '../../models';

interface FilterChangeEvent {
  filterId: string;
  optionId?: string;
  checked?: boolean;
  priceRange?: { min: number; max: number };
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
    FormsModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './filter-group.component.html',
  styleUrls: ['./filter-group.component.scss']
})
export class FilterGroupComponent {
  @Input({ required: true }) filter!: FilterOption;
  @Output() filterChange = new EventEmitter<FilterChangeEvent>();

  FilterType = FilterType;
  private priceChangeTimeout?: ReturnType<typeof setTimeout>;

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
   * Emite el cambio de precio después de validar
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

      this.filterChange.emit({
        filterId: this.filter.id,
        priceRange: {
          min: this.filter.range.selectedMin,
          max: this.filter.range.selectedMax
        }
      });
    }
  }

  /**
   * Formatea el precio de manera compacta para valores grandes
   */
  formatPrice(value: number | undefined): string {
    if (value === undefined || value === null) return '$0';
    if (!value && value !== 0) return '$0';

    // Para valores menores a 1000, mostrar completo
    if (value < 1000) {
      return `$${value.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
    }

    // Para valores entre 1000 y 999,999, mostrar con K
    if (value < 1000000) {
      const thousands = value / 1000;
      return `$${thousands.toLocaleString('en-US', { maximumFractionDigits: thousands >= 100 ? 0 : 1 })}K`;
    }

    // Para valores >= 1,000,000, mostrar con M
    const millions = value / 1000000;
    return `$${millions.toLocaleString('en-US', { maximumFractionDigits: millions >= 10 ? 1 : 2 })}M`;
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
}
