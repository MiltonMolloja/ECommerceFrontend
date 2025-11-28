import { Client } from '../customer/client.model';
import { Product } from '../catalog/product.model';
import { OrderStatus } from './order-status.enum';
import { OrderPayment } from './order-payment.enum';

// Re-export enums for backward compatibility
export { OrderStatus, OrderPayment };

/**
 * Detalle de item en la orden
 */
export interface OrderDetail {
  orderDetailId: number;
  productId: number;
  product?: Product;
  quantity: number;
  unitPrice: number;
  total: number;
}

/**
 * Modelo de Orden
 */
export interface Order {
  orderId: number;
  clientId: number;
  client?: Client;
  orderNumber: string;
  status: OrderStatus;
  paymentType: OrderPayment;
  items: OrderDetail[];
  createdAt: Date | string;
  total: number;

  // Shipping Address
  shippingRecipientName: string;
  shippingPhone: string;
  shippingAddressLine1: string;
  shippingAddressLine2?: string;
  shippingCity: string;
  shippingState?: string;
  shippingPostalCode: string;
  shippingCountry: string;

  // Billing Address
  billingAddressLine1: string;
  billingCity: string;
  billingPostalCode: string;
  billingCountry: string;
  billingSameAsShipping: boolean;

  // NEW: Order Status Tracking Fields
  updatedAt?: Date | string;
  paidAt?: Date | string;
  shippedAt?: Date | string;
  deliveredAt?: Date | string;
  cancelledAt?: Date | string;
  cancellationReason?: string;

  // NEW: Payment Tracking Fields
  paymentTransactionId?: string;
  paymentGateway?: string;
}

/**
 * Item para crear una orden
 */
export interface OrderCreateItem {
  productId: number;
  quantity: number;
  price: number;
}

/**
 * Comando para crear una orden
 */
export interface OrderCreateCommand {
  clientId?: number; // Optional - extracted from JWT for regular users, required for admin creating orders
  paymentType: OrderPayment;
  items: OrderCreateItem[];

  // Shipping Address (REQUIRED)
  shippingRecipientName: string;
  shippingPhone: string;
  shippingAddressLine1: string;
  shippingAddressLine2?: string;
  shippingCity: string;
  shippingState?: string;
  shippingPostalCode: string;
  shippingCountry: string;

  // Billing Address (OPTIONAL - uses shipping if not provided)
  billingAddressLine1?: string;
  billingCity?: string;
  billingPostalCode?: string;
  billingCountry?: string;
  billingSameAsShipping: boolean;
}

/**
 * Request para actualizar el estado de una orden
 */
export interface UpdateOrderStatusRequest {
  status: OrderStatus;
  reason?: string;
  paymentTransactionId?: string;
  paymentGateway?: string;
}
