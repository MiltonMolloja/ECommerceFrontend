import { Client } from '../customer/client.model';
import { Product } from '../catalog/product.model';

/**
 * Estado de la orden
 */
export enum OrderStatus {
  Cancel = 0,
  Pending = 1,
  Approved = 2
}

/**
 * Tipo de pago
 */
export enum OrderPayment {
  CreditCard = 0,
  PayPal = 1,
  BankTransfer = 2
}

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
  clientId: number;
  paymentType: OrderPayment;
  items: OrderCreateItem[];
}
