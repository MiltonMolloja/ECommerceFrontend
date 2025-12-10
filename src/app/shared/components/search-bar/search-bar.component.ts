import { Component, signal, computed, inject, effect, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { TranslateModule } from '@ngx-translate/core';
import { debounceTime, distinctUntilChanged, switchMap, catchError, of } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { Subject } from 'rxjs';
import { ProductSearchService } from '../../../features/product-search/services/product-search.service';
import { SearchHistoryService } from '../../../core/services/search-history.service';
import { SortOption } from '../../../features/product-search/models/search-params.model';

interface SearchSuggestion {
  type: 'product' | 'category' | 'history';
  text: string;
  productId?: number;
  categoryId?: number;
  imageUrl?: string;
  price?: number;
}

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatAutocompleteModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    TranslateModule
  ],
  templateUrl: './search-bar.component.html',
  styleUrl: './search-bar.component.scss'
})
export class SearchBarComponent {
  private readonly router = inject(Router);
  private readonly searchService = inject(ProductSearchService);
  private readonly historyService = inject(SearchHistoryService);

  @ViewChild('searchInput', { read: ElementRef }) searchInput!: ElementRef<HTMLInputElement>;

  readonly searchQuery = signal('');
  readonly isLoading = signal(false);
  readonly showSuggestions = signal(false);

  private readonly searchSubject = new Subject<string>();

  // Sugerencias desde el backend
  private readonly suggestions$ = this.searchSubject.pipe(
    debounceTime(300),
    distinctUntilChanged(),
    switchMap(query => {
      if (!query || query.trim().length < 2) {
        this.isLoading.set(false);
        return of([]);
      }

      this.isLoading.set(true);

      // Buscar productos que coincidan con el query
      return this.searchService.searchProducts({
        query: query.trim(),
        page: 1,
        pageSize: 5,
        sortBy: SortOption.RELEVANCE
      }).pipe(
        catchError(() => of({ items: [], total: 0, page: 1, pageSize: 5, pages: 0 }))
      );
    })
  );

  private readonly suggestionsSignal = toSignal(this.suggestions$, { initialValue: { items: [], total: 0, page: 1, pageSize: 5, pages: 0 } });

  // Historial de búsqueda
  readonly searchHistory = computed(() => this.historyService.getHistory());

  // Helper computed para saber si solo muestra historial
  readonly showingHistoryOnly = computed(() => {
    const query = this.searchQuery().trim();
    return !query || query.length < 2;
  });

  // Combinar sugerencias de productos e historial
  readonly suggestions = computed(() => {
    const query = this.searchQuery().trim();
    const suggestions: SearchSuggestion[] = [];

    // Si no hay query, mostrar solo historial
    if (!query || query.length < 2) {
      const history = this.searchHistory();
      return history.map(text => ({
        type: 'history' as const,
        text
      }));
    }

    // Agregar productos como sugerencias
    const response = this.suggestionsSignal();
    const products: any[] = 'items' in response ? (response.items || []) : [];
    products.forEach((product: any) => {
      suggestions.push({
        type: 'product',
        text: product.name,
        productId: product.productId,
        imageUrl: product.imageUrl,
        price: product.price
      });
    });

    // Agregar historial que coincida con el query
    const history = this.searchHistory()
      .filter(h => h.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 3);

    history.forEach(text => {
      if (!suggestions.find(s => s.text.toLowerCase() === text.toLowerCase())) {
        suggestions.push({
          type: 'history',
          text
        });
      }
    });

    return suggestions;
  });

  constructor() {
    // Effect para manejar loading state
    effect(() => {
      const products = this.suggestionsSignal();
      if (products) {
        this.isLoading.set(false);
      }
    });
  }

  onSearchQueryChange(value: string): void {
    this.searchQuery.set(value);
    this.searchSubject.next(value);
    this.showSuggestions.set(true);
  }

  onSearch(query?: string): void {
    const searchText = query || this.searchQuery().trim();

    if (!searchText) {
      return;
    }

    // Guardar en historial
    this.historyService.addSearch(searchText);

    // Ocultar sugerencias
    this.showSuggestions.set(false);

    // Limpiar input
    this.searchQuery.set('');

    // Navegar a resultados
    this.router.navigate(['/s'], {
      queryParams: { k: searchText }
    });

    // Blur input
    if (this.searchInput) {
      this.searchInput.nativeElement.blur();
    }
  }

  selectSuggestion(suggestion: SearchSuggestion): void {
    if (suggestion.type === 'product' && suggestion.productId) {
      // Navegar al detalle del producto
      this.router.navigate(['/product', suggestion.productId]);
      this.showSuggestions.set(false);
      this.searchQuery.set('');
    } else {
      // Buscar el texto
      this.onSearch(suggestion.text);
    }
  }

  clearHistory(): void {
    this.historyService.clearHistory();
  }

  removeHistoryItem(text: string, event: Event): void {
    event.stopPropagation();
    this.historyService.removeSearch(text);
  }

  onFocus(): void {
    this.showSuggestions.set(true);
  }

  onBlur(): void {
    // Delay para permitir click en sugerencias
    setTimeout(() => {
      this.showSuggestions.set(false);
    }, 200);
  }

  getSuggestionIcon(type: SearchSuggestion['type']): string {
    switch (type) {
      case 'product':
        return 'shopping_bag';
      case 'category':
        return 'category';
      case 'history':
        return 'history';
      default:
        return 'search';
    }
  }
}
