import { Component, inject, computed, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Subject, takeUntil } from 'rxjs';
import { CartService } from '../../core/services/cart.service';
import { CheckoutService } from './services/checkout.service';
import { CheckoutStep } from './models/checkout.models';
import { OrderService } from '../../core/services/order.service';
import { PaymentService } from '../../core/services/payment.service';
import { MercadoPagoService } from '../../core/services/mercadopago.service';
import { AuthService } from '../../core/services/auth.service';
import { OrderCreateCommand, OrderPayment } from '../../core/models/order/order.model';
import { CardForm } from '../../core/models/payment/payment.model';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatCheckboxModule,
    MatSnackBarModule,
    MatDividerModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './checkout.html',
  styleUrls: ['./checkout.scss']
})
export class CheckoutComponent implements OnInit, OnDestroy {
  private cartService = inject(CartService);
  private checkoutService = inject(CheckoutService);
  private orderService = inject(OrderService);
  private paymentService = inject(PaymentService);
  private mercadoPagoService = inject(MercadoPagoService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private snackBar = inject(MatSnackBar);
  private fb = inject(FormBuilder);
  private destroy$ = new Subject<void>();

  // Signals from cart
  items = computed(() => this.cartService.items());
  itemCount = computed(() => this.cartService.itemCount());
  subtotal = computed(() => this.cartService.totalAmount());

  // Signals from checkout
  currentStep = this.checkoutService.currentStep;

  // Forms
  shippingForm: FormGroup;
  billingForm: FormGroup;
  paymentForm: FormGroup;

  // State
  isProcessing = false;
  isInitializingPayment = false;
  pendingOrderAfterLogin = false;
  identificationTypes: { id: string; name: string; type: string }[] = [];
  paymentMethodInfo: { id: string; name: string } | null = null;
  createdOrderId: number | null = null;

  // Calculations
  shipping = computed(() => (this.subtotal() >= 25 ? 0 : 9.99));
  tax = computed(() => this.subtotal() * 0.08);
  total = computed(() => this.subtotal() + this.shipping() + this.tax());

  steps: CheckoutStep[] = [
    { id: 1, title: 'Dirección de envío', completed: false },
    { id: 2, title: 'Método de pago', completed: false },
    { id: 3, title: 'Revisar pedido', completed: false }
  ];

  countries = [
    { value: 'AR', label: 'Argentina' },
    { value: 'US', label: 'Estados Unidos' },
    { value: 'BR', label: 'Brasil' },
    { value: 'MX', label: 'México' },
    { value: 'CL', label: 'Chile' },
    { value: 'CO', label: 'Colombia' }
  ];

  ngOnInit(): void {
    // Initialize MercadoPago SDK
    this.initializeMercadoPago();

    // Check if returning from login
    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      if (params['returnFromLogin'] === 'true' && this.authService.isAuthenticated()) {
        this.pendingOrderAfterLogin = true;
        this.router.navigate([], {
          relativeTo: this.route,
          queryParams: {},
          replaceUrl: true
        });
        if (this.currentStep() === 3) {
          setTimeout(() => this.processOrder(), 500);
        }
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  constructor() {
    // Verify cart has items
    if (this.items().length === 0) {
      this.router.navigate(['/cart']);
    }

    // Initialize shipping form
    this.shippingForm = this.fb.group({
      fullName: ['', Validators.required],
      phoneNumber: ['', Validators.required],
      addressLine1: ['', Validators.required],
      addressLine2: [''],
      city: ['', Validators.required],
      state: [''],
      zipCode: ['', Validators.required],
      country: ['AR', Validators.required]
    });

    // Initialize billing form
    this.billingForm = this.fb.group({
      addressLine1: ['', Validators.required],
      addressLine2: [''],
      city: ['', Validators.required],
      state: [''],
      zipCode: ['', Validators.required],
      country: ['AR', Validators.required]
    });

    // Initialize payment form with additional fields for MercadoPago
    this.paymentForm = this.fb.group({
      cardNumber: ['', [Validators.required, Validators.minLength(13)]],
      cardholderName: ['', Validators.required],
      expirationMonth: ['', [Validators.required, Validators.pattern(/^\d{2}$/)]],
      expirationYear: ['', [Validators.required, Validators.pattern(/^\d{2}$/)]],
      cvv: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(4)]],
      identificationType: ['', Validators.required],
      identificationNumber: ['', Validators.required],
      billingSameAsShipping: [true]
    });

    // Watch for changes in billingSameAsShipping
    this.paymentForm
      .get('billingSameAsShipping')
      ?.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe((sameAsShipping) => {
        if (sameAsShipping) {
          // Disable billing form when using same address
          this.billingForm.disable();
        } else {
          // Enable billing form when using different address
          this.billingForm.enable();
        }
      });

    // Detect payment method when card number changes
    this.paymentForm
      .get('cardNumber')
      ?.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe((cardNumber) => {
        const sanitized = cardNumber?.replace(/\s/g, '') || '';
        if (sanitized.length >= 6) {
          this.detectPaymentMethod(sanitized.substring(0, 6));
        }
      });

    // Load saved data if exists
    const savedShipping = this.checkoutService.shippingAddress();
    if (savedShipping) {
      this.shippingForm.patchValue(savedShipping);
    }

    const savedPayment = this.checkoutService.paymentInfo();
    if (savedPayment) {
      this.paymentForm.patchValue({
        cardNumber: savedPayment.cardNumber,
        cardholderName: savedPayment.cardholderName,
        expirationMonth: savedPayment.expirationMonth,
        expirationYear: savedPayment.expirationYear,
        cvv: savedPayment.cvv,
        identificationType: savedPayment.identificationType,
        identificationNumber: savedPayment.identificationNumber,
        billingSameAsShipping: savedPayment.billingSameAsShipping
      });

      if (savedPayment.billingAddress) {
        this.billingForm.patchValue(savedPayment.billingAddress);
      }
    }

    // Disable billing form initially (billingSameAsShipping defaults to true)
    this.billingForm.disable();
  }

  /**
   * Initialize MercadoPago SDK and load identification types
   */
  async initializeMercadoPago(): Promise<void> {
    this.isInitializingPayment = true;
    try {
      await this.mercadoPagoService.initialize();
      this.identificationTypes = await this.mercadoPagoService.getIdentificationTypes();

    } catch (error) {

      this.snackBar.open('Error al inicializar el servicio de pagos', '', {
        duration: 5000,
        horizontalPosition: 'end',
        verticalPosition: 'top'
      });
    } finally {
      this.isInitializingPayment = false;
    }
  }

  /**
   * Detect payment method based on card BIN
   */
  async detectPaymentMethod(bin: string): Promise<void> {
    try {
      const methods = await this.mercadoPagoService.getPaymentMethods(bin);
      if (methods && methods.results && methods.results.length > 0) {
        const method = methods.results[0];
        if (method && typeof method.id === 'string' && typeof method.name === 'string') {
          this.paymentMethodInfo = { id: method.id, name: method.name };

        }
      }
    } catch (error) {

    }
  }

  /**
   * Get updated steps with completion status
   */
  getSteps(): CheckoutStep[] {
    return this.steps.map((step) => ({
      ...step,
      completed: step.id < this.currentStep()
    }));
  }

  /**
   * Submit shipping form
   */
  submitShippingForm(): void {
    if (this.shippingForm.valid) {
      this.checkoutService.setShippingAddress(this.shippingForm.value);
      this.checkoutService.nextStep();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      this.snackBar.open('Por favor complete todos los campos requeridos', '', {
        duration: 3000,
        horizontalPosition: 'end',
        verticalPosition: 'top'
      });
      this.shippingForm.markAllAsTouched();
    }
  }

  /**
   * Submit payment form
   */
  submitPaymentForm(): void {
    const billingSameAsShipping = this.paymentForm.get('billingSameAsShipping')?.value;

    // Validate payment form
    if (!this.paymentForm.valid) {
      this.snackBar.open('Por favor complete todos los detalles de pago', '', {
        duration: 3000,
        horizontalPosition: 'end',
        verticalPosition: 'top'
      });
      this.paymentForm.markAllAsTouched();
      return;
    }

    // Validate billing form if different address
    if (!billingSameAsShipping && !this.billingForm.valid) {
      this.snackBar.open('Por favor complete la dirección de facturación', '', {
        duration: 3000,
        horizontalPosition: 'end',
        verticalPosition: 'top'
      });
      this.billingForm.markAllAsTouched();
      return;
    }

    // Save payment info
    const paymentInfo = {
      ...this.paymentForm.value,
      billingAddress: billingSameAsShipping ? null : this.billingForm.value
    };
    this.checkoutService.setPaymentInfo(paymentInfo);
    this.checkoutService.nextStep();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /**
   * Place order - Main checkout flow
   */
  async placeOrder(): Promise<void> {

    const currentUser = this.authService.currentUser();

    // Verify authentication
    if (!currentUser) {

      this.snackBar.open('Sesión expirada. Por favor inicie sesión nuevamente.', '', {
        duration: 3000,
        horizontalPosition: 'end',
        verticalPosition: 'top'
      });

      const baseUrl = window.location.origin;
      const returnUrl = '/checkout';
      const callbackUrl = `${baseUrl}/auth/callback?next=${encodeURIComponent(returnUrl)}`;
      window.location.href = `${environment.loginServiceUrl}/auth/login?returnUrl=${encodeURIComponent(callbackUrl)}`;
      return;
    }

    // Validate cart has items
    if (this.items().length === 0) {

      this.snackBar.open('No hay productos en el carrito', '', {
        duration: 3000,
        horizontalPosition: 'end',
        verticalPosition: 'top'
      });
      return;
    }

    this.isProcessing = true;

    try {
      // Step 1: Create order with address information (ClientId is extracted from JWT token in backend)

      await this.createOrder();

      // Step 2: Tokenize card with MercadoPago

      const token = await this.tokenizeCard();

      // Step 3: Process payment with token


      await this.processPayment(token);

      // Success - navigate to confirmation

      this.handleOrderSuccess();
    } catch (error: unknown) {

      this.handleOrderError(error);
    } finally {
      this.isProcessing = false;
      this.pendingOrderAfterLogin = false;

    }
  }

  /**
   * Create order in backend
   * Note: ClientId is automatically extracted from JWT token in the backend
   */
  private createOrder(): Promise<void> {
    return new Promise((resolve, reject) => {
      const billingSameAsShipping = this.paymentForm.get('billingSameAsShipping')?.value;
      const shippingAddress = this.shippingForm.value;
      const billingAddress = billingSameAsShipping ? null : this.billingForm.value;

      const orderCommand: OrderCreateCommand = {
        paymentType: OrderPayment.CreditCard,
        items: this.items().map((item) => ({
          productId: parseInt(item.productId),
          quantity: item.quantity,
          price: item.price
        })),
        // Shipping Address
        shippingRecipientName: shippingAddress.fullName,
        shippingPhone: shippingAddress.phoneNumber,
        shippingAddressLine1: shippingAddress.addressLine1,
        shippingAddressLine2: shippingAddress.addressLine2 || undefined,
        shippingCity: shippingAddress.city,
        shippingState: shippingAddress.state || undefined,
        shippingPostalCode: shippingAddress.zipCode,
        shippingCountry: shippingAddress.country,
        // Billing Address
        billingSameAsShipping: billingSameAsShipping,
        billingAddressLine1: billingAddress?.addressLine1,
        billingCity: billingAddress?.city,
        billingPostalCode: billingAddress?.zipCode,
        billingCountry: billingAddress?.country
      };

      this.orderService.createOrder(orderCommand).subscribe({
        next: (response) => {
          if (response.success && response.orderId) {
            this.createdOrderId = response.orderId;

            resolve();
          } else {
            reject(new Error(response.message || 'Error al crear la orden'));
          }
        },
        error: (error) => {

          reject(error);
        }
      });
    });
  }

  /**
   * Tokenize card with MercadoPago
   */
  private async tokenizeCard(): Promise<string> {
    const paymentData = this.paymentForm.value;

    const cardForm: CardForm = {
      cardNumber: paymentData.cardNumber.replace(/\s/g, ''),
      cardholderName: paymentData.cardholderName,
      expirationMonth: paymentData.expirationMonth,
      expirationYear: paymentData.expirationYear,
      securityCode: paymentData.cvv,
      identificationType: paymentData.identificationType,
      identificationNumber: paymentData.identificationNumber
    };

    try {
      const token = await this.mercadoPagoService.createCardToken(cardForm);

      return token.id;
    } catch (error) {

      throw new Error('Error al procesar la información de la tarjeta');
    }
  }

  /**
   * Process payment with backend
   */
  private processPayment(token: string): Promise<void> {
    return new Promise((resolve, reject) => {
      console.log('💰 processPayment() called with token:', token);

      if (!this.createdOrderId) {

        reject(new Error('No se encontró el ID de la orden'));
        return;
      }

      // Get billing address (use shipping if billingSameAsShipping is true)
      const billingSameAsShipping = this.paymentForm.get('billingSameAsShipping')?.value;
      const billingAddress = billingSameAsShipping
        ? this.shippingForm.value
        : this.billingForm.value;

      const paymentRequest = {
        orderId: this.createdOrderId,
        token: token,
        paymentMethodId: this.paymentMethodInfo?.id || 'credit_card',
        installments: 1,
        billingAddress: billingAddress.addressLine1 || '',
        billingCity: billingAddress.city || '',
        billingCountry: billingAddress.country || 'AR',
        billingZipCode: billingAddress.zipCode || ''
      };

      this.paymentService.processPayment(paymentRequest).subscribe({
        next: (response) => {

          if (response.success) {

            resolve();
          } else {

            reject(new Error(response.message || 'Error al procesar el pago'));
          }
        },
        error: (error) => {


          reject(error);
        }
      });
    });
  }

  /**
   * Handle successful order completion
   */
  private handleOrderSuccess(): void {
    this.snackBar.open('Pedido realizado con éxito', '', {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'top'
    });

    this.router.navigate(['/order-confirmation'], {
      state: {
        orderNumber: this.checkoutService.generateOrderNumber(),
        orderId: this.createdOrderId,
        total: this.total(),
        items: this.items(),
        shippingAddress: this.checkoutService.shippingAddress()
      }
    });

    // Clear cart and checkout
    this.cartService.clearCart();
    this.checkoutService.reset();
  }

  /**
   * Handle order errors
   */
  private handleOrderError(error: unknown): void {

    const err = error as { error?: { message?: string; error?: string }; message?: string };
    const errorMessage =
      err.error?.message ||
      err.message ||
      'Ocurrió un error al procesar su pedido. Por favor intente nuevamente.';

    // If payment failed and we have an order ID, navigate to payment-error page
    if (this.createdOrderId && err.error?.error) {
      const paymentData = this.paymentForm.value;
      const cardNumber = paymentData.cardNumber?.replace(/\s/g, '') || '';
      const lastFourDigits = cardNumber.slice(-4) || '****';

      this.router.navigate(['/payment-error'], {
        state: {
          orderNumber: this.checkoutService.generateOrderNumber(),
          orderId: this.createdOrderId,
          attemptDate: new Date().toLocaleString('es-AR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          }),
          amount: new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS'
          }).format(this.total()),
          paymentMethod: `${this.paymentMethodInfo?.name || 'Tarjeta'} terminada en ${lastFourDigits}`,
          failureReason: errorMessage
        }
      });
    } else {
      // Show error in snackbar if no order was created
      this.snackBar.open(errorMessage, '', {
        duration: 5000,
        horizontalPosition: 'end',
        verticalPosition: 'top'
      });
    }
  }

  /**
   * Navigate to specific step
   */
  goToStep(step: number): void {
    this.checkoutService.goToStep(step);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /**
   * Format card number with spaces
   */
  formatCardNumber(event: Event): void {
    const target = event.target as HTMLInputElement;
    const value = target.value.replace(/\D/g, '');
    const formatted = value.match(/.{1,4}/g)?.join(' ') || value;
    this.paymentForm.patchValue({ cardNumber: formatted.substring(0, 19) }, { emitEvent: true });
  }

  /**
   * Format CVV - numbers only
   */
  formatCVV(event: Event): void {
    const target = event.target as HTMLInputElement;
    const value = target.value.replace(/\D/g, '').substring(0, 4);
    this.paymentForm.patchValue({ cvv: value }, { emitEvent: false });
  }

  /**
   * Format expiration month
   */
  formatExpirationMonth(event: Event): void {
    const target = event.target as HTMLInputElement;
    let value = target.value.replace(/\D/g, '').substring(0, 2);
    if (value.length === 2) {
      const month = parseInt(value, 10);
      if (month < 1) value = '01';
      if (month > 12) value = '12';
    }
    this.paymentForm.patchValue({ expirationMonth: value }, { emitEvent: false });
  }

  /**
   * Format expiration year
   */
  formatExpirationYear(event: Event): void {
    const target = event.target as HTMLInputElement;
    const value = target.value.replace(/\D/g, '').substring(0, 2);
    this.paymentForm.patchValue({ expirationYear: value }, { emitEvent: false });
  }

  /**
   * Process order (called from template)
   */
  private processOrder(): void {
    this.placeOrder();
  }

  /**
   * Get last 4 digits of card number for display
   */
  getLastFourDigits(cardNumber: string | null | undefined): string {
    if (!cardNumber) return '****';
    const sanitized = cardNumber.replace(/\s/g, '');
    return sanitized.slice(-4);
  }
}
