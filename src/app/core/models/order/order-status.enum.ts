export enum OrderStatus {
  AwaitingPayment = 0,
  PaymentProcessing = 1,
  PaymentFailed = 2,
  Paid = 3,
  Processing = 4,
  ReadyToShip = 5,
  Shipped = 6,
  InTransit = 7,
  OutForDelivery = 8,
  Delivered = 9,
  Cancelled = 10,
  Refunded = 11,
  PartiallyRefunded = 12,
  ReturnRequested = 13,
  Returned = 14,
  OnHold = 15,
  PaymentDisputed = 16
}

export const OrderStatusLabels: Record<OrderStatus, string> = {
  [OrderStatus.AwaitingPayment]: 'Esperando Pago',
  [OrderStatus.PaymentProcessing]: 'Procesando Pago',
  [OrderStatus.PaymentFailed]: 'Pago Fallido',
  [OrderStatus.Paid]: 'Pagado',
  [OrderStatus.Processing]: 'Procesando',
  [OrderStatus.ReadyToShip]: 'Listo para Enviar',
  [OrderStatus.Shipped]: 'Enviado',
  [OrderStatus.InTransit]: 'En Tránsito',
  [OrderStatus.OutForDelivery]: 'En Reparto',
  [OrderStatus.Delivered]: 'Entregado',
  [OrderStatus.Cancelled]: 'Cancelado',
  [OrderStatus.Refunded]: 'Reembolsado',
  [OrderStatus.PartiallyRefunded]: 'Reembolso Parcial',
  [OrderStatus.ReturnRequested]: 'Devolución Solicitada',
  [OrderStatus.Returned]: 'Devuelto',
  [OrderStatus.OnHold]: 'En Espera',
  [OrderStatus.PaymentDisputed]: 'Pago Disputado'
};

// Helper function to get status label
export function getOrderStatusLabel(status: OrderStatus): string {
  return OrderStatusLabels[status] || 'Estado Desconocido';
}

// Status colors for UI styling
export const OrderStatusColors: Record<OrderStatus, string> = {
  [OrderStatus.AwaitingPayment]: 'warning',
  [OrderStatus.PaymentProcessing]: 'info',
  [OrderStatus.PaymentFailed]: 'danger',
  [OrderStatus.Paid]: 'success',
  [OrderStatus.Processing]: 'info',
  [OrderStatus.ReadyToShip]: 'primary',
  [OrderStatus.Shipped]: 'primary',
  [OrderStatus.InTransit]: 'primary',
  [OrderStatus.OutForDelivery]: 'primary',
  [OrderStatus.Delivered]: 'success',
  [OrderStatus.Cancelled]: 'danger',
  [OrderStatus.Refunded]: 'warning',
  [OrderStatus.PartiallyRefunded]: 'warning',
  [OrderStatus.ReturnRequested]: 'warning',
  [OrderStatus.Returned]: 'secondary',
  [OrderStatus.OnHold]: 'warning',
  [OrderStatus.PaymentDisputed]: 'danger'
};

// Helper function to get status color
export function getOrderStatusColor(status: OrderStatus): string {
  return OrderStatusColors[status] || 'secondary';
}
