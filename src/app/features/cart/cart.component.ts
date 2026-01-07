import { Component, inject, computed, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CartService, CartItem } from '../../core/services/cart.service';
import { AuthService } from '../../core/services/auth.service';
import { ProductService, ProductBasicInfo } from '../../core/services/product.service';
import { LanguageService } from '../../core/services/language.service';
import { environment } from '../../../environments/environment';

export interface CartItemWithName extends CartItem {
  name: string;
}

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatDividerModule,
    MatSnackBarModule,
    TranslateModule
  ],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss']
})
export class CartComponent {
  private cartService = inject(CartService);
  private productService = inject(ProductService);
  private languageService = inject(LanguageService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private authService = inject(AuthService);
  private translate = inject(TranslateService);

  // Signal para productos con nombres traducidos
  private productNames = signal<Map<string, ProductBasicInfo>>(new Map());
  private initialLoadComplete = false;

  // Signals del carrito
  private cartItems = computed(() => this.cartService.items());
  itemCount = computed(() => this.cartService.itemCount());
  totalAmount = computed(() => this.cartService.totalAmount());

  // Items con nombres traducidos
  items = computed(() => {
    const items = this.cartItems();
    const names = this.productNames();

    return items.map((item) => ({
      ...item,
      name: names.get(item.productId)?.name || 'Cargando...'
    })) as CartItemWithName[];
  });

  isEmpty = computed(() => this.items().length === 0);

  constructor() {
    // Cargar nombres de productos al iniciar
    this.loadProductNames();

    // Recargar nombres cuando cambia el idioma
    effect(() => {
      const langChangeCount = this.languageService.languageChanged();
      if (this.initialLoadComplete && langChangeCount > 0) {
        this.loadProductNames();
      }
    });

    // Recargar nombres cuando cambian los items del carrito
    effect(() => {
      const items = this.cartItems();
      if (this.initialLoadComplete && items.length > 0) {
        this.loadProductNames();
      }
    });
  }

  /**
   * Cargar nombres de productos desde el backend
   */
  private loadProductNames(): void {
    const items = this.cartItems();
    if (items.length === 0) {
      this.productNames.set(new Map());
      this.initialLoadComplete = true;
      return;
    }

    const productIds = items.map((item) => item.productId);

    this.productService.getProductsBasicInfo(productIds).subscribe({
      next: (names) => {
        this.productNames.set(names);
        this.initialLoadComplete = true;
      },
      error: (error) => {
        console.error('Error cargando nombres de productos:', error);
        this.initialLoadComplete = true;
      }
    });
  }

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
    const message = this.translate.instant('CART.ITEM_REMOVED', { name: productName });
    const action = this.translate.instant('CART.UNDO');

    this.snackBar
      .open(message, action, {
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
    const confirmMessage = this.translate.instant('CART.CONFIRM_CLEAR');
    if (confirm(confirmMessage)) {
      this.cartService.clearCart();
      const message = this.translate.instant('CART.CART_CLEARED');
      this.snackBar.open(message, '', {
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
      const message = this.translate.instant('CART.LOGIN_REQUIRED');
      this.snackBar.open(message, '', {
        duration: 4000,
        horizontalPosition: 'end',
        verticalPosition: 'bottom'
      });

      // Redirigir al servicio de autenticación externo
      // loginServiceUrl ya incluye /auth, solo agregamos /login
      const baseUrl = window.location.origin;
      const returnUrl = '/checkout';
      const callbackUrl = `${baseUrl}/login-callback?next=${encodeURIComponent(returnUrl)}`;
      window.location.href = `${environment.loginServiceUrl}/login?returnUrl=${encodeURIComponent(callbackUrl)}`;
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
