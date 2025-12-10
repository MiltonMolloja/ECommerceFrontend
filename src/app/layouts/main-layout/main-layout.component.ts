import { Component, inject, computed } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';
import { TranslateModule } from '@ngx-translate/core';
import { ThemeService, type ThemeMode } from '../../core/services/theme.service';
import { AuthService } from '../../core/services/auth.service';
import { CartService } from '../../core/services/cart.service';
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
    TranslateModule,
    LanguageSwitcher,
    SearchBarComponent
  ],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss'
})
export class MainLayoutComponent {
  readonly themeService = inject(ThemeService);
  readonly authService = inject(AuthService);
  readonly cartService = inject(CartService);

  // Computed signal para el contador del carrito
  readonly cartItemCount = computed(() => this.cartService.itemCount());

  // Computed signal for user's first name
  readonly userFirstName = computed(() => {
    const user = this.authService.currentUser();
    return user?.firstName || 'Usuario';
  });

  readonly categories = [
    { label: 'Todo', route: '/catalog' },
    { label: 'Ofertas del Día', route: '/deals' },
    { label: 'Servicio al Cliente', route: '/support' },
    { label: 'Registros', route: '/orders' },
    { label: 'Tarjetas de Regalo', route: '/gift-cards' },
    { label: 'Vender', route: '/sell' }
  ];

  setTheme(mode: ThemeMode): void {
    this.themeService.setThemeMode(mode);
  }
}
