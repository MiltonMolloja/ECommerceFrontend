import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Client, DataCollection } from '../models';

/**
 * Servicio para gestionar clientes mediante Gateway API
 */
@Injectable({
  providedIn: 'root'
})
export class CustomerService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiGatewayUrl}/clients`;

  /**
   * Obtiene todos los clientes con paginación
   */
  getClients(page = 1, take = 10): Observable<DataCollection<Client>> {
    const params = new HttpParams().set('page', page.toString()).set('take', take.toString());

    return this.http.get<DataCollection<Client>>(this.baseUrl, { params });
  }

  /**
   * Obtiene un cliente por ID
   */
  getClientById(id: number): Observable<Client> {
    return this.http.get<Client>(`${this.baseUrl}/${id}`);
  }

  /**
   * Obtiene clientes por IDs específicos
   */
  getClientsByIds(ids: number[], page = 1): Observable<DataCollection<Client>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('take', ids.length.toString())
      .set('ids', ids.join(','));

    return this.http.get<DataCollection<Client>>(this.baseUrl, { params });
  }
}
