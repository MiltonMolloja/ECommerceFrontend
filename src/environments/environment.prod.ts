/**
 * Configuración de environment para producción
 */
export const environment = {
  production: true,
  apiGatewayUrl: 'https://api.ecommerce.com',
  identityUrl: 'https://identity.ecommerce.com',
  loginServiceUrl: 'https://login.ecommerce.com',
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
