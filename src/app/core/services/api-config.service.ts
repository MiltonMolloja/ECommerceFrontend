/**
 * ApiConfigService - Configuración centralizada de URLs del API
 *
 * Lee las variables de entorno inyectadas por Docker en runtime (window.__env)
 * o usa fallbacks para desarrollo local.
 */

import { Injectable } from '@angular/core';

declare global {
  interface Window {
    __env?: Record<string, string>;
  }
}

@Injectable({ providedIn: 'root' })
export class ApiConfigService {
  private readonly config = this.loadConfig();

  private loadConfig() {
    // Intentar cargar desde window.__env (inyectado por Docker)
    if (typeof window !== 'undefined' && window.__env) {
      console.log('[ApiConfig] ✅ Using runtime environment from window.__env', window.__env);
      return {
        apiGatewayUrl: window.__env['apiGatewayUrl'] || 'http://localhost:45000',
        identityUrl: window.__env['identityUrl'] || 'http://localhost:10000',
        loginServiceUrl: window.__env['loginServiceUrl'] || 'http://localhost:4400',
        mercadoPagoPublicKey: window.__env['mercadoPagoPublicKey'] || '',
        sentryDsn: window.__env['sentryDsn'] || '',
        production: window.__env['production'] === 'true'
      };
    }

    // Fallback para desarrollo local
    console.log('[ApiConfig] ⚠️ Using fallback configuration for local development');
    return {
      apiGatewayUrl: 'http://localhost:45000',
      identityUrl: 'http://localhost:10000',
      loginServiceUrl: 'http://localhost:4400',
      mercadoPagoPublicKey: '',
      sentryDsn: '',
      production: false
    };
  }

  get apiGatewayUrl(): string {
    return this.config.apiGatewayUrl;
  }

  get identityUrl(): string {
    return this.config.identityUrl;
  }

  get loginServiceUrl(): string {
    return this.config.loginServiceUrl;
  }

  get mercadoPagoPublicKey(): string {
    return this.config.mercadoPagoPublicKey;
  }

  get sentryDsn(): string {
    return this.config.sentryDsn;
  }

  get isProduction(): boolean {
    return this.config.production;
  }

  /**
   * Obtiene la URL completa para un endpoint del API Gateway
   */
  getApiUrl(path: string): string {
    // Asegurar que el path comience con /
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    return `${this.apiGatewayUrl}${normalizedPath}`;
  }
}
