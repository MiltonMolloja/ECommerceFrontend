import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, catchError, map, shareReplay } from 'rxjs';

/**
 * Servicio para obtener la dirección IP del cliente
 */
@Injectable({
  providedIn: 'root'
})
export class IpService {
  private http = inject(HttpClient);

  private ipCache$?: Observable<string>;

  /**
   * Obtiene la dirección IP pública del cliente
   * Utiliza ipify API (gratuita y confiable)
   * Implementa caché para evitar múltiples llamadas
   */
  getClientIp(): Observable<string> {
    if (!this.ipCache$) {
      this.ipCache$ = this.http.get<{ ip: string }>('https://api.ipify.org?format=json').pipe(
        map((response) => response.ip),
        catchError((error) => {

          return of('127.0.0.1'); // Fallback si falla la API
        }),
        shareReplay(1) // Cachea el resultado
      );
    }
    return this.ipCache$;
  }

  /**
   * Limpia el caché de IP (útil si se necesita refrescar)
   */
  clearCache(): void {
    delete this.ipCache$;
  }
}
