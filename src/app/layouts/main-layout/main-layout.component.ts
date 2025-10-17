import { Component, signal, computed, inject } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatBadgeModule } from '@angular/material/badge';
import { BreakpointService } from '../../core/services/breakpoint.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatSidenavModule,
    MatListModule,
    MatBadgeModule
  ],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss'
})
export class MainLayoutComponent {
  private breakpointSvc = inject(BreakpointService);

  readonly breakpointService = signal(this.breakpointSvc).asReadonly();
  readonly sidenavOpened = signal(false);
  readonly cartItemCount = signal(3); // Mock, luego conectar con servicio real

  // Computed para saber si el sidenav debe estar en modo 'over' o 'side'
  readonly sidenavMode = computed(() => (this.breakpointService().isMobile() ? 'over' : 'side'));

  // Computed para determinar si el sidenav se cierra automáticamente al hacer clic
  readonly autoCloseSidenav = computed(() => this.breakpointService().isMobile());

  readonly navItems = [
    { label: 'Inicio', route: '/', icon: 'home' },
    { label: 'Catálogo', route: '/catalog', icon: 'store' },
    { label: 'Carrito', route: '/cart', icon: 'shopping_cart', badge: this.cartItemCount }
  ];

  toggleSidenav(): void {
    this.sidenavOpened.update((value) => !value);
  }

  closeSidenavIfMobile(): void {
    if (this.autoCloseSidenav()) {
      this.sidenavOpened.set(false);
    }
  }
}
