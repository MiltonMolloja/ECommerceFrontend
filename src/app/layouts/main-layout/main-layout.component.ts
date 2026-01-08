import { Component, inject, computed, OnInit, signal, ViewChild } from '@angular/core';
import { Router, RouterOutlet, RouterLink } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatSidenavModule, MatSidenav } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatExpansionModule } from '@angular/material/expansion';
import { TranslateModule } from '@ngx-translate/core';
import { ThemeService, type ThemeMode } from '../../core/services/theme.service';
import { AuthService } from '../../core/services/auth.service';
import { CartService } from '../../core/services/cart.service';
import { CategoriesService } from '../../core/services/categories';
import { LanguageService, type Language } from '../../core/services/language.service';
import { LanguageSwitcher } from '../../shared/components/language-switcher/language-switcher';
import { SearchBarComponent } from '../../shared/components/search-bar/search-bar.component';
import { ApiConfigService } from '../../core/services/api-config.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatBadgeModule,
    MatMenuModule,
    MatDividerModule,
    MatSidenavModule,
    MatListModule,
    MatExpansionModule,
    TranslateModule,
    LanguageSwitcher,
    SearchBarComponent
  ],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss'
})
export class MainLayoutComponent implements OnInit {
  readonly themeService = inject(ThemeService);
  readonly authService = inject(AuthService);
  readonly cartService = inject(CartService);
  readonly categoriesService = inject(CategoriesService);
  readonly languageService = inject(LanguageService);
  private router = inject(Router);
  private apiConfig = inject(ApiConfigService);

  // ViewChild para el sidenav móvil
  @ViewChild('mobileDrawer') mobileDrawer!: MatSidenav;

  // Signal para controlar el estado del drawer móvil
  readonly isMobileDrawerOpen = signal(false);

  // Computed signal para el contador del carrito
  readonly cartItemCount = computed(() => this.cartService.itemCount());

  // Computed signal for user's first name
  readonly userFirstName = computed(() => {
    const user = this.authService.currentUser();
    return user?.firstName || '';
  });

  // Flag para mostrar badge de desarrollo (lee de window.__env en runtime)
  readonly isDevMode = this.checkDevMode();

  /**
   * Verifica si está en modo desarrollo usando window.__env en runtime
   */
  private checkDevMode(): boolean {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = window as Window & { __env?: Record<string, any> };
    // Check if explicitly set in window.__env (Docker runtime)
    if (w.__env?.['production'] !== undefined) {
      const prod = w.__env['production'];
      // Handle both boolean and string values
      return prod !== true && prod !== 'true';
    }
    // Fall back to environment.production (build time)
    return !environment.production;
  }

  readonly navigationItems = [
    {
      labelKey: 'HEADER.DEALS',
      route: '/s',
      queryParams: { hasDiscount: 'true' },
      icon: 'local_offer'
    },
    {
      labelKey: 'HEADER.BESTSELLERS',
      route: '/s',
      queryParams: { sortBy: 'bestseller' },
      icon: 'trending_up'
    },
    {
      labelKey: 'HEADER.FEATURED',
      route: '/s',
      queryParams: { isFeatured: 'true' },
      icon: 'star'
    },
    {
      labelKey: 'HEADER.NEW_ARRIVALS',
      route: '/s',
      queryParams: { sortBy: 'newest' },
      icon: 'new_releases'
    },
    {
      labelKey: 'HEADER.TOP_RATED',
      route: '/s',
      queryParams: { minRating: '4', sortBy: 'rating' },
      icon: 'grade'
    },
    {
      labelKey: 'HEADER.HELP',
      route: '/help',
      queryParams: {},
      icon: 'help_outline'
    }
  ];

  // Computed signal para las categorías
  categories = computed(() => this.categoriesService.categories());

  ngOnInit(): void {
    // Cargar categorías al inicializar
    this.categoriesService.loadCategories();
  }

  setTheme(mode: ThemeMode): void {
    this.themeService.setThemeMode(mode);
  }

  /**
   * Navega al perfil de usuario (aplicación externa en puerto 4400)
   */
  goToProfile(): void {
    window.location.href = `${this.apiConfig.loginServiceUrl}/profile`;
  }

  /**
   * Navega a una categoría específica
   */
  navigateToCategory(categoryId: number): void {
    this.router.navigate(['/s'], {
      queryParams: { filter_category: categoryId }
    });
  }

  /**
   * Navega a una ruta con query params
   */
  navigateTo(route: string, queryParams: Record<string, unknown>): void {
    this.router.navigate([route], { queryParams });
  }

  /**
   * Abre el drawer móvil
   */
  openMobileDrawer(): void {
    this.isMobileDrawerOpen.set(true);
    this.mobileDrawer?.open();
  }

  /**
   * Cierra el drawer móvil
   */
  closeMobileDrawer(): void {
    this.isMobileDrawerOpen.set(false);
    this.mobileDrawer?.close();
  }

  /**
   * Toggle del drawer móvil
   */
  toggleMobileDrawer(): void {
    if (this.isMobileDrawerOpen()) {
      this.closeMobileDrawer();
    } else {
      this.openMobileDrawer();
    }
  }

  /**
   * Navega a una categoría y cierra el drawer
   */
  navigateToCategoryAndClose(categoryId: number): void {
    this.closeMobileDrawer();
    this.navigateToCategory(categoryId);
  }

  /**
   * Navega a una ruta y cierra el drawer
   */
  navigateToAndClose(route: string, queryParams: Record<string, unknown>): void {
    this.closeMobileDrawer();
    this.navigateTo(route, queryParams);
  }

  /**
   * Va al perfil y cierra el drawer
   */
  goToProfileAndClose(): void {
    this.closeMobileDrawer();
    this.goToProfile();
  }

  /**
   * Logout y cierra el drawer
   */
  logoutAndClose(): void {
    this.closeMobileDrawer();
    this.authService.logout();
  }

  /**
   * Cambia el idioma de la aplicación
   */
  setLanguage(language: Language): void {
    this.languageService.setLanguage(language);
  }
}
