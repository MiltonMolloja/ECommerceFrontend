import { Injectable, isDevMode } from '@angular/core';

/**
 * Niveles de log disponibles
 */
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  OFF = 4
}

/**
 * Interfaz para integraciones externas de logging (Sentry, LogRocket, etc.)
 */
export interface ExternalLogger {
  captureException(error: Error, context?: Record<string, unknown>): void;
  captureMessage(message: string, level: string, context?: Record<string, unknown>): void;
}

/**
 * Servicio de logging centralizado con soporte para:
 * - Logging condicional basado en ambiente (dev/prod)
 * - Integración con servicios externos (Sentry, LogRocket, etc.)
 * - Niveles de log configurables
 * - Contexto adicional en los logs
 */
@Injectable({
  providedIn: 'root'
})
export class LoggerService {
  private logLevel: LogLevel = isDevMode() ? LogLevel.DEBUG : LogLevel.ERROR;
  private externalLogger: ExternalLogger | null = null;

  /**
   * Configura el nivel de log
   */
  setLogLevel(level: LogLevel): void {
    this.logLevel = level;
  }

  /**
   * Registra un logger externo (Sentry, LogRocket, etc.)
   */
  setExternalLogger(logger: ExternalLogger): void {
    this.externalLogger = logger;
  }

  /**
   * Log de nivel DEBUG - Solo visible en desarrollo
   */
  debug(message: string, ...args: unknown[]): void {
    if (this.logLevel <= LogLevel.DEBUG) {
      console.debug(`[DEBUG] ${message}`, ...args);
    }
  }

  /**
   * Log de nivel INFO - Solo visible en desarrollo
   */
  info(message: string, ...args: unknown[]): void {
    if (this.logLevel <= LogLevel.INFO) {
      console.info(`[INFO] ${message}`, ...args);
    }
  }

  /**
   * Log de nivel WARN - Visible en desarrollo, enviado a external logger en producción
   */
  warn(message: string, context?: Record<string, unknown>): void {
    if (this.logLevel <= LogLevel.WARN) {
      console.warn(`[WARN] ${message}`, context);
    }

    // En producción, enviar warnings a logger externo si está configurado
    if (!isDevMode() && this.externalLogger) {
      this.externalLogger.captureMessage(message, 'warning', context);
    }
  }

  /**
   * Log de nivel ERROR - Siempre visible, siempre enviado a external logger
   */
  error(message: string, error?: Error | unknown, context?: Record<string, unknown>): void {
    if (this.logLevel <= LogLevel.ERROR) {
      console.error(`[ERROR] ${message}`, error, context);
    }

    // Siempre enviar errores a logger externo si está configurado
    if (this.externalLogger) {
      if (error instanceof Error) {
        this.externalLogger.captureException(error, { message, ...context });
      } else {
        this.externalLogger.captureMessage(message, 'error', { error, ...context });
      }
    }
  }

  /**
   * Log de errores HTTP con contexto adicional
   */
  httpError(
    method: string,
    url: string,
    status: number,
    error?: unknown,
    context?: Record<string, unknown>
  ): void {
    const message = `HTTP ${method} ${url} failed with status ${status}`;
    this.error(message, error instanceof Error ? error : undefined, {
      method,
      url,
      status,
      ...context
    });
  }

  /**
   * Log de performance/timing
   */
  performance(label: string, durationMs: number, context?: Record<string, unknown>): void {
    if (this.logLevel <= LogLevel.DEBUG) {
      console.debug(`[PERF] ${label}: ${durationMs}ms`, context);
    }
  }

  /**
   * Crear un grupo de logs (útil para debugging)
   */
  group(label: string): void {
    if (this.logLevel <= LogLevel.DEBUG && isDevMode()) {
      console.group(label);
    }
  }

  /**
   * Cerrar grupo de logs
   */
  groupEnd(): void {
    if (this.logLevel <= LogLevel.DEBUG && isDevMode()) {
      console.groupEnd();
    }
  }
}
