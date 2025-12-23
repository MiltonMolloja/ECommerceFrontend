/**
 * Configuración de environment para producción
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
  production: true,
  get apiGatewayUrl(): string {
    return getEnvValue('apiGatewayUrl', 'https://api.ecommerce.com');
  },
  get identityUrl(): string {
    return getEnvValue('identityUrl', 'https://identity.ecommerce.com');
  },
  get loginServiceUrl(): string {
    return getEnvValue('loginServiceUrl', 'https://login.ecommerce.com');
  },
  tokenKey: 'ecommerce_access_token',
  refreshTokenKey: 'ecommerce_refresh_token',
  tokenExpirationKey: 'ecommerce_token_expiration',
  mercadoPagoPublicKey: 'APP-your-production-public-key-here',

  // Sentry configuration for production
  sentry: {
    dsn: 'https://your-sentry-dsn@sentry.io/project-id', // Replace with actual Sentry DSN
    enabled: true
  },

  // Feature flags
  features: {
    useAdvancedSearch: true,
    enableReviews: true,
    enableInfiniteScroll: true
  }
};
