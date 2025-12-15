import { Component, inject, computed, OnInit } from '@angular/core';
import { Router, RouterOutlet, RouterLink } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { TranslateModule } from '@ngx-translate/core';
import { ThemeService, type ThemeMode } from '../../core/services/theme.service';
import { AuthService } from '../../core/services/auth.service';
import { CartService } from '../../core/services/cart.service';
import { CategoriesService } from '../../core/services/categories';
import { LanguageSwitcher } from '../../shared/components/language-switcher/language-switcher';
import { SearchBarComponent } from '../../shared/components/search-bar/search-bar.component';

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
  private router = inject(Router);

  // Computed signal para el contador del carrito
  readonly cartItemCount = computed(() => this.cartService.itemCount());

  // Computed signal for user's first name
  readonly userFirstName = computed(() => {
    const user = this.authService.currentUser();
    return user?.firstName || '';
  });

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
    window.location.href = 'https://localhost:4400/profile';
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
}
