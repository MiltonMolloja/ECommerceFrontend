import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  OrderStatus,
  getOrderStatusLabel,
  getOrderStatusColor
} from '../../../core/models/order/order-status.enum';

@Component({
  selector: 'app-order-status-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="badge" [ngClass]="'badge-' + statusColor">
      {{ statusLabel }}
    </span>
  `,
  styles: [
    `
      .badge {
        display: inline-block;
        padding: 0.35em 0.65em;
        font-size: 0.75em;
        font-weight: 700;
        line-height: 1;
        color: #fff;
        text-align: center;
        white-space: nowrap;
        vertical-align: baseline;
        border-radius: 0.375rem;
      }

      .badge-success {
        background-color: #28a745;
      }

      .badge-danger {
        background-color: #dc3545;
      }

      .badge-warning {
        background-color: #ffc107;
        color: #212529;
      }

      .badge-info {
        background-color: #17a2b8;
      }

      .badge-primary {
        background-color: #007bff;
      }

      .badge-secondary {
        background-color: #6c757d;
      }
    `
  ]
})
export class OrderStatusBadgeComponent {
  @Input() status!: OrderStatus;

  get statusLabel(): string {
    return getOrderStatusLabel(this.status);
  }

  get statusColor(): string {
    return getOrderStatusColor(this.status);
  }
}
