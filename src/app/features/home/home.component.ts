/**
 * HomeComponent - Arquitectura Híbrida con Signals
 *
 * Estrategia de carga:
 * 1. Carga inicial: Endpoint agregador (una sola llamada HTTP)
 * 2. Fallback: Si falla el agregador, carga secciones individuales
 * 3. Polling: Actualiza ofertas cada 60 segundos
 * 4. Retry: Permite reintentar en caso de error
 */

import { Component, inject, signal, computed, OnInit, OnDestroy, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { interval, Subject, takeUntil, forkJoin, map, catchError, of } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

// Services
import { HomeService } from './services/home.service';
import { CategoriesService } from '@core/services/categories';
import { LanguageService } from '@core/services/language.service';
import { CartService } from '@core/services/cart.service';

// Models
import { HomePageResponse, BannerDto, ProductDto, CategoryDto } from '@core/models';

// Components
import { HeroBanner } from './components/hero-banner/hero-banner';
import { ProductCarouselComponent } from '@shared/components/product-carousel/product-carousel.component';
import { CategoriesGrid } from './components/categories-grid/categories-grid';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    TranslateModule,
    HeroBanner,
    ProductCarouselComponent,
    CategoriesGrid
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit, OnDestroy {
  private homeService = inject(HomeService);
  private categoriesService = inject(CategoriesService);
  private languageService = inject(LanguageService);
  private cartService = inject(CartService);
  private translateService = inject(TranslateService);
  private snackBar = inject(MatSnackBar);
  private router = inject(Router);
  private destroy$ = new Subject<void>();

  // Track if initial load has completed to avoid double-loading
  private initialLoadComplete = false;

  // ========================================
  // ESTADO (Signals)
  // ========================================

  // Estado de carga y errores
  isLoading = signal(true);
  error = signal<string | null>(null);
  loadStrategy = signal<'aggregator' | 'individual' | null>(null);

  // Datos de las secciones
  banners = signal<BannerDto[]>([]);
  featuredProducts = signal<ProductDto[]>([]);
  deals = signal<ProductDto[]>([]);
  bestSellers = signal<ProductDto[]>([]);
  newArrivals = signal<ProductDto[]>([]);
  topRated = signal<ProductDto[]>([]);
  featuredCategories = signal<CategoryDto[]>([]);

  // Metadata
  metadata = signal<HomePageResponse['metadata'] | null>(null);

  // Computed: verificar si hay datos
  hasData = computed(
    () =>
      this.banners().length > 0 ||
      this.featuredProducts().length > 0 ||
      this.deals().length > 0 ||
      this.bestSellers().length > 0
  );

  // Computed: información del cache
  cacheInfo = computed(() => this.homeService.getCacheInfo());

  constructor() {
    // Listen for language changes and reload data
    effect(() => {
      const langChangeCount = this.languageService.languageChanged();

      console.log('[HomeComponent] 🔔 Language change detected:', {
        langChangeCount,
        initialLoadComplete: this.initialLoadComplete,
        currentLanguage: this.languageService.currentLanguage()
      });

      // Only reload if initial load has completed (avoid double-loading on startup)
      if (this.initialLoadComplete && langChangeCount > 0) {
        console.log('[HomeComponent] 🌐 Language changed, reloading data...');
        this.homeService.clearCache();
        this.loadHomePageData();
      }
    });
  }

  // ========================================
  // LIFECYCLE HOOKS
  // ========================================

  ngOnInit(): void {
    this.loadHomePageData();
    this.setupDealsPolling();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ========================================
  // CARGA DE DATOS
  // ========================================

  /**
   * 🏠 Carga inicial usando endpoint agregador
   */
  loadHomePageData(): void {
    this.isLoading.set(true);
    this.error.set(null);
    this.loadStrategy.set('aggregator');

    console.log('[HomeComponent] 🚀 Loading home page data (aggregator)');

    this.homeService
      .getHomePageData({ productsPerSection: 8 })
      .pipe(
        catchError((error) => {
          console.error('[HomeComponent] ❌ Aggregator failed, trying individual endpoints', error);
          this.loadStrategy.set('individual');
          // Fallback a endpoints individuales
          return this.loadSectionsIndividually();
        })
      )
      .subscribe({
        next: (response) => {
          this.updateAllSections(response);
          this.isLoading.set(false);
          this.initialLoadComplete = true;

          console.log('[HomeComponent] ✅ Home page loaded', {
            strategy: this.loadStrategy(),
            fromCache: response.metadata?.fromCache,
            executionTime: `${response.metadata?.queryExecutionTimeMs}ms`
          });
        },
        error: (err) => {
          console.error('[HomeComponent] ❌ Failed to load home page:', err);
          this.error.set('Error al cargar la página. Por favor, intenta de nuevo.');
          this.isLoading.set(false);
        }
      });
  }

  /**
   * 🔄 Fallback: Carga secciones individualmente si falla el agregador
   */
  private loadSectionsIndividually() {
    console.log('[HomeComponent] 🔄 Loading sections individually (fallback)');

    return forkJoin({
      banners: this.homeService.getBanners({ position: 'hero' }).pipe(catchError(() => of([]))),
      featuredProducts: this.homeService
        .getFeaturedProducts({ limit: 8 })
        .pipe(catchError(() => of([]))),
      deals: this.homeService.getDeals({ limit: 8 }).pipe(catchError(() => of([]))),
      bestSellers: this.homeService.getBestSellers({ limit: 8 }).pipe(catchError(() => of([]))),
      newArrivals: this.homeService.getNewArrivals({ limit: 8 }).pipe(catchError(() => of([]))),
      topRated: this.homeService
        .getTopRated({ limit: 8, minRating: 4 })
        .pipe(catchError(() => of([]))),
      featuredCategories: this.homeService
        .getFeaturedCategories({ limit: 8 })
        .pipe(catchError(() => of([])))
    }).pipe(
      map(
        (data) =>
          ({
            ...data,
            metadata: {
              language: 'es',
              generatedAt: new Date().toISOString(),
              cacheDurationSeconds: 300,
              queryExecutionTimeMs: 0,
              fromCache: false
            }
          }) as HomePageResponse
      )
    );
  }

  /**
   * Actualiza todas las secciones con los datos recibidos
   */
  private updateAllSections(response: HomePageResponse): void {
    this.banners.set(response.banners || []);
    this.featuredProducts.set(response.featuredProducts || []);
    this.deals.set(response.deals || []);
    this.bestSellers.set(response.bestSellers || []);
    this.newArrivals.set(response.newArrivals || []);
    this.topRated.set(response.topRated || []);
    this.featuredCategories.set(response.featuredCategories || []);
    this.metadata.set(response.metadata);

    // Compartir categorías con el servicio global para el menú de navegación
    if (response.featuredCategories && response.featuredCategories.length > 0) {
      this.categoriesService.setCategories(response.featuredCategories);
    }
  }

  // ========================================
  // POLLING Y ACTUALIZACIONES PARCIALES
  // ========================================

  /**
   * ⏰ Polling: Actualiza ofertas cada minuto
   */
  private setupDealsPolling(): void {
    interval(60000) // Cada 60 segundos
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.refreshDeals();
      });
  }

  /**
   * 🔥 Actualización parcial: Solo ofertas
   */
  refreshDeals(): void {
    console.log('[HomeComponent] 🔄 Refreshing deals (polling)');

    this.homeService.getDeals({ limit: 8 }).subscribe({
      next: (deals) => {
        this.deals.set(deals);
        console.log('[HomeComponent] ✅ Deals refreshed', { count: deals.length });
      },
      error: (err) => console.error('[HomeComponent] ❌ Error refreshing deals:', err)
    });
  }

  // ========================================
  // ACCIONES DEL USUARIO
  // ========================================

  /**
   * 🔄 Recargar toda la página
   */
  retry(): void {
    console.log('[HomeComponent] 🔄 Retrying home page load');
    this.homeService.clearCache();
    this.loadHomePageData();
  }

  /**
   * 🗑️ Limpiar cache y recargar
   */
  clearCacheAndReload(): void {
    console.log('[HomeComponent] 🗑️ Clearing cache and reloading');
    this.homeService.clearCache();
    this.loadHomePageData();
  }

  /**
   * 🛒 Agregar producto al carrito
   */
  onAddToCart(product: ProductDto): void {
    console.log('[HomeComponent] 🛒 Add to cart:', product);

    // Verificar stock
    if (product.stock && product.stock.stock <= 0) {
      this.snackBar.open(
        this.translateService.instant('CART.OUT_OF_STOCK'),
        this.translateService.instant('CART.CLOSE'),
        {
          duration: 3000,
          horizontalPosition: 'end',
          verticalPosition: 'top',
          panelClass: ['error-snackbar']
        }
      );
      return;
    }

    // Agregar al carrito (sin nombre, se obtiene dinámicamente)
    this.cartService.addToCart({
      id: product.productId.toString(),
      price: product.price,
      currency: 'USD',
      imageUrl: product.primaryImageUrl || '',
      brand: product.brand || '',
      inStock: product.stock ? product.stock.stock > 0 : true
    });

    // Mostrar confirmación con opción de ir al carrito
    const message = this.translateService.instant('CART.PRODUCT_ADDED');
    const action = this.translateService.instant('CART.VIEW_CART');

    const snackBarRef = this.snackBar.open(message, action, {
      duration: 5000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: ['success-snackbar']
    });

    // Navegar al carrito si el usuario hace clic en "Ver carrito"
    snackBarRef.onAction().subscribe(() => {
      this.router.navigate(['/cart']);
    });
  }
}
