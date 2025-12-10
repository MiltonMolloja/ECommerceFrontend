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
  mercadoPagoPublicKey: 'APP-your-production-public-key-here', // Replace with actual MercadoPago production public key

  // Feature flags
  features: {
    useAdvancedSearch: false, // Desactivado en producción inicialmente
    enableReviews: false,
    enableInfiniteScroll: true
  }
};
