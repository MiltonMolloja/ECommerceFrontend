import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-payment-error',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatDividerModule,
    TranslateModule
  ],
  templateUrl: './payment-error.html',
  styleUrls: ['./payment-error.scss']
})
export class PaymentErrorComponent implements OnInit {
  private router = inject(Router);

  orderNumber = '';
  attemptDate = '';
  amount = '';
  paymentMethod = '';
  failureReason = '';
  orderId?: number;

  ngOnInit(): void {
    // Obtener datos de la navegación
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras?.state || history.state;

    if (state && state.orderNumber) {
      this.orderNumber = state.orderNumber;
      this.attemptDate = state.attemptDate || new Date().toLocaleString('es-AR');
      this.amount = state.amount || '$ 0,00';
      this.paymentMethod = state.paymentMethod || 'No especificado';
      this.failureReason = state.failureReason || 'Error al procesar el pago';
      this.orderId = state.orderId;
    } else {
      // Si no hay datos, redirigir al home
      this.router.navigate(['/']);
    }
  }

  retryPayment(): void {
    if (this.orderId) {
      this.router.navigate(['/checkout'], {
        state: {
          orderId: this.orderId,
          retry: true
        }
      });
    } else {
      this.router.navigate(['/checkout']);
    }
  }

  viewOrder(): void {
    if (this.orderId) {
      this.router.navigate(['/orders', this.orderId]);
    } else {
      this.router.navigate(['/orders']);
    }
  }

  contactSupport(): void {
    // TODO: Implementar navegación a soporte
    window.location.href = 'mailto:support@ecommerce.com';
  }

  goToPaymentMethods(): void {
    this.router.navigate(['/account/payment-methods']);
  }

  goToOrders(): void {
    this.router.navigate(['/orders']);
  }
}
