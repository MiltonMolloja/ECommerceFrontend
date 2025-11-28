import { Component, inject, signal, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { OrderService } from '../../../core/services/order.service';
import { Order, OrderStatus, OrderPayment } from '../../../core/models';
import { getOrderStatusLabel } from '../../../core/models/order/order-status.enum';
import { getOrderPaymentLabel } from '../../../core/models/order/order-payment.enum';

@Component({
  selector: 'app-orders-list',
  imports: [CommonModule, RouterLink, MatTableModule, MatButtonModule, MatProgressSpinnerModule],
  templateUrl: './orders-list.html',
  styleUrl: './orders-list.scss'
})
export class OrdersList implements OnInit {
  private orderService = inject(OrderService);
  private router = inject(Router);

  orders = signal<Order[]>([]);
  loading = signal(true);
  displayedColumns: string[] = ['orderNumber', 'client', 'paymentType', 'status', 'total'];

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.loading.set(true);
    this.orderService.getOrders(1, 100).subscribe({
      next: (response) => {
        this.orders.set(response.items);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading orders:', error);
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

  navigateToNewOrder(): void {
    this.router.navigate(['/orders/new']);
  }
}
