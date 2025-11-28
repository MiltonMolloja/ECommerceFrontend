import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { TranslateModule } from '@ngx-translate/core';
import { ActiveFilter } from '../../models';

@Component({
  selector: 'app-active-filters',
  standalone: true,
  imports: [CommonModule, MatChipsModule, MatIconModule, MatButtonModule, TranslateModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="active-filters">
      <div class="filters-header">
        <span class="filters-title">{{ 'PRODUCT_SEARCH.ACTIVE_FILTERS' | translate }}:</span>
        <button mat-button color="primary" class="clear-all-btn" (click)="clearAll.emit()">
          {{ 'COMMON.CLEAR_ALL' | translate }}
        </button>
      </div>

      <mat-chip-set class="filters-chips">
        @for (filter of filters; track filter.filterId + filter.valueId) {
          <mat-chip (removed)="removeFilter.emit(filter)">
            {{ filter.filterName }}: {{ filter.valueLabel }}
            <button matChipRemove [attr.aria-label]="'Quitar ' + filter.valueLabel">
              <mat-icon>cancel</mat-icon>
            </button>
          </mat-chip>
        }
      </mat-chip-set>
    </div>
  `,
  styles: [
    `
      .active-filters {
        padding: 16px;
        background: var(--card-bg);
        border: 1px solid var(--card-border);
        border-radius: 8px;
        margin-bottom: 16px;
      }

      .filters-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;
      }

      .filters-title {
        font-weight: 600;
        color: var(--text-primary);
      }

      .clear-all-btn {
        font-size: 13px;
      }

      .filters-chips {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }
    `
  ]
})
export class ActiveFiltersComponent {
  @Input() filters: ActiveFilter[] = [];
  @Output() removeFilter = new EventEmitter<ActiveFilter>();
  @Output() clearAll = new EventEmitter<void>();
}
