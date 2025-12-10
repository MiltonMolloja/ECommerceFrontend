import { Component, inject, signal, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { TranslateModule } from '@ngx-translate/core';
import { SavedSearchesService, SavedSearch } from '../../../core/services/saved-searches.service';
import { SaveSearchDialogComponent } from '../save-search-dialog/save-search-dialog.component';

@Component({
  selector: 'app-saved-searches-menu',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatListModule,
    MatDividerModule,
    MatBadgeModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    TranslateModule
  ],
  templateUrl: './saved-searches-menu.component.html',
  styleUrl: './saved-searches-menu.component.scss'
})
export class SavedSearchesMenuComponent {
  private readonly savedSearchesService = inject(SavedSearchesService);
  private readonly dialog = inject(MatDialog);

  readonly searchSelected = output<SavedSearch>();
  readonly searchDeleted = output<string>();

  // Computed from service signal
  get savedSearches(): SavedSearch[] {
    return this.savedSearchesService.getSavedSearches();
  }

  get hasSavedSearches(): boolean {
    return this.savedSearches.length > 0;
  }

  get savedSearchCount(): number {
    return this.savedSearches.length;
  }

  onSelectSearch(search: SavedSearch): void {
    this.savedSearchesService.markAsUsed(search.id);
    this.searchSelected.emit(search);
  }

  onDeleteSearch(search: SavedSearch, event: Event): void {
    event.stopPropagation();

    if (confirm(`¿Eliminar la búsqueda guardada "${search.name}"?`)) {
      this.savedSearchesService.deleteSearch(search.id);
      this.searchDeleted.emit(search.id);
    }
  }

  onClearAll(): void {
    if (confirm('¿Eliminar todas las búsquedas guardadas?')) {
      this.savedSearchesService.clearAll();
    }
  }

  getFilterSummary(search: SavedSearch): string {
    const parts: string[] = [];

    if (search.filters.categories?.length) {
      parts.push(`${search.filters.categories.length} categoría(s)`);
    }

    if (search.filters.brands?.length) {
      parts.push(`${search.filters.brands.length} marca(s)`);
    }

    if (search.filters.priceMin !== undefined || search.filters.priceMax !== undefined) {
      parts.push('Precio');
    }

    if (search.filters.minRating) {
      parts.push(`Rating ≥ ${search.filters.minRating}`);
    }

    if (search.filters.inStock) {
      parts.push('En stock');
    }

    if (search.filters.hasDiscount) {
      parts.push('Con descuento');
    }

    if (search.filters.attributes && Object.keys(search.filters.attributes).length > 0) {
      parts.push(`${Object.keys(search.filters.attributes).length} atributo(s)`);
    }

    return parts.length > 0 ? parts.join(' • ') : 'Sin filtros';
  }

  formatDate(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return 'Hoy';
    } else if (diffDays === 1) {
      return 'Ayer';
    } else if (diffDays < 7) {
      return `Hace ${diffDays} días`;
    } else if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return `Hace ${weeks} semana${weeks > 1 ? 's' : ''}`;
    } else {
      return date.toLocaleDateString();
    }
  }
}
