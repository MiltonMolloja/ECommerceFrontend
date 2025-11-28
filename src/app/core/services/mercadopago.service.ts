import { Injectable } from '@angular/core';
import { loadMercadoPago } from '@mercadopago/sdk-js';
import { environment } from '../../../environments/environment';
import { CardForm, PaymentToken } from '../models/payment/payment.model';

interface IdentificationType {
  id: string;
  name: string;
  type: string;
  min_length: number;
  max_length: number;
}

interface PaymentMethod {
  id: string;
  name: string;
  payment_type_id: string;
  status: string;
  secure_thumbnail: string;
  thumbnail: string;
  deferred_capture: string;
  settings: unknown[];
  additional_info_needed: string[];
  min_allowed_amount: number;
  max_allowed_amount: number;
}

interface PaymentMethodsResponse {
  results: PaymentMethod[];
}

interface Installment {
  installments: number;
  installment_rate: number;
  discount_rate: number;
  min_allowed_amount: number;
  max_allowed_amount: number;
  recommended_message: string;
  installment_amount: number;
  total_amount: number;
}

interface InstallmentOption {
  payment_method_id: string;
  payment_type_id: string;
  issuer: {
    id: string;
    name: string;
  };
  payer_costs: Installment[];
}

interface MercadoPagoSDK {
  createCardToken(cardData: unknown): Promise<PaymentToken>;
  getIdentificationTypes(): Promise<IdentificationType[]>;
  getPaymentMethods(options: { bin: string }): Promise<PaymentMethodsResponse>;
  getInstallments(options: { bin: string; amount: string }): Promise<InstallmentOption[]>;
}

interface WindowWithMercadoPago extends Window {
  MercadoPago: new (publicKey: string, options: { locale: string }) => MercadoPagoSDK;
}

declare const window: WindowWithMercadoPago;

/**
 * Servicio para integración con MercadoPago SDK
 * Maneja la tokenización de tarjetas de crédito de forma segura
 */
@Injectable({
  providedIn: 'root'
})
export class MercadoPagoService {
  private mp: MercadoPagoSDK | null = null;
  private initialized = false;

  /**
   * Inicializar SDK de MercadoPago
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      await loadMercadoPago();
      this.mp = new window.MercadoPago(environment.mercadoPagoPublicKey, {
        locale: 'es-AR'
      });
      this.initialized = true;
      console.log('MercadoPago SDK initialized successfully');
    } catch (error: unknown) {
      console.error('Error initializing MercadoPago SDK:', error);
      throw new Error('No se pudo inicializar el servicio de pagos');
    }
  }

  /**
   * Crear token de tarjeta de crédito
   * @param cardForm Datos de la tarjeta
   * @returns Promise con el token generado
   */
  async createCardToken(cardForm: CardForm): Promise<PaymentToken> {
    if (!this.initialized) {
      await this.initialize();
    }

    const cardData = {
      cardNumber: cardForm.cardNumber.replace(/\s/g, ''),
      cardholderName: cardForm.cardholderName,
      cardExpirationMonth: cardForm.expirationMonth,
      cardExpirationYear: cardForm.expirationYear,
      securityCode: cardForm.securityCode,
      identificationType: cardForm.identificationType,
      identificationNumber: cardForm.identificationNumber
    };

    if (!this.mp) {
      throw new Error('MercadoPago SDK not initialized');
    }

    try {
      const token = await this.mp.createCardToken(cardData);
      console.log('Card token created successfully');
      return token;
    } catch (error: unknown) {
      console.error('Error creating card token:', error);
      throw new Error(
        'Error al procesar la información de la tarjeta. Verifique los datos ingresados.'
      );
    }
  }

  /**
   * Obtener tipos de identificación disponibles
   * @returns Promise con array de tipos de identificación
   */
  async getIdentificationTypes(): Promise<IdentificationType[]> {
    if (!this.initialized || !this.mp) {
      await this.initialize();
    }

    if (!this.mp) {
      throw new Error('MercadoPago SDK not initialized');
    }

    try {
      return await this.mp.getIdentificationTypes();
    } catch (error) {
      console.error('Error getting identification types:', error);
      throw error;
    }
  }

  /**
   * Obtener métodos de pago basados en BIN de tarjeta
   * @param bin Primeros 6 dígitos de la tarjeta
   * @returns Promise con información de métodos de pago
   */
  async getPaymentMethods(bin: string): Promise<PaymentMethodsResponse> {
    if (!this.initialized || !this.mp) {
      await this.initialize();
    }

    if (!this.mp) {
      throw new Error('MercadoPago SDK not initialized');
    }

    try {
      const methods = await this.mp.getPaymentMethods({ bin });
      return methods;
    } catch (error) {
      console.error('Error getting payment methods:', error);
      throw error;
    }
  }

  /**
   * Obtener opciones de cuotas disponibles
   * @param bin Primeros 6 dígitos de la tarjeta
   * @param amount Monto total
   * @returns Promise con opciones de cuotas
   */
  async getInstallments(bin: string, amount: number): Promise<InstallmentOption[]> {
    if (!this.initialized || !this.mp) {
      await this.initialize();
    }

    if (!this.mp) {
      throw new Error('MercadoPago SDK not initialized');
    }

    try {
      return await this.mp.getInstallments({
        bin,
        amount: amount.toString()
      });
    } catch (error) {
      console.error('Error getting installments:', error);
      throw error;
    }
  }

  /**
   * Validar número de tarjeta usando algoritmo de Luhn
   * @param cardNumber Número de tarjeta sin espacios
   * @returns true si es válido
   */
  validateCardNumber(cardNumber: string): boolean {
    const sanitized = cardNumber.replace(/\s/g, '');

    if (!/^\d+$/.test(sanitized)) return false;
    if (sanitized.length < 13 || sanitized.length > 19) return false;

    let sum = 0;
    let isEven = false;

    for (let i = sanitized.length - 1; i >= 0; i--) {
      let digit = parseInt(sanitized.charAt(i), 10);

      if (isEven) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }

      sum += digit;
      isEven = !isEven;
    }

    return sum % 10 === 0;
  }

  /**
   * Detectar tipo de tarjeta basado en BIN
   * @param cardNumber Número de tarjeta
   * @returns Tipo de tarjeta (visa, mastercard, amex, etc.)
   */
  detectCardType(cardNumber: string): string {
    const sanitized = cardNumber.replace(/\s/g, '');

    if (/^4/.test(sanitized)) return 'visa';
    if (/^5[1-5]/.test(sanitized)) return 'mastercard';
    if (/^3[47]/.test(sanitized)) return 'amex';
    if (/^6(?:011|5)/.test(sanitized)) return 'discover';

    return 'unknown';
  }
}
