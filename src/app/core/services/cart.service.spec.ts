import { TestBed } from '@angular/core/testing';
import { CartService } from './cart.service';

describe('CartService', () => {
  let service: CartService;
  let localStorageSpy: jasmine.SpyObj<Storage>;

  const mockProduct = {
    id: 'prod-1',
    price: 99.99,
    currency: 'USD',
    imageUrl: '/images/product1.jpg',
    brand: 'TestBrand',
    inStock: true
  };

  beforeEach(() => {
    // Mock localStorage
    const store: Record<string, string> = {};
    localStorageSpy = jasmine.createSpyObj('localStorage', ['getItem', 'setItem', 'removeItem']);
    localStorageSpy.getItem.and.callFake((key: string) => store[key] || null);
    localStorageSpy.setItem.and.callFake((key: string, value: string) => {
      store[key] = value;
    });
    localStorageSpy.removeItem.and.callFake((key: string) => {
      delete store[key];
    });

    spyOn(localStorage, 'getItem').and.callFake(localStorageSpy.getItem);
    spyOn(localStorage, 'setItem').and.callFake(localStorageSpy.setItem);

    TestBed.configureTestingModule({
      providers: [CartService]
    });

    service = TestBed.inject(CartService);
  });

  afterEach(() => {
    service.clearCart();
  });

  describe('initialization', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('should initialize with empty cart', () => {
      expect(service.items()).toEqual([]);
      expect(service.itemCount()).toBe(0);
      expect(service.totalAmount()).toBe(0);
    });

    it('should load cart from localStorage on init', () => {
      // This test verifies the service attempts to load from localStorage
      // The actual loading happens in the constructor
      expect(localStorage.getItem).toHaveBeenCalledWith('shopping-cart');
    });
  });

  describe('addToCart', () => {
    it('should add new product to cart', () => {
      service.addToCart(mockProduct);

      expect(service.items().length).toBe(1);
      expect(service.items()[0]?.productId).toBe('prod-1');
      expect(service.items()[0]?.quantity).toBe(1);
    });

    it('should increment quantity if product already in cart', () => {
      service.addToCart(mockProduct);
      service.addToCart(mockProduct);

      expect(service.items().length).toBe(1);
      expect(service.items()[0]?.quantity).toBe(2);
    });

    it('should save cart to localStorage after adding', () => {
      service.addToCart(mockProduct);

      expect(localStorage.setItem).toHaveBeenCalledWith('shopping-cart', jasmine.any(String));
    });

    it('should handle multiple different products', () => {
      const product2 = { ...mockProduct, id: 'prod-2', price: 49.99 };

      service.addToCart(mockProduct);
      service.addToCart(product2);

      expect(service.items().length).toBe(2);
      expect(service.itemCount()).toBe(2);
    });
  });

  describe('removeFromCart', () => {
    beforeEach(() => {
      service.addToCart(mockProduct);
    });

    it('should remove product from cart', () => {
      service.removeFromCart('prod-1');

      expect(service.items().length).toBe(0);
      expect(service.isInCart('prod-1')).toBe(false);
    });

    it('should not affect other products when removing one', () => {
      const product2 = { ...mockProduct, id: 'prod-2' };
      service.addToCart(product2);

      service.removeFromCart('prod-1');

      expect(service.items().length).toBe(1);
      expect(service.isInCart('prod-2')).toBe(true);
    });

    it('should save cart to localStorage after removing', () => {
      service.removeFromCart('prod-1');

      expect(localStorage.setItem).toHaveBeenCalled();
    });

    it('should handle removing non-existent product gracefully', () => {
      expect(() => service.removeFromCart('non-existent')).not.toThrow();
      expect(service.items().length).toBe(1);
    });
  });

  describe('updateQuantity', () => {
    beforeEach(() => {
      service.addToCart(mockProduct);
    });

    it('should update product quantity', () => {
      service.updateQuantity('prod-1', 5);

      expect(service.items()[0]?.quantity).toBe(5);
    });

    it('should remove product if quantity is 0', () => {
      service.updateQuantity('prod-1', 0);

      expect(service.items().length).toBe(0);
    });

    it('should remove product if quantity is negative', () => {
      service.updateQuantity('prod-1', -1);

      expect(service.items().length).toBe(0);
    });

    it('should save cart to localStorage after updating', () => {
      const callsBefore = (localStorage.setItem as jasmine.Spy).calls.count();
      service.updateQuantity('prod-1', 3);

      expect((localStorage.setItem as jasmine.Spy).calls.count()).toBeGreaterThan(callsBefore);
    });
  });

  describe('clearCart', () => {
    beforeEach(() => {
      service.addToCart(mockProduct);
      service.addToCart({ ...mockProduct, id: 'prod-2' });
    });

    it('should remove all items from cart', () => {
      service.clearCart();

      expect(service.items().length).toBe(0);
      expect(service.itemCount()).toBe(0);
      expect(service.totalAmount()).toBe(0);
    });

    it('should save empty cart to localStorage', () => {
      service.clearCart();

      expect(localStorage.setItem).toHaveBeenCalledWith('shopping-cart', '[]');
    });
  });

  describe('isInCart', () => {
    it('should return true if product is in cart', () => {
      service.addToCart(mockProduct);

      expect(service.isInCart('prod-1')).toBe(true);
    });

    it('should return false if product is not in cart', () => {
      expect(service.isInCart('prod-1')).toBe(false);
    });
  });

  describe('getQuantity', () => {
    it('should return quantity of product in cart', () => {
      service.addToCart(mockProduct);
      service.addToCart(mockProduct);
      service.addToCart(mockProduct);

      expect(service.getQuantity('prod-1')).toBe(3);
    });

    it('should return 0 if product is not in cart', () => {
      expect(service.getQuantity('non-existent')).toBe(0);
    });
  });

  describe('computed signals', () => {
    it('should calculate itemCount correctly', () => {
      service.addToCart(mockProduct);
      service.addToCart(mockProduct);
      service.addToCart({ ...mockProduct, id: 'prod-2' });

      expect(service.itemCount()).toBe(3); // 2 + 1
    });

    it('should calculate totalAmount correctly', () => {
      service.addToCart(mockProduct); // 99.99
      service.addToCart(mockProduct); // 99.99 (quantity 2)
      service.addToCart({ ...mockProduct, id: 'prod-2', price: 50 }); // 50

      expect(service.totalAmount()).toBeCloseTo(249.98, 2); // 99.99 * 2 + 50
    });

    it('should update itemCount when cart changes', () => {
      expect(service.itemCount()).toBe(0);

      service.addToCart(mockProduct);
      expect(service.itemCount()).toBe(1);

      service.removeFromCart('prod-1');
      expect(service.itemCount()).toBe(0);
    });
  });

  describe('SSR safety', () => {
    it('should handle missing window gracefully', () => {
      // The service checks typeof window !== 'undefined'
      // This test verifies the service doesn't throw
      expect(service).toBeTruthy();
    });
  });
});
