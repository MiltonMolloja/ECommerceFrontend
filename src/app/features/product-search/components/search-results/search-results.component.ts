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
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatBadgeModule } from '@angular/material/badge';
import { ProductSearchService } from '../../services/product-search.service';
import { FilterService } from '../../services/filter.service';
import { CartService } from '../../../../core/services/cart.service';
import { Product, SearchParams, SortOption, FilterOption } from '../../models';
import { AdvancedSearchParams } from '../../models/search-params.model';
import { FiltersSidebarComponent } from '../filters-sidebar/filters-sidebar.component';
import { SortDropdownComponent } from '../sort-dropdown/sort-dropdown.component';
import { ActiveFiltersComponent } from '../active-filters/active-filters.component';

@Component({
  selector: 'app-search-results',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ScrollingModule,
    MatProgressBarModule,
    MatSnackBarModule,
    MatIconModule,
    MatButtonModule,
    MatBadgeModule,
    TranslateModule,
    FiltersSidebarComponent,
    SortDropdownComponent,
    ActiveFiltersComponent
  ],
  templateUrl: './search-results.component.html',
  styleUrls: ['./search-results.component.scss']
})
export class SearchResultsComponent implements OnInit, OnDestroy {
  private productSearchService = inject(ProductSearchService);
  private filterService = inject(FilterService);
  private cartService = inject(CartService);
  private translateService = inject(TranslateService);
  private snackBar = inject(MatSnackBar);
  private breakpointObserver = inject(BreakpointObserver);
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

  // Mobile filters toggle
  isMobileOrTablet = signal<boolean>(false);
  filtersVisible = signal<boolean>(false);

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
    this.initializeBreakpointObserver();

    // Register callback for language change reload
    this.productSearchService.onLanguageChangeReload(() => {
      if (this.currentSearchParams) {
        this.performSearch(this.currentSearchParams);
      }
    });
  }

  /**
   * Inicializar observer de breakpoints para detectar móvil/tablet
   */
  private initializeBreakpointObserver(): void {
    this.breakpointObserver
      .observe([Breakpoints.Handset, Breakpoints.TabletPortrait, Breakpoints.TabletLandscape])
      .pipe(takeUntil(this.destroy$))
      .subscribe((result) => {
        this.isMobileOrTablet.set(result.matches);
        // Si cambia a desktop, mostrar filtros automáticamente
        if (!result.matches) {
          this.filtersVisible.set(true);
        }
      });
  }

  /**
   * Toggle visibilidad de filtros en móvil
   */
  toggleFilters(): void {
    this.filtersVisible.update((v) => !v);
  }

  /**
   * Obtiene el conteo de filtros activos para mostrar en el badge
   */
  get activeFilterCount(): number {
    return this.filters().reduce((count, filter) => {
      const activeOptions = filter.options.filter((o) => o.isSelected).length;
      return count + activeOptions;
    }, 0);
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
   * Realizar búsqueda de productos usando búsqueda avanzada con facetas dinámicas
   * SIEMPRE usa búsqueda avanzada para obtener filtros dinámicos (Resolución, Año, etc.)
   */
  public performSearch(params: SearchParams): void {
    this.loading.set(true);
    this.error.set(null);

    // Resetear el rango de precio original si cambió la búsqueda o categoría
    const queryOrCategoryChanged =
      this.currentSearchParams?.query !== params.query ||
      this.currentSearchParams?.category !== params.category;

    if (queryOrCategoryChanged) {
      this.originalPriceRange = null;
    }

    this.currentSearchParams = params; // Store for language change reload

    // Convertir SearchParams a AdvancedSearchParams
    const advancedParams = this.convertToAdvancedParams(params);
    console.log('🚀 Advanced Search Params:', advancedParams);

    this.productSearchService
      .searchAdvanced(advancedParams)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          console.log('🔍 Search Response:', response);
          console.log('📊 Total Products:', response.products.length);
          console.log('🎛️ Filters:', response.filters);
          console.log(
            '📁 Category Filter:',
            response.filters.find((f) => f.id === 'category')
          );
          console.log('🎯 Raw Facets:', response.facets);

          this.products.set(response.products);

          // Guardar el rango de precio original en la primera carga o después de un reset
          if (!this.originalPriceRange && response.filters.length > 0) {
            const priceFilter = response.filters.find((f) => f.id === 'price' && f.range);
            if (priceFilter?.range) {
              this.originalPriceRange = {
                min: priceFilter.range.min,
                max: priceFilter.range.max
              };
            }
          }

          // Marcar filtros seleccionados basándose en los params actuales
          const filtersWithSelection = this.markSelectedFilters(
            response.filters,
            params.filters || {},
            params.priceRange
          );
          console.log('✅ Filters with selection:', filtersWithSelection);
          this.filters.set(filtersWithSelection);

          this.totalResults.set(response.totalResults);
          this.currentPage.set(response.pagination.currentPage);
          this.totalPages.set(response.pagination.totalPages);
          this.loading.set(false);

          // Scroll to top en cada búsqueda
          window.scrollTo({ top: 0, behavior: 'smooth' });
        },
        error: () => {
          this.error.set('Error al cargar los productos. Por favor intenta nuevamente.');
          this.loading.set(false);
        }
      });
  }

  /**
   * Convertir SearchParams a AdvancedSearchParams
   */
  private convertToAdvancedParams(params: SearchParams): AdvancedSearchParams {
    const advancedParams: AdvancedSearchParams = {
      query: params.query || '',
      page: params.page,
      pageSize: params.pageSize,
      // Habilitar todas las facetas
      includeBrandFacets: true,
      includeCategoryFacets: true,
      includePriceFacets: true,
      includeRatingFacets: true,
      includeAttributeFacets: true
    };

    // Agregar sortBy solo si está definido
    if (params.sortBy) {
      advancedParams.sortBy = params.sortBy;
    }

    // Agregar priceRange solo si está definido
    if (params.priceRange) {
      advancedParams.priceRange = params.priceRange;
    }

    // Convertir category (string) a categoryIds (number[])
    if (params.category) {
      const categoryId = parseInt(params.category, 10);
      if (!isNaN(categoryId)) {
        advancedParams.categoryIds = [categoryId];
      }
    }

    // Procesar filtros activos
    if (params.filters) {
      // BrandIds
      if (params.filters['brand']) {
        advancedParams.brandIds = params.filters['brand']
          .map((id) => parseInt(id, 10))
          .filter((id) => !isNaN(id));
      }

      // CategoryIds
      if (params.filters['category']) {
        advancedParams.categoryIds = params.filters['category']
          .map((id) => parseInt(id, 10))
          .filter((id) => !isNaN(id));
      }

      // Rating
      if (params.filters['rating'] && params.filters['rating'].length > 0) {
        const ratingValue = params.filters['rating'][0];
        if (ratingValue) {
          const rating = parseInt(ratingValue, 10);
          if (!isNaN(rating)) {
            advancedParams.minAverageRating = rating;
          }
        }
      }

      // Atributos dinámicos (attr_*)
      const attributes: Record<string, string[]> = {};
      Object.entries(params.filters).forEach(([key, values]) => {
        if (key.startsWith('attr_')) {
          const attrId = key.replace('attr_', '');
          attributes[attrId] = values;
        }
      });

      if (Object.keys(attributes).length > 0) {
        advancedParams.attributes = attributes;
      }
    }

    // Rating desde params.rating
    if (params.rating !== undefined) {
      advancedParams.minAverageRating = params.rating;
    }

    return advancedParams;
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

    // Parsear brandIds si existe (puede venir como brandIds o filter_brand)
    if (params['brandIds']) {
      const brandIdsValue = Array.isArray(params['brandIds'])
        ? params['brandIds']
        : [params['brandIds']];

      // Agregar a filters como 'brand'
      if (!searchParams.filters) {
        searchParams.filters = {};
      }
      searchParams.filters['brand'] = brandIdsValue as string[];
      console.log('🏷️ Brand filter from URL:', searchParams.filters['brand']);
    }

    // Parsear categoryIds si existe (puede venir como categoryIds o filter_category)
    if (params['categoryIds']) {
      const categoryIdsValue = Array.isArray(params['categoryIds'])
        ? params['categoryIds']
        : [params['categoryIds']];

      // Agregar a filters como 'category'
      if (!searchParams.filters) {
        searchParams.filters = {};
      }
      searchParams.filters['category'] = categoryIdsValue as string[];
      console.log('📁 Category filter from URL:', searchParams.filters['category']);
    }

    // Parsear rango de precio si existe
    if (params['minPrice'] || params['maxPrice']) {
      searchParams.priceRange = {
        min: parseFloat((params['minPrice'] as string) || '0'),
        max: parseFloat((params['maxPrice'] as string) || String(Number.MAX_VALUE))
      };
    }

    // Parsear rating mínimo si existe (puede venir como filter_rating o minRating)
    if (params['filter_rating']) {
      const ratingValue = Array.isArray(params['filter_rating'])
        ? params['filter_rating'][0]
        : params['filter_rating'];
      if (ratingValue) {
        searchParams.rating = parseFloat(ratingValue as string);
      }
    } else if (params['minRating']) {
      searchParams.rating = parseFloat(params['minRating'] as string);
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

    // Convertir a AdvancedSearchParams
    const advancedParams = this.convertToAdvancedParams(searchParams);

    this.productSearchService
      .searchAdvanced(advancedParams)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          // Agregar productos nuevos al final de la lista existente
          const currentProducts = this.products();
          const newProducts = [...currentProducts, ...response.products];

          this.products.set(newProducts);
          this.currentPage.set(response.pagination.currentPage);
          this.totalPages.set(response.pagination.totalPages);
          this.loadingMore.set(false);
        },
        error: () => {
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

  /**
   * Agregar producto al carrito
   */
  addToCart(product: Product): void {
    if (!product.availability.inStock) {
      const message = this.translateService.instant('CART.OUT_OF_STOCK');
      const action = this.translateService.instant('CART.CLOSE');
      this.snackBar.open(message, action, {
        duration: 3000,
        horizontalPosition: 'end',
        verticalPosition: 'top',
        panelClass: ['error-snackbar']
      });
      return;
    }

    // Agregar al carrito (sin nombre, se obtiene dinámicamente)
    this.cartService.addToCart({
      id: product.id,
      price: product.price.current,
      currency: product.price.currency,
      imageUrl: product.images.main,
      brand: product.brand,
      inStock: product.availability.inStock
    });

    // Mostrar confirmación
    const message = this.translateService.instant('CART.PRODUCT_ADDED') || 'Product added to cart';
    const action = this.translateService.instant('CART.VIEW_CART') || 'View Cart';

    const snackBarRef = this.snackBar.open(message, action, {
      duration: 5000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: ['success-snackbar']
    });

    // Si hace clic en "View Cart", navegar al carrito
    snackBarRef.onAction().subscribe(() => {
      this.router.navigate(['/cart']);
    });

    console.log('🛒 Product added to cart:', product.title);
  }

  /**
   * Reintentar búsqueda después de un error
   */
  retry(): void {
    if (this.currentSearchParams) {
      this.performSearch(this.currentSearchParams);
    }
  }
}
