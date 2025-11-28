import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ProcessPaymentRequest, ProcessPaymentResponse } from '../models/payment/payment.model';

/**
 * Servicio para gestionar pagos con el backend
 */
@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiGatewayUrl}/payments`;

  /**
   * Procesar pago con token de MercadoPago
   * @param request Datos del pago incluyendo orderId y token
   * @returns Observable con la respuesta del pago
   */
  processPayment(request: ProcessPaymentRequest): Observable<ProcessPaymentResponse> {
    return this.http.post<ProcessPaymentResponse>(`${this.baseUrl}/process`, request);
  }
}
