import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CartService } from '../../core/services/cart.service';
import { AuthService } from '../../core/services/auth.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatDividerModule,
    MatSnackBarModule
  ],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss']
})
export class CartComponent {
  private cartService = inject(CartService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private authService = inject(AuthService);

  // Signals del carrito
  items = computed(() => this.cartService.items());
  itemCount = computed(() => this.cartService.itemCount());
  totalAmount = computed(() => this.cartService.totalAmount());
  isEmpty = computed(() => this.items().length === 0);

  /**
   * Incrementar cantidad de un producto
   */
  incrementQuantity(productId: string): void {
    const currentQuantity = this.cartService.getQuantity(productId);
    this.cartService.updateQuantity(productId, currentQuantity + 1);
  }

  /**
   * Decrementar cantidad de un producto
   */
  decrementQuantity(productId: string): void {
    const currentQuantity = this.cartService.getQuantity(productId);
    if (currentQuantity > 1) {
      this.cartService.updateQuantity(productId, currentQuantity - 1);
    }
  }

  /**
   * Remover un producto del carrito
   */
  removeItem(productId: string, productName: string): void {
    this.cartService.removeFromCart(productId);
    this.snackBar
      .open(`"${productName}" removido del carrito`, 'Deshacer', {
        duration: 3000,
        horizontalPosition: 'end',
        verticalPosition: 'bottom'
      })
      .onAction()
      .subscribe(() => {
        // TODO: Implementar deshacer

      });
  }

  /**
   * Limpiar todo el carrito
   */
  clearCart(): void {
    if (confirm('¿Estás seguro de que deseas vaciar el carrito?')) {
      this.cartService.clearCart();
      this.snackBar.open('Carrito vaciado', '', {
        duration: 2000,
        horizontalPosition: 'end',
        verticalPosition: 'bottom'
      });
    }
  }

  /**
   * Continuar comprando
   */
  continueShopping(): void {
    this.router.navigate(['/']);
  }

  /**
   * Proceder al checkout
   */
  proceedToCheckout(): void {
    // Verificar autenticación antes de proceder al checkout
    if (!this.authService.isAuthenticated()) {
      this.snackBar.open('Debe iniciar sesión para proceder al pago', '', {
        duration: 4000,
        horizontalPosition: 'end',
        verticalPosition: 'bottom'
      });

      // Redirigir al servicio de autenticación externo
      const baseUrl = window.location.origin;
      const returnUrl = '/checkout';
      const callbackUrl = `${baseUrl}/auth/callback?next=${encodeURIComponent(returnUrl)}`;
      window.location.href = `${environment.loginServiceUrl}/auth/login?returnUrl=${encodeURIComponent(callbackUrl)}`;
      return;
    }

    // Si está autenticado, proceder al checkout
    this.router.navigate(['/checkout']);
  }

  /**
   * Calcular subtotal de un item
   */
  getItemSubtotal(price: number, quantity: number): number {
    return price * quantity;
  }
}
