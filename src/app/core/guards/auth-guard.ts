import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { environment } from '../../../environments/environment';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);

  if (authService.isAuthenticated()) {
    return true;
  }

  // Redirigir al microservicio de login externo
  const baseUrl = window.location.origin;

  // Construir URL de callback que incluye la página a la que el usuario quería acceder
  const callbackUrl = `${baseUrl}/auth/callback?next=${encodeURIComponent(state.url)}`;

  // Construir URL completa para el microservicio de login
  const loginUrl = `${environment.loginServiceUrl}/auth/login?returnUrl=${encodeURIComponent(callbackUrl)}`;

  // Redirigir al microservicio con la URL de callback
  window.location.href = loginUrl;

  // Retornar false para prevenir la navegación en Angular
  return false;
};
