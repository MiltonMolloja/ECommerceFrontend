export enum OrderPayment {
  CreditCard = 0,
  DebitCard = 1,
  MercadoPago = 2,
  PayPal = 3,
  BankTransfer = 4,
  Cash = 5,
  Other = 99
}

export const OrderPaymentLabels: Record<OrderPayment, string> = {
  [OrderPayment.CreditCard]: 'Tarjeta de Crédito',
  [OrderPayment.DebitCard]: 'Tarjeta de Débito',
  [OrderPayment.MercadoPago]: 'MercadoPago',
  [OrderPayment.PayPal]: 'PayPal',
  [OrderPayment.BankTransfer]: 'Transferencia Bancaria',
  [OrderPayment.Cash]: 'Efectivo',
  [OrderPayment.Other]: 'Otro'
};

// Helper function to get payment type label
export function getOrderPaymentLabel(paymentType: OrderPayment): string {
  return OrderPaymentLabels[paymentType] || 'Método Desconocido';
}

// Payment type icons for UI
export const OrderPaymentIcons: Record<OrderPayment, string> = {
  [OrderPayment.CreditCard]: 'credit_card',
  [OrderPayment.DebitCard]: 'credit_card',
  [OrderPayment.MercadoPago]: 'account_balance',
  [OrderPayment.PayPal]: 'account_balance_wallet',
  [OrderPayment.BankTransfer]: 'account_balance',
  [OrderPayment.Cash]: 'payments',
  [OrderPayment.Other]: 'payment'
};

// Helper function to get payment icon
export function getOrderPaymentIcon(paymentType: OrderPayment): string {
  return OrderPaymentIcons[paymentType] || 'payment';
}
