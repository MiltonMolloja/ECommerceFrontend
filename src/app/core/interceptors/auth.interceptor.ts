import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { environment } from '../../../environments/environment';

/**
 * Interceptor funcional para agregar JWT token a las requests
 * Solo aplica a requests al API Gateway
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  // Solo agregar token si la request es al Gateway
  if (req.url.startsWith(environment.apiGatewayUrl)) {
    const token = authService.getToken();

    if (token) {
      // Clonar request y agregar Authorization header
      const clonedRequest = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });

      return next(clonedRequest);
    }
  }

  return next(req);
};
