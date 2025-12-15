import { Injectable, signal, computed } from '@angular/core';

export interface CartItem {
  productId: string;
  // name se obtiene dinámicamente del backend según idioma
  price: number;
  currency: string;
  quantity: number;
  imageUrl: string;
  brand?: string | undefined;
  inStock: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private readonly STORAGE_KEY = 'shopping-cart';

  // Signal con los items del carrito
  private cartItems = signal<CartItem[]>(this.loadCartFromStorage());

  // Computed signals
  readonly items = computed(() => this.cartItems());
  readonly itemCount = computed(() =>
    this.cartItems().reduce((total, item) => total + item.quantity, 0)
  );
  readonly totalAmount = computed(() =>
    this.cartItems().reduce((total, item) => total + item.price * item.quantity, 0)
  );

  constructor() {
    // Sincronizar cambios con localStorage
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', this.handleStorageChange.bind(this));
    }
  }

  /**
   * Agregar un producto al carrito
   */
  addToCart(product: {
    id: string;
    price: number;
    currency: string;
    imageUrl: string;
    brand?: string;
    inStock: boolean;
  }): void {
    const currentItems = this.cartItems();
    const existingItemIndex = currentItems.findIndex((item) => item.productId === product.id);

    let updatedItems: CartItem[];

    if (existingItemIndex > -1) {
      // Si el producto ya existe, incrementar cantidad
      updatedItems = currentItems.map((item, index) =>
        index === existingItemIndex ? { ...item, quantity: item.quantity + 1 } : item
      );
    } else {
      // Si es nuevo, agregarlo (sin nombre, se obtiene dinámicamente)
      const newItem: CartItem = {
        productId: product.id,
        price: product.price,
        currency: product.currency,
        quantity: 1,
        imageUrl: product.imageUrl,
        brand: product.brand,
        inStock: product.inStock
      };
      updatedItems = [...currentItems, newItem];
    }

    this.cartItems.set(updatedItems);
    this.saveCartToStorage(updatedItems);
  }

  /**
   * Remover un producto del carrito
   */
  removeFromCart(productId: string): void {
    const updatedItems = this.cartItems().filter((item) => item.productId !== productId);
    this.cartItems.set(updatedItems);
    this.saveCartToStorage(updatedItems);
  }

  /**
   * Actualizar la cantidad de un producto
   */
  updateQuantity(productId: string, quantity: number): void {
    if (quantity <= 0) {
      this.removeFromCart(productId);
      return;
    }

    const updatedItems = this.cartItems().map((item) =>
      item.productId === productId ? { ...item, quantity } : item
    );

    this.cartItems.set(updatedItems);
    this.saveCartToStorage(updatedItems);
  }

  /**
   * Limpiar todo el carrito
   */
  clearCart(): void {
    this.cartItems.set([]);
    this.saveCartToStorage([]);
  }

  /**
   * Verificar si un producto está en el carrito
   */
  isInCart(productId: string): boolean {
    return this.cartItems().some((item) => item.productId === productId);
  }

  /**
   * Obtener la cantidad de un producto en el carrito
   */
  getQuantity(productId: string): number {
    const item = this.cartItems().find((item) => item.productId === productId);
    return item ? item.quantity : 0;
  }

  /**
   * Cargar el carrito desde localStorage
   */
  private loadCartFromStorage(): CartItem[] {
    if (typeof window === 'undefined') {
      return [];
    }

    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // Ignore parse errors
    }

    return [];
  }

  /**
   * Guardar el carrito en localStorage
   */
  private saveCartToStorage(items: CartItem[]): void {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Ignore storage errors
    }
  }

  /**
   * Manejar cambios de storage desde otras pestañas
   */
  private handleStorageChange(event: StorageEvent): void {
    if (event.key === this.STORAGE_KEY && event.newValue) {
      try {
        const newItems = JSON.parse(event.newValue);
        this.cartItems.set(newItems);
      } catch {
        // Ignore parse errors
      }
    }
  }
}
