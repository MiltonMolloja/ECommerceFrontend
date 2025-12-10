import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { OrderService } from '../../../core/services/order.service';
import { Order, OrderStatus, OrderPayment } from '../../../core/models';
import { getOrderStatusLabel } from '../../../core/models/order/order-status.enum';
import { getOrderPaymentLabel } from '../../../core/models/order/order-payment.enum';

@Component({
  selector: 'app-order-detail',
  imports: [CommonModule, MatTableModule, MatProgressSpinnerModule],
  templateUrl: './order-detail.html',
  styleUrl: './order-detail.scss'
})
export class OrderDetail implements OnInit {
  private route = inject(ActivatedRoute);
  private orderService = inject(OrderService);

  order = signal<Order | null>(null);
  loading = signal(true);
  displayedColumns: string[] = ['item', 'price', 'quantity', 'total'];

  ngOnInit(): void {
    const orderId = this.route.snapshot.paramMap.get('id');
    if (orderId) {
      this.loadOrder(+orderId);
    }
  }

  loadOrder(id: number): void {
    this.loading.set(true);
    this.orderService.getOrderById(id).subscribe({
      next: (order) => {
        this.order.set(order);
        this.loading.set(false);
      },
      error: (error) => {

        this.loading.set(false);
      }
    });
  }

  getStatusLabel(status: OrderStatus): string {
    return getOrderStatusLabel(status);
  }

  getPaymentTypeLabel(paymentType: OrderPayment): string {
    return getOrderPaymentLabel(paymentType);
  }

  getItemTotal(price: number, quantity: number): number {
    return price * quantity;
  }
}
