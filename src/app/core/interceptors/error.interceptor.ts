import { HttpInterceptorFn, HttpErrorResponse, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError, retry, timer } from 'rxjs';
import { LoggerService } from '../services/logger.service';

/**
 * Configuración de retry
 */
const RETRY_CONFIG = {
  maxRetries: 2,
  initialDelayMs: 1000,
  maxDelayMs: 5000,
  backoffMultiplier: 2
};

/**
 * Códigos de estado HTTP que son elegibles para retry
 */
const RETRYABLE_STATUS_CODES = [
  0, // Network error
  408, // Request Timeout
  429, // Too Many Requests
  500, // Internal Server Error
  502, // Bad Gateway
  503, // Service Unavailable
  504 // Gateway Timeout
];

/**
 * Métodos HTTP que son seguros para retry (idempotentes)
 */
const RETRYABLE_METHODS = ['GET', 'HEAD', 'OPTIONS', 'PUT', 'DELETE'];

/**
 * Verifica si un error es elegible para retry
 */
function isRetryable(error: HttpErrorResponse, request: HttpRequest<unknown>): boolean {
  // Solo retry para métodos idempotentes
  if (!RETRYABLE_METHODS.includes(request.method.toUpperCase())) {
    return false;
  }

  // Retry para errores de red o códigos específicos
  return RETRYABLE_STATUS_CODES.includes(error.status);
}

/**
 * Calcula el delay para el retry con exponential backoff
 */
function calculateDelay(retryCount: number): number {
  const delay = RETRY_CONFIG.initialDelayMs * Math.pow(RETRY_CONFIG.backoffMultiplier, retryCount);
  return Math.min(delay, RETRY_CONFIG.maxDelayMs);
}

/**
 * Obtiene un mensaje de error amigable basado en el código de estado
 */
function getErrorMessage(error: HttpErrorResponse): string {
  if (error.status === 0) {
    return 'No se pudo conectar con el servidor. Verifique su conexión a internet.';
  }

  switch (error.status) {
    case 400:
      return 'Solicitud inválida. Por favor, verifique los datos ingresados.';
    case 401:
      return 'No autorizado. Por favor, inicie sesión nuevamente.';
    case 403:
      return 'Acceso denegado. No tiene permisos para realizar esta acción.';
    case 404:
      return 'Recurso no encontrado.';
    case 408:
      return 'La solicitud tardó demasiado. Por favor, intente nuevamente.';
    case 422:
      return 'Los datos proporcionados no son válidos.';
    case 429:
      return 'Demasiadas solicitudes. Por favor, espere un momento.';
    case 500:
      return 'Error interno del servidor. Por favor, intente más tarde.';
    case 502:
    case 503:
    case 504:
      return 'El servidor no está disponible. Por favor, intente más tarde.';
    default:
      return `Error ${error.status}: ${error.message || 'Error desconocido'}`;
  }
}

/**
 * Interceptor funcional para manejo global de errores HTTP
 *
 * Características:
 * - Retry automático con exponential backoff para errores 5xx y de red
 * - Logging estructurado con LoggerService
 * - Mensajes de error amigables
 * - No retry para errores 4xx (errores del cliente)
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const logger = inject(LoggerService);
  let retryCount = 0;

  return next(req).pipe(
    // Retry con exponential backoff
    retry({
      count: RETRY_CONFIG.maxRetries,
      delay: (error: HttpErrorResponse, currentRetry: number) => {
        if (!isRetryable(error, req)) {
          // No retry para errores no elegibles
          throw error;
        }

        retryCount = currentRetry;
        const delayMs = calculateDelay(currentRetry - 1);

        logger.warn(
          `Retry ${currentRetry}/${RETRY_CONFIG.maxRetries} for ${req.method} ${req.url}`,
          {
            status: error.status,
            delayMs
          }
        );

        return timer(delayMs);
      }
    }),
    catchError((error: HttpErrorResponse) => {
      const errorMessage = getErrorMessage(error);

      // Log del error
      logger.httpError(req.method, req.url, error.status, error.error, {
        retryAttempts: retryCount,
        errorMessage,
        requestBody: req.method !== 'GET' ? '[REDACTED]' : undefined
      });

      // Enriquecer el error con información adicional
      const enrichedError = {
        ...error,
        userMessage: errorMessage,
        retryAttempts: retryCount,
        timestamp: new Date().toISOString()
      };

      return throwError(() => enrichedError);
    })
  );
};
