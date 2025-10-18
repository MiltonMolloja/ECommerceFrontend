import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { OrderService } from '../../../core/services/order.service';
import { Order, OrderStatus, OrderPayment } from '../../../core/models';

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
        console.error('Error loading order:', error);
        this.loading.set(false);
      }
    });
  }

  getStatusLabel(status: OrderStatus): string {
    switch (status) {
      case OrderStatus.Pending:
        return 'Pending';
      case OrderStatus.Approved:
        return 'Approved';
      case OrderStatus.Cancel:
        return 'Cancelled';
      default:
        return 'Unknown';
    }
  }

  getPaymentTypeLabel(paymentType: OrderPayment): string {
    switch (paymentType) {
      case OrderPayment.CreditCard:
        return 'CreditCard';
      case OrderPayment.PayPal:
        return 'PayPal';
      case OrderPayment.BankTransfer:
        return 'BankTransfer';
      default:
        return 'Unknown';
    }
  }

  getItemTotal(price: number, quantity: number): number {
    return price * quantity;
  }
}
