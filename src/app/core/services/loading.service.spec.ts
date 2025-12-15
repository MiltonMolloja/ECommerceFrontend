import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { LoadingService } from './loading.service';

describe('LoadingService', () => {
  let service: LoadingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LoadingService);
    // Reset state before each test
    service.reset();
  });

  describe('Basic Loading State', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('should start with isLoading false', () => {
      expect(service.isLoading()).toBeFalse();
    });

    it('should start with activeRequests at 0', () => {
      expect(service.activeRequests()).toBe(0);
    });

    it('should set isLoading to true when show() is called', () => {
      service.show();
      expect(service.isLoading()).toBeTrue();
    });

    it('should set isLoading to false when hide() is called after show()', () => {
      service.show();
      service.hide();
      expect(service.isLoading()).toBeFalse();
    });

    it('should increment activeRequests when show() is called', () => {
      service.show();
      expect(service.activeRequests()).toBe(1);
      service.show();
      expect(service.activeRequests()).toBe(2);
    });

    it('should decrement activeRequests when hide() is called', () => {
      service.show();
      service.show();
      expect(service.activeRequests()).toBe(2);
      service.hide();
      expect(service.activeRequests()).toBe(1);
      service.hide();
      expect(service.activeRequests()).toBe(0);
    });

    it('should not go below 0 activeRequests', () => {
      service.hide();
      service.hide();
      expect(service.activeRequests()).toBe(0);
      expect(service.isLoading()).toBeFalse();
    });
  });

  describe('Concurrent Requests', () => {
    it('should handle multiple concurrent requests', () => {
      service.show();
      service.show();
      service.show();
      expect(service.activeRequests()).toBe(3);
      expect(service.isLoading()).toBeTrue();

      service.hide();
      expect(service.activeRequests()).toBe(2);
      expect(service.isLoading()).toBeTrue();

      service.hide();
      service.hide();
      expect(service.activeRequests()).toBe(0);
      expect(service.isLoading()).toBeFalse();
    });

    it('should remain loading until all requests complete', () => {
      service.show();
      service.show();

      service.hide();
      expect(service.isLoading()).toBeTrue();

      service.hide();
      expect(service.isLoading()).toBeFalse();
    });
  });

  describe('Context-based Loading', () => {
    it('should track loading by context', () => {
      service.show('cart');
      expect(service.isContextLoading('cart')).toBeTrue();
      expect(service.isContextLoading('checkout')).toBeFalse();
    });

    it('should handle multiple contexts independently', () => {
      service.show('cart');
      service.show('checkout');

      expect(service.isContextLoading('cart')).toBeTrue();
      expect(service.isContextLoading('checkout')).toBeTrue();

      service.hide('cart');
      expect(service.isContextLoading('cart')).toBeFalse();
      expect(service.isContextLoading('checkout')).toBeTrue();
    });

    it('should track global loading with contexts', () => {
      service.show('cart');
      service.show('checkout');
      expect(service.activeRequests()).toBe(2);
      expect(service.isLoading()).toBeTrue();
    });

    it('should handle multiple requests for same context', () => {
      service.show('cart');
      service.show('cart');
      expect(service.isContextLoading('cart')).toBeTrue();

      service.hide('cart');
      expect(service.isContextLoading('cart')).toBeTrue(); // Still one request

      service.hide('cart');
      expect(service.isContextLoading('cart')).toBeFalse();
    });

    it('should return computed signal for context loading', () => {
      const cartLoading = service.getContextLoadingSignal('cart');
      expect(cartLoading()).toBeFalse();

      service.show('cart');
      expect(cartLoading()).toBeTrue();

      service.hide('cart');
      expect(cartLoading()).toBeFalse();
    });
  });

  describe('Reset Functionality', () => {
    it('should reset all loading state', () => {
      service.show('cart');
      service.show('checkout');
      service.show();

      service.reset();

      expect(service.isLoading()).toBeFalse();
      expect(service.activeRequests()).toBe(0);
      expect(service.isContextLoading('cart')).toBeFalse();
      expect(service.isContextLoading('checkout')).toBeFalse();
    });
  });

  describe('withLoading Wrapper', () => {
    it('should show loading during async operation', async () => {
      let loadingDuringOperation = false;

      await service.withLoading(async () => {
        loadingDuringOperation = service.isLoading();
        return 'result';
      });

      expect(loadingDuringOperation).toBeTrue();
      expect(service.isLoading()).toBeFalse();
    });

    it('should return the result of the async operation', async () => {
      const result = await service.withLoading(async () => {
        return 'test result';
      });

      expect(result).toBe('test result');
    });

    it('should hide loading even if operation throws', async () => {
      try {
        await service.withLoading(async () => {
          throw new Error('Test error');
        });
      } catch {
        // Expected error
      }

      expect(service.isLoading()).toBeFalse();
    });

    it('should use context when provided', async () => {
      let contextLoadingDuringOperation = false;

      await service.withLoading(async () => {
        contextLoadingDuringOperation = service.isContextLoading('test-context');
        return 'result';
      }, 'test-context');

      expect(contextLoadingDuringOperation).toBeTrue();
      expect(service.isContextLoading('test-context')).toBeFalse();
    });
  });

  describe('Safety Timeout', () => {
    it('should clear context loading after safety timeout', fakeAsync(() => {
      service.show('long-running');
      expect(service.isContextLoading('long-running')).toBeTrue();

      // Advance time past the safety timeout (30 seconds)
      tick(31000);

      expect(service.isContextLoading('long-running')).toBeFalse();
    }));

    it('should not trigger timeout if hide is called before timeout', fakeAsync(() => {
      service.show('quick-operation');
      expect(service.isContextLoading('quick-operation')).toBeTrue();

      // Hide before timeout
      tick(1000);
      service.hide('quick-operation');

      // Advance past timeout
      tick(30000);

      // Should still be false (not affected by timeout)
      expect(service.isContextLoading('quick-operation')).toBeFalse();
      expect(service.activeRequests()).toBe(0);
    }));

    it('should handle multiple contexts with timeouts independently', fakeAsync(() => {
      service.show('context1');
      tick(10000);
      service.show('context2');

      // context1 should timeout first
      tick(21000); // 31 seconds total for context1
      expect(service.isContextLoading('context1')).toBeFalse();
      expect(service.isContextLoading('context2')).toBeTrue();

      // context2 should timeout after
      tick(10000); // 31 seconds total for context2
      expect(service.isContextLoading('context2')).toBeFalse();
    }));
  });

  describe('Edge Cases', () => {
    it('should handle rapid show/hide calls', () => {
      for (let i = 0; i < 100; i++) {
        service.show();
      }
      expect(service.activeRequests()).toBe(100);

      for (let i = 0; i < 100; i++) {
        service.hide();
      }
      expect(service.activeRequests()).toBe(0);
      expect(service.isLoading()).toBeFalse();
    });

    it('should handle show without context followed by hide with context', () => {
      service.show();
      service.hide('nonexistent-context');

      // hide() with context still decrements global counter
      // This is the actual behavior - hide always decrements global
      expect(service.activeRequests()).toBe(0);
      expect(service.isLoading()).toBeFalse();
    });

    it('should handle empty string context as truthy context', () => {
      // Empty string is falsy in JS, so it won't be tracked as context
      service.show('');
      // Empty string is falsy, so no context tracking
      expect(service.isContextLoading('')).toBeFalse();
      // But global counter is still incremented
      expect(service.activeRequests()).toBe(1);
      service.hide('');
      expect(service.activeRequests()).toBe(0);
    });
  });
});
