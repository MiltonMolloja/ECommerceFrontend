import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiConfigService } from './api-config.service';
import { ProcessPaymentRequest, ProcessPaymentResponse } from '../models/payment/payment.model';

/**
 * Servicio para gestionar pagos con el backend
 */
@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private readonly http = inject(HttpClient);
  private apiConfig = inject(ApiConfigService);
  private readonly baseUrl = this.apiConfig.getApiUrl('/payments');

  /**
   * Procesar pago con token de MercadoPago
   * @param request Datos del pago incluyendo orderId y token
   * @returns Observable con la respuesta del pago
   */
  processPayment(request: ProcessPaymentRequest): Observable<ProcessPaymentResponse> {
    return this.http.post<ProcessPaymentResponse>(`${this.baseUrl}/process`, request);
  }
}
