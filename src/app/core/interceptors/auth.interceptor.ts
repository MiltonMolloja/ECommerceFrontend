import {
  HttpInterceptorFn,
  HttpErrorResponse,
  HttpRequest,
  HttpHandlerFn
} from '@angular/common/http';
import { inject } from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, filter, switchMap, take, finalize } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { ApiConfigService } from '../services/api-config.service';
import { LoggerService } from '../services/logger.service';
import { environment } from '../../../environments/environment';

// Estado compartido para manejo de concurrencia
let isRefreshing = false;
const refreshTokenSubject = new BehaviorSubject<string | null>(null);

/**
 * URLs que no deben intentar refresh token (evitar loop infinito)
 * - Login: Ya es una petición de autenticación
 * - Refresh Token: Evitar loop infinito si el refresh falla
 * - Register: No requiere autenticación
 */
const EXCLUDED_URLS = [
  '/v1/identity/authentication', // Login
  '/v1/identity/refresh-token', // Refresh token
  '/v1/identity' // Register (POST)
];

/**
 * Verifica si la URL debe ser excluida del manejo de refresh
 */
function isExcludedUrl(url: string): boolean {
  return EXCLUDED_URLS.some((excluded) => url.includes(excluded));
}

/**
 * Agrega el token de autorización a la petición
 */
function addTokenToRequest(
  request: HttpRequest<unknown>,
  token: string | null
): HttpRequest<unknown> {
  if (!token) return request;
  return request.clone({
    setHeaders: { Authorization: `Bearer ${token}` }
  });
}

/**
 * Redirige al login externo preservando la URL actual
 */
function redirectToLogin(apiConfig: ApiConfigService, logger: LoggerService): void {
  const currentPath = window.location.pathname + window.location.search;
  const baseUrl = window.location.origin;
  const callbackUrl = `${baseUrl}/login-callback?next=${encodeURIComponent(currentPath)}`;
  const loginUrl = `${apiConfig.loginServiceUrl}/login?returnUrl=${encodeURIComponent(callbackUrl)}`;

  logger.info('🔐 Sesión expirada, redirigiendo al login', {
    currentPath,
    callbackUrl,
    loginUrl
  });

  window.location.href = loginUrl;
}

/**
 * Maneja el error 401 intentando renovar el token
 */
function handle401Error(
  request: HttpRequest<unknown>,
  next: HttpHandlerFn,
  authService: AuthService,
  apiConfig: ApiConfigService,
  logger: LoggerService
): Observable<unknown> {
  logger.warn('⚠️ Token expirado (401), intentando renovar...', {
    url: request.url,
    method: request.method
  });

  // Si ya estamos refrescando, encolar esta petición
  if (isRefreshing) {
    logger.debug('⏳ Refresh en progreso, encolando petición', {
      url: request.url
    });

    return refreshTokenSubject.pipe(
      filter((token): token is string => token !== null),
      take(1),
      switchMap((token) => {
        logger.debug('✅ Token renovado, reintentando petición encolada', {
          url: request.url
        });
        return next(addTokenToRequest(request, token));
      })
    );
  }

  // Verificar si hay refresh token disponible
  if (!authService.hasRefreshToken()) {
    logger.error('❌ No hay refresh token disponible, cerrando sesión');
    authService.clearSession();
    redirectToLogin(apiConfig, logger);
    return throwError(() => new Error('No refresh token available'));
  }

  // Iniciar proceso de refresh
  isRefreshing = true;
  refreshTokenSubject.next(null);

  logger.info('🔄 Iniciando renovación de token...');

  return authService.refreshToken().pipe(
    switchMap((response) => {
      if (response.succeeded) {
        const newToken = authService.getToken();
        logger.info('✅ Token renovado exitosamente');

        refreshTokenSubject.next(newToken);
        return next(addTokenToRequest(request, newToken));
      }

      // Refresh no exitoso
      logger.error('❌ Renovación de token falló (succeeded=false)');
      authService.clearSession();
      redirectToLogin(apiConfig, logger);
      return throwError(() => new Error('Token refresh failed'));
    }),
    catchError((error) => {
      // Error en refresh, limpiar y redirigir
      logger.error('❌ Error al renovar token', {
        error: error.message || error,
        status: error.status
      });

      authService.clearSession();
      redirectToLogin(apiConfig, logger);
      return throwError(() => error);
    }),
    finalize(() => {
      isRefreshing = false;
      logger.debug('🏁 Proceso de refresh finalizado');
    })
  );
}

/**
 * Interceptor de autenticación con renovación automática de token
 *
 * Características:
 * - Agrega JWT token a las peticiones al API Gateway
 * - Detecta errores 401 (token expirado)
 * - Intenta renovar el token automáticamente usando refresh token
 * - Maneja concurrencia: múltiples peticiones 401 solo generan 1 refresh
 * - Reintenta las peticiones originales con el nuevo token
 * - Si el refresh falla, limpia la sesión y redirige al login externo
 * - Preserva la URL actual para volver después del login
 * - Evita loops infinitos excluyendo URLs de autenticación
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const apiConfig = inject(ApiConfigService);
  const logger = inject(LoggerService);

  // Solo procesar peticiones al API Gateway
  if (!req.url.startsWith(environment.apiGatewayUrl)) {
    return next(req);
  }

  // No interceptar URLs de autenticación (evitar loop infinito)
  if (isExcludedUrl(req.url)) {
    logger.debug('⏭️ URL excluida del interceptor de auth', {
      url: req.url
    });
    return next(req);
  }

  // Agregar token si existe
  const token = authService.getToken();
  const authReq = addTokenToRequest(req, token);

  if (token) {
    logger.debug('🔑 Token agregado a la petición', {
      url: req.url,
      method: req.method
    });
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Solo manejar errores 401 (Unauthorized)
      if (error.status === 401) {
        return handle401Error(req, next, authService, apiConfig, logger);
      }

      // Otros errores pasan al siguiente interceptor
      return throwError(() => error);
    })
  );
};
