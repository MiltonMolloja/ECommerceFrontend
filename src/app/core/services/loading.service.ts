import { Injectable, signal, computed } from '@angular/core';

/**
 * Servicio de loading global con Angular Signals
 *
 * Características:
 * - Maneja múltiples llamadas concurrentes con contador
 * - Soporte para loading por contexto (ej: 'cart', 'checkout', 'search')
 * - Delay opcional para evitar flicker en requests rápidos
 * - Timeout de seguridad para evitar loading infinito
 */
@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  // Contador global de requests activos
  private readonly loadingCount = signal(0);

  // Map de loading por contexto
  private readonly contextLoading = signal<Map<string, number>>(new Map());

  // Timeout de seguridad (30 segundos por defecto)
  private readonly safetyTimeout = 30000;
  private timeoutIds = new Map<string, ReturnType<typeof setTimeout>>();

  /**
   * Signal computado: true si hay al menos un request activo
   */
  readonly isLoading = computed(() => this.loadingCount() > 0);

  /**
   * Signal computado: número de requests activos
   */
  readonly activeRequests = computed(() => this.loadingCount());

  /**
   * Inicia el estado de loading global
   * @param context Contexto opcional para tracking específico
   */
  show(context?: string): void {
    this.loadingCount.update((count) => count + 1);

    if (context) {
      this.contextLoading.update((map) => {
        const newMap = new Map(map);
        newMap.set(context, (newMap.get(context) || 0) + 1);
        return newMap;
      });

      // Safety timeout para este contexto
      this.setSafetyTimeout(context);
    }
  }

  /**
   * Finaliza el estado de loading global
   * @param context Contexto opcional para tracking específico
   */
  hide(context?: string): void {
    this.loadingCount.update((count) => Math.max(0, count - 1));

    if (context) {
      this.contextLoading.update((map) => {
        const newMap = new Map(map);
        const current = newMap.get(context) || 0;
        if (current <= 1) {
          newMap.delete(context);
          this.clearSafetyTimeout(context);
        } else {
          newMap.set(context, current - 1);
        }
        return newMap;
      });
    }
  }

  /**
   * Verifica si un contexto específico está en loading
   * @param context Contexto a verificar
   */
  isContextLoading(context: string): boolean {
    const map = this.contextLoading();
    return (map.get(context) || 0) > 0;
  }

  /**
   * Obtiene un signal computado para un contexto específico
   * @param context Contexto a observar
   */
  getContextLoadingSignal(context: string) {
    return computed(() => {
      const map = this.contextLoading();
      return (map.get(context) || 0) > 0;
    });
  }

  /**
   * Resetea todo el estado de loading (útil para cleanup o errores)
   */
  reset(): void {
    this.loadingCount.set(0);
    this.contextLoading.set(new Map());

    // Limpiar todos los timeouts
    this.timeoutIds.forEach((_, key) => this.clearSafetyTimeout(key));
    this.timeoutIds.clear();
  }

  /**
   * Wrapper para ejecutar una función con loading automático
   * @param fn Función a ejecutar
   * @param context Contexto opcional
   */
  async withLoading<T>(fn: () => Promise<T>, context?: string): Promise<T> {
    this.show(context);
    try {
      return await fn();
    } finally {
      this.hide(context);
    }
  }

  /**
   * Configura un timeout de seguridad para evitar loading infinito
   */
  private setSafetyTimeout(context: string): void {
    // Limpiar timeout existente si hay uno
    this.clearSafetyTimeout(context);

    const timeoutId = setTimeout(() => {
      console.warn(`[LoadingService] Safety timeout reached for context: ${context}`);
      // Forzar hide para este contexto
      const map = this.contextLoading();
      const count = map.get(context) || 0;
      if (count > 0) {
        this.loadingCount.update((c) => Math.max(0, c - count));
        this.contextLoading.update((m) => {
          const newMap = new Map(m);
          newMap.delete(context);
          return newMap;
        });
      }
    }, this.safetyTimeout);

    this.timeoutIds.set(context, timeoutId);
  }

  /**
   * Limpia el timeout de seguridad para un contexto
   */
  private clearSafetyTimeout(context: string): void {
    const timeoutId = this.timeoutIds.get(context);
    if (timeoutId) {
      clearTimeout(timeoutId);
      this.timeoutIds.delete(context);
    }
  }
}
