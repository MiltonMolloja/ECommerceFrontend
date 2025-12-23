/**
 * Configuración de environment para desarrollo
 * En runtime, las URLs se pueden sobrescribir desde window.__env (inyectado por Docker)
 */

// Declaración de tipo para window.__env
declare global {
  interface Window {
    __env?: Record<string, string>;
  }
}

// Helper para obtener valores desde window.__env con fallback
const getEnvValue = (key: string, fallback: string): string => {
  if (typeof window !== 'undefined' && window.__env) {
    return window.__env[key] || fallback;
  }
  return fallback;
};

export const environment = {
  production: false,
  get apiGatewayUrl(): string {
    return getEnvValue('apiGatewayUrl', 'http://localhost:45000');
  },
  get identityUrl(): string {
    return getEnvValue('identityUrl', 'http://localhost:10000');
  },
  get loginServiceUrl(): string {
    return getEnvValue('loginServiceUrl', 'https://localhost:4400');
  },
  tokenKey: 'ecommerce_access_token',
  refreshTokenKey: 'ecommerce_refresh_token',
  tokenExpirationKey: 'ecommerce_token_expiration',
  mercadoPagoPublicKey: 'APP_USR-8ca245f1-7586-4db6-ba30-93c030fb147a',

  // Sentry configuration (disabled in development)
  sentry: {
    dsn: '', // Empty in dev - no tracking
    enabled: false
  },

  // Feature flags
  features: {
    useAdvancedSearch: true,
    enableReviews: true,
    enableInfiniteScroll: true
  }
};
