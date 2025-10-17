import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [MatIconModule],
  template: `
    <div style="text-align: center; padding: 48px;">
      <mat-icon style="font-size: 64px; width: 64px; height: 64px;">shopping_cart</mat-icon>
      <h2>Carrito de Compras</h2>
      <p>Esta funcionalidad estará disponible próximamente</p>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      h2 {
        margin-top: 16px;
        font-size: 24px;
        color: var(--mat-sys-on-surface);
      }
      p {
        color: var(--mat-sys-on-surface-variant);
      }
    `
  ]
})
export class CartComponent {}
