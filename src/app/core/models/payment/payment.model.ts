/**
 * Métodos de pago disponibles
 */
export enum PaymentMethod {
  CreditCard = 1,
  DebitCard = 2,
  MercadoPago = 3,
  Cash = 4
}

/**
 * Token de pago de MercadoPago
 */
export interface PaymentToken {
  id: string;
  publicKey: string;
  cardId?: string;
  luhnValidation?: boolean;
  status?: string;
  usedDate?: string;
  cardNumberLength?: number;
  creationDate?: string;
  lastFourDigits?: string;
  firstSixDigits?: string;
  securityCodeLength?: number;
  expirationMonth?: number;
  expirationYear?: number;
  dateCreated?: string;
  dateDue?: string;
  dateLastUpdate?: string;
  live_mode?: boolean;
}

/**
 * Formulario de tarjeta para tokenización
 */
export interface CardForm {
  cardNumber: string;
  cardholderName: string;
  expirationMonth: string;
  expirationYear: string;
  securityCode: string;
  identificationType: string;
  identificationNumber: string;
}

/**
 * Request para procesar pago
 * Nota: userId se extrae automáticamente del token JWT en el backend
 */
export interface ProcessPaymentRequest {
  orderId: number;
  paymentMethodId: string; // ej: "master", "visa", "amex"
  token: string; // Token de MercadoPago
  installments: number; // Número de cuotas
  cardholderName: string; // Nombre del titular (para simulación: APRO, CALL, FUND, etc.)
  identificationType: string; // Tipo de documento (DNI, CUIL, etc.)
  identificationNumber: string; // Número de documento
  billingAddress: string;
  billingCity: string;
  billingCountry: string;
  billingZipCode: string;
}

/**
 * Respuesta del procesamiento de pago
 */
export interface ProcessPaymentResponse {
  success: boolean;
  message: string;
  paymentId?: number;
  status?: string;
  statusDetail?: string;
}
