import { Injectable, signal, computed } from '@angular/core';
import { ShippingAddress, PaymentInfo, CheckoutData } from '../models/checkout.models';

@Injectable({
  providedIn: 'root'
})
export class CheckoutService {
  // Estado del checkout
  private checkoutData = signal<CheckoutData>({
    shippingAddress: null,
    paymentInfo: null,
    currentStep: 1
  });

  // Señales computadas
  currentStep = computed(() => this.checkoutData().currentStep);
  shippingAddress = computed(() => this.checkoutData().shippingAddress);
  paymentInfo = computed(() => this.checkoutData().paymentInfo);

  /**
   * Actualizar dirección de envío
   */
  setShippingAddress(address: ShippingAddress): void {
    this.checkoutData.update((data) => ({
      ...data,
      shippingAddress: address
    }));
  }

  /**
   * Actualizar información de pago
   */
  setPaymentInfo(payment: PaymentInfo): void {
    this.checkoutData.update((data) => ({
      ...data,
      paymentInfo: payment
    }));
  }

  /**
   * Ir al siguiente paso
   */
  nextStep(): void {
    this.checkoutData.update((data) => ({
      ...data,
      currentStep: Math.min(data.currentStep + 1, 3)
    }));
  }

  /**
   * Cambiar a un paso específico
   */
  goToStep(step: number): void {
    this.checkoutData.update((data) => ({
      ...data,
      currentStep: step
    }));
  }

  /**
   * Resetear el checkout
   */
  reset(): void {
    this.checkoutData.set({
      shippingAddress: null,
      paymentInfo: null,
      currentStep: 1
    });
  }

  /**
   * Generar número de orden
   */
  generateOrderNumber(): string {
    return `#${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  }
}
