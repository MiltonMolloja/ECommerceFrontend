import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

/**
 * Security Service
 * Handles secure cookie management and security utilities
 */
@Injectable({
  providedIn: 'root'
})
export class SecurityService {
  private readonly platformId = inject(PLATFORM_ID);

  /**
   * Set a secure cookie
   * @param name Cookie name
   * @param value Cookie value
   * @param days Days until expiration (default 7)
   * @param secure Use Secure flag (default true in production)
   */
  setCookie(name: string, value: string, days = 7, secure = true): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    const expires = `expires=${date.toUTCString()}`;

    // Security flags
    // Note: HttpOnly cannot be set from JavaScript - must be set by server
    const secureFlag = secure ? '; Secure' : '';
    const sameSite = '; SameSite=Strict';

    document.cookie = `${name}=${encodeURIComponent(value)}; ${expires}; path=/${secureFlag}${sameSite}`;
  }

  /**
   * Get a cookie value
   * @param name Cookie name
   * @returns Cookie value or null
   */
  getCookie(name: string): string | null {
    if (!isPlatformBrowser(this.platformId)) return null;

    const nameEQ = `${name}=`;
    const cookies = document.cookie.split(';');

    for (const cookie of cookies) {
      const c = cookie.trim();
      if (c.indexOf(nameEQ) === 0) {
        return decodeURIComponent(c.substring(nameEQ.length));
      }
    }
    return null;
  }

  /**
   * Delete a cookie
   * @param name Cookie name
   */
  deleteCookie(name: string): void {
    if (!isPlatformBrowser(this.platformId)) return;

    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; Secure; SameSite=Strict`;
  }

  /**
   * Clear all cookies (for logout)
   */
  clearAllCookies(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const name = cookie.split('=')[0]?.trim();
      if (name) {
        this.deleteCookie(name);
      }
    }
  }

  /**
   * Sanitize user input to prevent XSS
   * @param input User input string
   * @returns Sanitized string
   */
  sanitizeInput(input: string): string {
    const div = document.createElement('div');
    div.textContent = input;
    return div.innerHTML;
  }

  /**
   * Validate URL to prevent open redirect attacks
   * @param url URL to validate
   * @param allowedDomains List of allowed domains
   * @returns true if URL is safe
   */
  isValidRedirectUrl(url: string, allowedDomains: string[] = []): boolean {
    // Allow relative URLs
    if (url.startsWith('/') && !url.startsWith('//')) {
      return true;
    }

    try {
      const parsedUrl = new URL(url);
      const currentHost = window.location.host;

      // Allow same origin
      if (parsedUrl.host === currentHost) {
        return true;
      }

      // Check against allowed domains
      return allowedDomains.some(
        (domain) => parsedUrl.host === domain || parsedUrl.host.endsWith(`.${domain}`)
      );
    } catch {
      return false;
    }
  }

  /**
   * Generate a random token for CSRF protection
   * @param length Token length (default 32)
   * @returns Random token string
   */
  generateToken(length = 32): string {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Check if the current connection is secure (HTTPS)
   * @returns true if using HTTPS
   */
  isSecureConnection(): boolean {
    if (!isPlatformBrowser(this.platformId)) return true;
    return window.location.protocol === 'https:';
  }

  /**
   * Detect if running in an iframe (clickjacking protection)
   * @returns true if in iframe
   */
  isInIframe(): boolean {
    if (!isPlatformBrowser(this.platformId)) return false;
    try {
      return window.self !== window.top;
    } catch {
      return true; // If we can't access window.top, we're likely in a cross-origin iframe
    }
  }
}
