/**
 * Configuración de environment para desarrollo
 */
export const environment = {
  production: false,
  apiGatewayUrl: 'http://localhost:45000',
  identityUrl: 'http://localhost:4400',
  loginServiceUrl: 'http://localhost:4400',
  tokenKey: 'ecommerce_access_token',
  refreshTokenKey: 'ecommerce_refresh_token',
  tokenExpirationKey: 'ecommerce_token_expiration'
};
