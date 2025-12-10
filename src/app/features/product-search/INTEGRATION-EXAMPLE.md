# Ejemplo de Integración Completa - Filtros Dinámicos de Atributos

## Componente Principal de Búsqueda

Este es un ejemplo completo de cómo integrar el sistema de filtros dinámicos en un componente de búsqueda de productos.

### `product-search-page.component.ts`

```typescript
import {
  Component,
  OnInit,
  OnDestroy,
  inject,
  signal,
  computed,
  ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';

// Services
import { ProductSearchService } from '../services/product-search.service';
import { FilterService } from '../services/filter.service';

// Components
import { FiltersSidebarComponent } from '../components/filters-sidebar/filters-sidebar.component';
import { SearchResultsComponent } from '../components/search-results/search-results.component';
import { SearchHeaderComponent } from '../components/search-header/search-header.component';
import { ActiveFiltersComponent } from '../components/active-filters/active-filters.component';
import { PaginationComponent } from '../components/pagination/pagination.component';

// Models
import { Product } from '../models/product.model';
import { FilterOption } from '../models/filter.model';
import { SearchFacets, SearchMetadata } from '../models/facets.model';
import { AdvancedSearchParams, SortOption } from '../models/search-params.model';

@Component({
  selector: 'app-product-search-page',
  standalone: true,
  imports: [
    CommonModule,
    FiltersSidebarComponent,
    SearchResultsComponent,
    SearchHeaderComponent,
    ActiveFiltersComponent,
    PaginationComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './product-search-page.component.html',
  styleUrls: ['./product-search-page.component.scss']
})
export class ProductSearchPageComponent implements OnInit, OnDestroy {
  // Dependency Injection
  private searchService = inject(ProductSearchService);
  private filterService = inject(FilterService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  // Signals para estado reactivo
  products = signal<Product[]>([]);
  filters = signal<FilterOption[]>([]);
  facets = signal<SearchFacets | undefined>(undefined);
  metadata = signal<SearchMetadata | undefined>(undefined);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);

  // Paginación
  currentPage = signal<number>(1);
  totalPages = signal<number>(0);
  totalResults = signal<number>(0);

  // Búsqueda
  searchQuery = signal<string>('');
  sortBy = signal<SortOption>(SortOption.RELEVANCE);

  // Computed values
  hasResults = computed(() => this.products().length > 0);
  hasFilters = computed(() => this.filters().length > 0);
  hasActiveFilters = computed(() => {
    const state = this.filterService.getCurrentState();
    return state.filters.length > 0 || state.priceRange !== null;
  });

  // Subject para cleanup
  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    // Leer parámetros de la URL
    this.route.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        this.searchQuery.set(params['q'] || '');
        this.currentPage.set(parseInt(params['page'] || '1', 10));
        this.sortBy.set(params['sort'] || SortOption.RELEVANCE);

        // Realizar búsqueda inicial
        this.performSearch();
      });

    // Suscribirse a cambios en filtros
    this.filterService.activeFilters$
      .pipe(
        takeUntil(this.destroy$),
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(() => {
        // Resetear a página 1 cuando cambian los filtros
        this.currentPage.set(1);
        this.performSearch();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Ejecuta la búsqueda de productos con todos los filtros activos
   */
  performSearch(): void {
    this.loading.set(true);
    this.error.set(null);

    // Construir parámetros de búsqueda avanzada
    const searchParams: AdvancedSearchParams = this.filterService.getAdvancedSearchParams({
      query: this.searchQuery(),
      page: this.currentPage(),
      pageSize: 24,
      sortBy: this.sortBy(),
      // Las facetas se incluyen automáticamente por FilterService
    });

    console.log('🔍 Parámetros de búsqueda:', searchParams);

    this.searchService.searchAdvanced(searchParams)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          console.log('✅ Respuesta recibida:', response);

          // Actualizar estado
          this.products.set(response.products);
          this.filters.set(response.filters || []);
          this.facets.set(response.facets);
          this.metadata.set(response.metadata);

          // Actualizar paginación
          this.totalPages.set(response.pagination.totalPages);
          this.totalResults.set(response.totalResults);

          // Sincronizar filtros seleccionados con facetas
          this.syncSelectedFilters();

          this.loading.set(false);
        },
        error: (error) => {
          console.error('❌ Error en búsqueda:', error);
          this.error.set('Error al cargar productos. Por favor, intenta nuevamente.');
          this.loading.set(false);
        }
      });
  }

  /**
   * Sincroniza el estado seleccionado de los filtros con las facetas del backend
   */
  private syncSelectedFilters(): void {
    const state = this.filterService.getCurrentState();
    const currentFilters = this.filters();

    // Marcar opciones seleccionadas
    currentFilters.forEach(filter => {
      filter.options.forEach(option => {
        const isSelected = state.filters.some(
          f => f.filterId === filter.id && f.valueId === option.id
        );
        option.isSelected = isSelected;
      });

      // Sincronizar rangos
      if (filter.type === 'range' && filter.range) {
        if (filter.id === 'price' && state.priceRange) {
          filter.range.selectedMin = state.priceRange.min;
          filter.range.selectedMax = state.priceRange.max;
        } else if (filter.id.startsWith('attr_')) {
          const attrId = filter.id.replace('attr_', '');
          const attrRange = state.attributeRanges[attrId];
          if (attrRange) {
            filter.range.selectedMin = attrRange.min;
            filter.range.selectedMax = attrRange.max;
          }
        }
      }
    });

    // Actualizar signal para trigger re-render
    this.filters.set([...currentFilters]);
  }

  /**
   * Maneja cambios en los filtros desde el sidebar
   */
  onFilterChange(filterParams: Record<string, string[]> & { priceRange?: { min: number; max: number } }): void {
    console.log('🎯 Filtros cambiados:', filterParams);

    // El FilterService ya está actualizado por FiltersSidebarComponent
    // Solo necesitamos actualizar la URL y recargar

    this.updateUrlParams();
  }

  /**
   * Maneja cambios en la búsqueda
   */
  onSearchChange(query: string): void {
    this.searchQuery.set(query);
    this.currentPage.set(1);
    this.updateUrlParams();
  }

  /**
   * Maneja cambios en el ordenamiento
   */
  onSortChange(sortBy: SortOption): void {
    this.sortBy.set(sortBy);
    this.currentPage.set(1);
    this.updateUrlParams();
  }

  /**
   * Maneja cambios de página
   */
  onPageChange(page: number): void {
    this.currentPage.set(page);
    this.updateUrlParams();
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /**
   * Limpia todos los filtros activos
   */
  clearAllFilters(): void {
    this.filterService.clearAllFilters();
    this.updateUrlParams();
  }

  /**
   * Actualiza los parámetros de la URL sin recargar la página
   */
  private updateUrlParams(): void {
    const queryParams: any = {};

    // Query de búsqueda
    if (this.searchQuery()) {
      queryParams.q = this.searchQuery();
    }

    // Página (solo si no es la primera)
    if (this.currentPage() > 1) {
      queryParams.page = this.currentPage();
    }

    // Ordenamiento (solo si no es relevancia)
    if (this.sortBy() !== SortOption.RELEVANCE) {
      queryParams.sort = this.sortBy();
    }

    // Navegar sin recargar
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      queryParamsHandling: 'merge'
    });
  }

  /**
   * Formatea el tiempo de ejecución de la búsqueda
   */
  getExecutionTime(): string {
    const perf = this.metadata()?.performance;
    if (!perf) return '';

    const total = perf.totalExecutionTime;
    return total < 1000 ? `${total}ms` : `${(total / 1000).toFixed(2)}s`;
  }

  /**
   * Determina si se debe mostrar el mensaje de "sin resultados"
   */
  get showNoResults(): boolean {
    return !this.loading() && !this.hasResults() && this.searchQuery().length > 0;
  }

  /**
   * Determina si se debe mostrar el estado inicial
   */
  get showInitialState(): boolean {
    return !this.loading() && !this.hasResults() && this.searchQuery().length === 0;
  }
}
```

### `product-search-page.component.html`

```html
<div class="search-page">
  <!-- Header de búsqueda -->
  <app-search-header
    [query]="searchQuery()"
    [totalResults]="totalResults()"
    [sortBy]="sortBy()"
    (searchChange)="onSearchChange($event)"
    (sortChange)="onSortChange($event)"
  />

  <!-- Filtros activos (chips) -->
  @if (hasActiveFilters()) {
    <app-active-filters
      (clearAll)="clearAllFilters()"
    />
  }

  <!-- Layout principal -->
  <div class="search-layout">
    <!-- Sidebar de filtros -->
    <aside class="filters-sidebar-container">
      @if (hasFilters()) {
        <app-filters-sidebar
          [filters]="filters()"
          [loading]="loading()"
          (filterChange)="onFilterChange($event)"
        />
      }
    </aside>

    <!-- Contenido principal -->
    <main class="search-content">
      <!-- Metadata de búsqueda -->
      @if (metadata(); as meta) {
        <div class="search-metadata">
          <p class="results-info">
            <strong>{{ totalResults() }}</strong> resultados
            @if (getExecutionTime()) {
              <span class="execution-time">en {{ getExecutionTime() }}</span>
            }
          </p>

          @if (meta.didYouMean) {
            <div class="did-you-mean">
              ¿Quisiste decir
              <a (click)="onSearchChange(meta.didYouMean!)">{{ meta.didYouMean }}</a>?
            </div>
          }
        </div>
      }

      <!-- Resultados -->
      @if (loading()) {
        <div class="loading-state">
          <mat-spinner diameter="48"></mat-spinner>
          <p>Buscando productos...</p>
        </div>
      } @else if (showNoResults) {
        <div class="no-results">
          <mat-icon>search_off</mat-icon>
          <h3>No se encontraron resultados</h3>
          <p>Intenta con otros términos de búsqueda o ajusta los filtros.</p>
          @if (hasActiveFilters()) {
            <button mat-raised-button color="primary" (click)="clearAllFilters()">
              Limpiar filtros
            </button>
          }
        </div>
      } @else if (showInitialState) {
        <div class="initial-state">
          <mat-icon>search</mat-icon>
          <h3>Encuentra lo que buscas</h3>
          <p>Usa el buscador para encontrar productos.</p>
        </div>
      } @else {
        <app-search-results
          [products]="products()"
          [loading]="loading()"
        />

        <!-- Paginación -->
        @if (totalPages() > 1) {
          <app-pagination
            [currentPage]="currentPage()"
            [totalPages]="totalPages()"
            (pageChange)="onPageChange($event)"
          />
        }
      }

      <!-- Sugerencias relacionadas -->
      @if (metadata()?.relatedSearches; as related) {
        <div class="related-searches">
          <h4>Búsquedas relacionadas</h4>
          <div class="related-chips">
            @for (search of related; track search) {
              <mat-chip (click)="onSearchChange(search)">
                {{ search }}
              </mat-chip>
            }
          </div>
        </div>
      }
    </main>
  </div>
</div>
```

### `product-search-page.component.scss`

```scss
.search-page {
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
}

.search-layout {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 24px;
  margin-top: 20px;

  @media (max-width: 1024px) {
    grid-template-columns: 240px 1fr;
    gap: 16px;
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
}

.filters-sidebar-container {
  @media (max-width: 768px) {
    display: none; // En móvil, mostrar en modal/drawer
  }
}

.search-content {
  min-width: 0; // Prevenir overflow en grid
}

.search-metadata {
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--card-border);

  .results-info {
    margin: 0;
    color: var(--text-secondary);
    font-size: 14px;

    strong {
      color: var(--text-primary);
      font-weight: 600;
    }

    .execution-time {
      margin-left: 8px;
      color: var(--text-tertiary);
      font-size: 12px;
    }
  }

  .did-you-mean {
    margin-top: 8px;
    font-size: 13px;
    color: var(--text-secondary);

    a {
      color: var(--primary-color);
      cursor: pointer;
      text-decoration: underline;

      &:hover {
        color: var(--primary-dark);
      }
    }
  }
}

// Estados especiales
.loading-state,
.no-results,
.initial-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  text-align: center;

  mat-icon {
    font-size: 64px;
    width: 64px;
    height: 64px;
    color: var(--text-tertiary);
    margin-bottom: 16px;
  }

  h3 {
    margin: 0 0 8px;
    font-size: 20px;
    font-weight: 600;
    color: var(--text-primary);
  }

  p {
    margin: 0 0 24px;
    color: var(--text-secondary);
    max-width: 400px;
  }
}

.related-searches {
  margin-top: 40px;
  padding-top: 24px;
  border-top: 1px solid var(--card-border);

  h4 {
    margin: 0 0 12px;
    font-size: 16px;
    font-weight: 600;
    color: var(--text-primary);
  }

  .related-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;

    mat-chip {
      cursor: pointer;

      &:hover {
        background-color: var(--primary-light);
      }
    }
  }
}

// Responsive
@media (max-width: 768px) {
  .search-page {
    padding: 12px;
  }

  .search-layout {
    margin-top: 12px;
  }
}
```

## Flujo de Datos Completo

```
1. Usuario aplica filtro → FilterGroupComponent emite filterChange
                            ↓
2. FiltersSidebarComponent recibe evento → Actualiza FilterService
                            ↓
3. FilterService emite activeFilters$ → ProductSearchPageComponent se suscribe
                            ↓
4. Component ejecuta performSearch() → Construye AdvancedSearchParams
                            ↓
5. ProductSearchService.searchAdvanced() → Request al backend
                            ↓
6. Backend retorna facetas actualizadas → FacetMapperService mapea a FilterOption[]
                            ↓
7. Component actualiza signals → UI se re-renderiza automáticamente
                            ↓
8. syncSelectedFilters() marca opciones seleccionadas → Estado consistente
```

## Manejo de Estado

El sistema mantiene tres fuentes de estado:

1. **FilterService** (Single Source of Truth)
   - Filtros activos
   - Rangos de precio/atributos
   - Observable para reactividad

2. **Component Signals**
   - Productos
   - Facetas/Filtros
   - Loading states
   - Paginación

3. **URL Query Params**
   - Query de búsqueda
   - Página actual
   - Ordenamiento
   - (Opcional: Filtros persistentes)

## Performance Tips

1. **Debouncing**: Los cambios de filtros tienen debounce de 300ms
2. **OnPush**: Todos los componentes usan `ChangeDetectionStrategy.OnPush`
3. **Signals**: Estado reactivo eficiente con Angular Signals
4. **TrackBy**: Listas usan trackBy para evitar re-renders
5. **TakeUntil**: Cleanup apropiado de subscriptions

## Próximos Pasos

1. Agregar soporte para filtros en URL query params
2. Implementar drawer/modal de filtros para móviles
3. Agregar analytics tracking de filtros usados
4. Implementar "Guardar búsqueda" con filtros
5. Agregar A/B testing de layouts de filtros
