import { Component, signal } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatMenuModule } from '@angular/material/menu';

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
    MatMenuModule
  ],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss'
})
export class MainLayoutComponent {
  readonly cartItemCount = signal(3);
  readonly searchQuery = signal('');

  readonly categories = [
    { label: 'Todo', route: '/catalog' },
    { label: 'Ofertas del Día', route: '/deals' },
    { label: 'Servicio al Cliente', route: '/support' },
    { label: 'Registros', route: '/orders' },
    { label: 'Tarjetas de Regalo', route: '/gift-cards' },
    { label: 'Vender', route: '/sell' }
  ];

  onSearch(): void {
    console.log('Searching for:', this.searchQuery());
  }
}
