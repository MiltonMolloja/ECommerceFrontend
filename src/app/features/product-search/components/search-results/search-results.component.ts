import {
  Component,
  OnInit,
  OnDestroy,
  inject,
  signal,
  computed,
  HostListener
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ProductSearchService } from '../../services/product-search.service';
import { FilterService } from '../../services/filter.service';
import { Product, SearchParams, SortOption, FilterOption } from '../../models';
import { ProductCardComponent } from '../product-card/product-card.component';
import { FiltersSidebarComponent } from '../filters-sidebar/filters-sidebar.component';
import { SortDropdownComponent } from '../sort-dropdown/sort-dropdown.component';
import { BreadcrumbComponent } from '../breadcrumb/breadcrumb.component';
import { ActiveFiltersComponent } from '../active-filters/active-filters.component';
import { SearchHeaderComponent } from '../search-header/search-header.component';
import { MatProgressBarModule } from '@angular/material/progress-bar';

@Component({
  selector: 'app-search-results',
  standalone: true,
  imports: [
    CommonModule,
    ScrollingModule,
    MatProgressBarModule,
    TranslateModule,
    ProductCardComponent,
    FiltersSidebarComponent,
    SortDropdownComponent,
    BreadcrumbComponent,
    ActiveFiltersComponent,
    SearchHeaderComponent
  ],
  templateUrl: './search-results.component.html',
  styleUrls: ['./search-results.component.scss']
})
export class SearchResultsComponent implements OnInit, OnDestroy {
  private productSearchService = inject(ProductSearchService);
  private filterService = inject(FilterService);
  private translateService = inject(TranslateService);
  public route = inject(ActivatedRoute); // Public para usar en el template
  private router = inject(Router);
  private destroy$ = new Subject<void>();

  // Signals para estado reactivo
  products = signal<Product[]>([]);
  loading = signal<boolean>(false);
  loadingMore = signal<boolean>(false); // Para infinite scroll
  error = signal<string | null>(null);
  totalResults = signal<number>(0);
  currentPage = signal<number>(1);
  totalPages = signal<number>(1);

  // Computed signals
  hasResults = computed(() => this.products().length > 0);
  resultsText = computed(() => {
    const query = this.searchQuery();
    return this.translateService.instant('PRODUCT_SEARCH.RESULTS_FOR', { query });
  });

  searchQuery = signal<string>('');
  filters = signal<FilterOption[]>([]);
  activeFilters$ = this.filterService.activeFilters$;
  private currentSearchParams?: SearchParams;
  private originalPriceRange: { min: number; max: number } | null = null;

  ngOnInit(): void {
    this.initializeFromQueryParams();

    // Register callback for language change reload
    this.productSearchService.onLanguageChangeReload(() => {
      if (this.currentSearchParams) {
        console.log('🔄 Reloading search results due to language change...');
        this.performSearch(this.currentSearchParams);
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Inicializar desde query params de la URL
   */
  private initializeFromQueryParams(): void {
    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      const searchParams = this.parseQueryParams(params);
      this.searchQuery.set(params['k'] || params['query'] || '');
      this.performSearch(searchParams);
    });
  }

  /**
   * Realizar búsqueda de productos
   */
  public performSearch(params: SearchParams): void {
    console.log('🚀 Iniciando búsqueda con params:', params);
    this.loading.set(true);
    this.error.set(null);

    // Resetear el rango de precio original si cambió la búsqueda o categoría
    const queryOrCategoryChanged =
      this.currentSearchParams?.query !== params.query ||
      this.currentSearchParams?.category !== params.category;

    if (queryOrCategoryChanged) {
      this.originalPriceRange = null;
      console.log('🔄 Query o categoría cambió, reseteando rango de precio original');
    }

    this.currentSearchParams = params; // Store for language change reload

    this.productSearchService
      .searchProducts(params)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          console.log('📦 Respuesta procesada:', response);
          this.products.set(response.products);

          // Guardar el rango de precio original en la primera carga o después de un reset
          if (!this.originalPriceRange && response.filters.length > 0) {
            const priceFilter = response.filters.find((f) => f.id === 'price' && f.range);
            if (priceFilter?.range) {
              this.originalPriceRange = {
                min: priceFilter.range.min,
                max: priceFilter.range.max
              };
              console.log('💰 Rango de precio original guardado:', this.originalPriceRange);
            }
          }

          // Marcar filtros seleccionados basándose en los params actuales
          const filtersWithSelection = this.markSelectedFilters(
            response.filters,
            params.filters || {},
            params.priceRange
          );
          this.filters.set(filtersWithSelection);

          this.totalResults.set(response.totalResults);
          this.currentPage.set(response.pagination.currentPage);
          this.totalPages.set(response.pagination.totalPages);
          this.loading.set(false);

          // Scroll to top en cada búsqueda
          window.scrollTo({ top: 0, behavior: 'smooth' });
        },
        error: (err) => {
          console.error('💥 Error en componente:', err);
          this.error.set('Error al cargar los productos. Por favor intenta nuevamente.');
          this.loading.set(false);
        }
      });
  }

  /**
   * Marcar filtros como seleccionados basándose en los params activos
   */
  private markSelectedFilters(
    filters: FilterOption[],
    activeFilters: Record<string, string[]>,
    priceRange?: { min: number; max: number }
  ): FilterOption[] {
    return filters.map((filter) => {
      // Para filtros de rango de precio, mantener el rango original y actualizar solo los valores seleccionados
      if (filter.type === 'range' && filter.range) {
        // Usar el rango original si existe, sino usar el del filtro actual
        const rangeToUse = this.originalPriceRange || {
          min: filter.range.min,
          max: filter.range.max
        };

        return {
          ...filter,
          range: {
            ...filter.range,
            min: rangeToUse.min,
            max: rangeToUse.max,
            selectedMin: priceRange?.min ?? rangeToUse.min,
            selectedMax: priceRange?.max ?? rangeToUse.max
          },
          options: filter.options
        };
      }

      // Para otros filtros, marcar como seleccionados según activeFilters
      return {
        ...filter,
        options: filter.options.map((option) => ({
          ...option,
          isSelected: activeFilters[filter.id]?.includes(option.id) || false
        }))
      };
    });
  }

  /**
   * Manejar cambio de ordenamiento
   */
  onSortChange(sortOption: SortOption): void {
    const currentParams = this.route.snapshot.queryParams;
    const searchParams = this.parseQueryParams(currentParams);
    searchParams.sortBy = sortOption;
    searchParams.page = 1;

    this.updateURLParams(searchParams);
  }

  /**
   * Manejar cambio de página
   */
  onPageChange(page: number): void {
    const currentParams = this.route.snapshot.queryParams;
    const searchParams = this.parseQueryParams(currentParams);
    searchParams.page = page;

    this.updateURLParams(searchParams);
  }

  /**
   * Manejar cambio de filtros
   */
  onFilterChange(
    filterData: Record<string, string[]> & { priceRange?: { min: number; max: number } }
  ): void {
    const currentParams = this.route.snapshot.queryParams;
    const searchParams = this.parseQueryParams(currentParams);

    // Extraer priceRange si existe
    const { priceRange, ...filters } = filterData;

    searchParams.filters = filters;
    if (priceRange) {
      searchParams.priceRange = priceRange;
    }
    searchParams.page = 1;

    this.updateURLParams(searchParams);
  }

  /**
   * Manejar remoción de un filtro activo
   */
  onRemoveActiveFilter(filter: { filterId: string; valueId: string }): void {
    this.filterService.removeFilter(filter.filterId, filter.valueId);
    const filters = this.filterService.getActiveFiltersAsParams();
    this.onFilterChange(filters);
  }

  /**
   * Limpiar todos los filtros activos
   */
  onClearAllFilters(): void {
    this.filterService.clearAllFilters();
    this.onFilterChange({});
  }

  /**
   * Parsear query params a SearchParams
   */
  public parseQueryParams(params: Record<string, string | string[]>): SearchParams {
    const category = params['category'] as string;

    const searchParams: SearchParams = {
      query: (params['k'] as string) || (params['query'] as string) || '',
      ...(category && { category }),
      page: parseInt((params['page'] as string) || '1'),
      pageSize: parseInt((params['pageSize'] as string) || '24'),
      sortBy: params['sortBy'] as SortOption,
      filters: this.parseFilters(params)
    };

    // Parsear rango de precio si existe
    if (params['minPrice'] || params['maxPrice']) {
      searchParams.priceRange = {
        min: parseFloat((params['minPrice'] as string) || '0'),
        max: parseFloat((params['maxPrice'] as string) || String(Number.MAX_VALUE))
      };
    }

    return searchParams;
  }

  /**
   * Parsear filtros desde query params
   */
  private parseFilters(params: Record<string, string | string[]>): Record<string, string[]> {
    const filters: Record<string, string[]> = {};

    Object.keys(params).forEach((key) => {
      if (key.startsWith('filter_')) {
        const filterId = key.replace('filter_', '');
        const value = params[key];
        if (value !== undefined) {
          filters[filterId] = Array.isArray(value) ? value : [value];
        }
      }
    });

    return filters;
  }

  /**
   * Detectar scroll de la ventana para infinite scroll
   */
  @HostListener('window:scroll')
  onWindowScroll(): void {
    // Calcular si el usuario está cerca del final de la página
    const scrollPosition = window.pageYOffset + window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    const threshold = 300; // Cargar cuando esté a 300px del final

    if (
      scrollPosition >= documentHeight - threshold &&
      !this.loading() &&
      !this.loadingMore() &&
      this.currentPage() < this.totalPages()
    ) {
      console.log('🔄 Cargando más productos...', {
        scrollPosition,
        documentHeight,
        currentPage: this.currentPage(),
        totalPages: this.totalPages()
      });
      this.loadMoreProducts();
    }
  }

  /**
   * Manejar cambio de índice de scroll - Infinite scroll (Virtual scroll - deprecado)
   * Mantenido para compatibilidad pero ya no se usa
   */
  onScrollIndexChange(): void {
    // Ya no se usa, el scroll lo maneja onWindowScroll
  }

  /**
   * Cargar más productos (infinite scroll)
   */
  private loadMoreProducts(): void {
    const nextPage = this.currentPage() + 1;
    const currentParams = this.route.snapshot.queryParams;
    const searchParams = this.parseQueryParams(currentParams);
    searchParams.page = nextPage;

    this.loadingMore.set(true);

    this.productSearchService
      .searchProducts(searchParams)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          console.log('✨ Productos adicionales cargados:', response.products.length);

          // Agregar productos nuevos al final de la lista existente
          const currentProducts = this.products();
          const newProducts = [...currentProducts, ...response.products];

          this.products.set(newProducts);
          this.currentPage.set(response.pagination.currentPage);
          this.totalPages.set(response.pagination.totalPages);
          this.loadingMore.set(false);
        },
        error: (err) => {
          console.error('💥 Error cargando más productos:', err);
          this.loadingMore.set(false);
        }
      });
  }

  /**
   * Actualizar URL con parámetros de búsqueda
   */
  private updateURLParams(params: SearchParams): void {
    const queryParams: Record<string, string | number | string[]> = {};

    if (params.query) queryParams['k'] = params.query;
    if (params.category) queryParams['category'] = params.category;
    if (params.page > 1) queryParams['page'] = params.page;
    if (params.sortBy) queryParams['sortBy'] = params.sortBy;

    // Agregar rango de precio
    if (params.priceRange) {
      queryParams['minPrice'] = params.priceRange.min;
      queryParams['maxPrice'] = params.priceRange.max;
    }

    // Agregar filtros
    if (params.filters) {
      Object.entries(params.filters).forEach(([key, values]) => {
        queryParams[`filter_${key}`] = values;
      });
    }

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams
      // No usamos 'merge' para que reemplace completamente los params
      // Esto permite limpiar filtros correctamente
    });
  }
}
