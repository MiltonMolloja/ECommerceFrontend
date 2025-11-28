import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Order, OrderCreateCommand, DataCollection } from '../models';

/**
 * Servicio para gestionar órdenes mediante Gateway API
 */
@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiGatewayUrl}/orders`;

  /**
   * Obtiene todas las órdenes con paginación
   */
  getOrders(page = 1, take = 10): Observable<DataCollection<Order>> {
    const params = new HttpParams().set('page', page.toString()).set('take', take.toString());

    return this.http.get<DataCollection<Order>>(this.baseUrl, { params });
  }

  /**
   * Obtiene una orden por ID
   * Incluye información del cliente y productos
   */
  getOrderById(id: number): Observable<Order> {
    return this.http.get<Order>(`${this.baseUrl}/${id}`);
  }

  /**
   * Crea una nueva orden
   */
  createOrder(
    command: OrderCreateCommand
  ): Observable<{ message: string; success: boolean; orderId?: number; data?: Order }> {
    return this.http.post<{ message: string; success: boolean; orderId?: number; data?: Order }>(
      this.baseUrl,
      command
    );
  }
}
