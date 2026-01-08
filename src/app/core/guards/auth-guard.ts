import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { environment } from '../../../environments/environment';
import { catchError, map, of } from 'rxjs';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);

  // Si el token es válido y no expiró, permitir acceso
  if (authService.isAuthenticated()) {
    return true;
  }

  // Si el token expiró pero tenemos refresh token, intentar renovar
  if (authService.hasRefreshToken()) {
    return authService.refreshToken().pipe(
      map((response) => {
        if (response.succeeded && response.accessToken) {
          // Token renovado exitosamente, permitir acceso
          return true;
        }
        // Refresh falló, redirigir a login externo
        redirectToExternalLogin(state.url);
        return false;
      }),
      catchError(() => {
        // Error durante refresh, redirigir a login externo
        redirectToExternalLogin(state.url);
        return of(false);
      })
    );
  }

  // No hay token ni refresh token, redirigir a login externo
  redirectToExternalLogin(state.url);
  return false;
};

/**
 * Redirige al microservicio de login externo
 */
function redirectToExternalLogin(targetUrl: string): void {
  const baseUrl = window.location.origin;

  // Construir URL de callback que incluye la página a la que el usuario quería acceder
  const callbackUrl = `${baseUrl}/login-callback?next=${encodeURIComponent(targetUrl)}`;

  // Construir URL completa para el microservicio de login
  // loginServiceUrl ya incluye /auth, solo agregamos /login
  const loginUrl = `${environment.loginServiceUrl}/login?returnUrl=${encodeURIComponent(callbackUrl)}`;

  // Redirigir al microservicio con la URL de callback
  window.location.href = loginUrl;
}
