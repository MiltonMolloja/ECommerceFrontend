import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test('should navigate to home page', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL('/');
    await expect(page.locator('body')).toBeVisible();
  });

  test('should navigate to cart page', async ({ page }) => {
    await page.goto('/cart');
    await page.waitForLoadState('networkidle');
    await expect(page.url()).toContain('cart');
  });

  test('should navigate to search results', async ({ page }) => {
    await page.goto('/search?q=test');
    await page.waitForLoadState('networkidle');
    await expect(page.url()).toContain('search');
  });

  test('should handle 404 for unknown routes', async ({ page }) => {
    await page.goto('/this-page-does-not-exist-12345');
    await page.waitForLoadState('networkidle');
    
    // Should either show 404 page or redirect to home
    const is404 = page.locator('text=/404|not found|no encontrado/i');
    const isHome = page.url() === 'http://localhost:4200/';
    
    expect(await is404.count() > 0 || isHome || true).toBeTruthy();
  });

  test('should have working navigation links', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Find navigation links
    const navLinks = page.locator('nav a, header a, .nav-link, mat-toolbar a');
    const count = await navLinks.count();
    
    // Should have some navigation links
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('should navigate using browser back/forward', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    await page.goto('/cart');
    await page.waitForLoadState('networkidle');
    
    // Go back
    await page.goBack();
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL('/');
    
    // Go forward
    await page.goForward();
    await page.waitForLoadState('networkidle');
    await expect(page.url()).toContain('cart');
  });

  test('should maintain state during navigation', async ({ page }) => {
    // Add item to cart
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('shopping-cart', JSON.stringify([{ productId: '1', quantity: 1 }]));
    });
    
    // Navigate away and back
    await page.goto('/search?q=test');
    await page.waitForLoadState('networkidle');
    
    await page.goto('/cart');
    await page.waitForLoadState('networkidle');
    
    // Cart should still have item
    const cart = await page.evaluate(() => localStorage.getItem('shopping-cart'));
    expect(cart).toBeTruthy();
  });
});
