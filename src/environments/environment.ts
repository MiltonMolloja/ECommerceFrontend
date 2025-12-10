/**
 * Configuración de environment para desarrollo
 */
export const environment = {
  production: false,
  apiGatewayUrl: 'http://localhost:45000',
  identityUrl: 'https://localhost:4400',
  loginServiceUrl: 'https://localhost:4400',
  tokenKey: 'ecommerce_access_token',
  refreshTokenKey: 'ecommerce_refresh_token',
  tokenExpirationKey: 'ecommerce_token_expiration',
  mercadoPagoPublicKey: 'APP_USR-8ca245f1-7586-4db6-ba30-93c030fb147a', // Replace with actual MercadoPago test public key

  // Feature flags
  features: {
    useAdvancedSearch: true, // Activar búsqueda avanzada con facetas
    enableReviews: true,
    enableInfiniteScroll: true
  }
};
