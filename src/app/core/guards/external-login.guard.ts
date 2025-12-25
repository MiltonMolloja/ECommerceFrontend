import { CanActivateFn } from '@angular/router';
import { environment } from '../../../environments/environment';

/**
 * Guard que redirige al microservicio de login externo
 * Se usa en la ruta /login para redirigir al usuario al servicio de autenticación
 */
export const externalLoginGuard: CanActivateFn = (route) => {
  const baseUrl = window.location.origin;

  // Obtener la página de destino después del login (por defecto Home)
  const returnUrl = route.queryParams['returnUrl'] || '/';

  // Construir URL de callback que incluye la página de destino
  const callbackUrl = `${baseUrl}/login-callback?next=${encodeURIComponent(returnUrl)}`;

  // Redirigir al microservicio de login en el puerto 4400
  // El servicio agregará los tokens como query params al returnUrl cuando redirige de vuelta
  window.location.href = `${environment.loginServiceUrl}/auth/login?returnUrl=${encodeURIComponent(callbackUrl)}`;

  // Retornar false para prevenir la navegación en Angular
  return false;
};
