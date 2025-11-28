import { Component, signal, inject, computed } from '@angular/core';
import { RouterOutlet, RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatMenuModule } from '@angular/material/menu';
import { TranslateModule } from '@ngx-translate/core';
import { ThemeService, type ThemeMode } from '../../core/services/theme.service';
import { AuthService } from '../../core/services/auth.service';
import { CartService } from '../../core/services/cart.service';
import { LanguageSwitcher } from '../../shared/components/language-switcher/language-switcher';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    FormsModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatBadgeModule,
    MatInputModule,
    MatFormFieldModule,
    MatMenuModule,
    TranslateModule,
    LanguageSwitcher
  ],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss'
})
export class MainLayoutComponent {
  readonly themeService = inject(ThemeService);
  readonly authService = inject(AuthService);
  readonly cartService = inject(CartService);
  private readonly router = inject(Router);
  readonly searchQuery = signal('');

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

  onSearch(): void {
    const query = this.searchQuery().trim();
    if (query) {
      this.router.navigate(['/s'], {
        queryParams: { k: query }
      });
    }
  }

  setTheme(mode: ThemeMode): void {
    this.themeService.setThemeMode(mode);
  }
}
