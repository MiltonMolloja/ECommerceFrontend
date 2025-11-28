export interface CheckoutStep {
  id: number;
  title: string;
  completed: boolean;
}

export interface ShippingAddress {
  fullName: string;
  phoneNumber: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state?: string;
  zipCode: string;
  country: string;
}

export interface BillingAddress {
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state?: string;
  zipCode: string;
  country: string;
}

export interface PaymentInfo {
  cardNumber: string;
  cardholderName: string;
  expirationMonth: string;
  expirationYear: string;
  cvv: string;
  identificationType: string;
  identificationNumber: string;
  billingSameAsShipping: boolean;
  billingAddress?: BillingAddress;
}

export interface CheckoutData {
  shippingAddress: ShippingAddress | null;
  paymentInfo: PaymentInfo | null;
  currentStep: number;
}

export interface OrderSummary {
  orderNumber: string;
  total: number;
  shippingAddress: ShippingAddress;
  orderDate: Date;
}
