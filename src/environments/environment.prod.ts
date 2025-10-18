/**
 * Configuración de environment para producción
 */
export const environment = {
  production: true,
  apiGatewayUrl: 'https://api.ecommerce.com',
  identityUrl: 'https://identity.ecommerce.com',
  tokenKey: 'ecommerce_access_token',
  refreshTokenKey: 'ecommerce_refresh_token',
  tokenExpirationKey: 'ecommerce_token_expiration'
};
