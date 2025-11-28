# Integración de Pagos - Frontend

Este documento explica cómo integrar el sistema de pagos con MercadoPago desde el frontend de ECommerce.

## Modelos de TypeScript

### PaymentMethod Enum

```typescript
export enum PaymentMethod {
  CreditCard = 1,
  DebitCard = 2,
  MercadoPago = 3,
  Cash = 4
}
```

### ProcessPaymentRequest Interface

```typescript
export interface ProcessPaymentRequest {
  orderId: number;           // ID de la orden creada
  paymentMethodId: string;   // ID del método de pago (ej: "master", "visa", "amex")
  token: string;             // Token de MercadoPago
  installments: number;      // Número de cuotas
  billingAddress: string;    // Dirección de facturación
  billingCity: string;       // Ciudad
  billingCountry: string;    // País
  billingZipCode: string;    // Código postal
}
```

**IMPORTANTE:** El `userId` ya NO se incluye en el request. El backend lo extrae automáticamente del token JWT por seguridad.

## Ejemplo de Uso en el Componente de Checkout

### 1. Importar los servicios necesarios

```typescript
import { PaymentService } from '@core/services/payment.service';
import { ProcessPaymentRequest, PaymentMethod } from '@core/models/payment/payment.model';
```

### 2. Inyectar el servicio

```typescript
export class CheckoutComponent {
  private paymentService = inject(PaymentService);
  // ... otros servicios
}
```

### 3. Procesar el pago después de tokenizar con MercadoPago

```typescript
async processPayment(orderId: number, token: string, paymentMethodId: string) {
  // Preparar el request de pago
  const paymentRequest: ProcessPaymentRequest = {
    orderId: orderId,
    paymentMethodId: paymentMethodId,  // ej: "master", "visa", "amex"
    token: token,
    installments: 1,  // Número de cuotas (1 = pago único)
    billingAddress: this.checkoutForm.value.address,
    billingCity: this.checkoutForm.value.city,
    billingCountry: this.checkoutForm.value.country,
    billingZipCode: this.checkoutForm.value.zipCode
  };

  // Enviar al backend
  this.paymentService.processPayment(paymentRequest).subscribe({
    next: (response) => {
      if (response.success) {
        console.log('Pago procesado exitosamente');
        // Redirigir a página de confirmación
        this.router.navigate(['/orders', orderId]);
      } else {
        console.error('Error procesando pago:', response.message);
      }
    },
    error: (error) => {
      console.error('Error en la solicitud de pago:', error);
    }
  });
}
```

## Flujo Completo de Checkout con MercadoPago

### 1. Tokenizar la tarjeta con MercadoPago SDK

```typescript
// Usar el SDK de MercadoPago para tokenizar
const cardToken = await this.mercadoPagoService.createCardToken(cardData);
```

### 2. Crear la orden

```typescript
const order = await this.orderService.createOrder(orderData).toPromise();
```

### 3. Procesar el pago con el token

```typescript
const paymentRequest: ProcessPaymentRequest = {
  orderId: order.id,
  paymentMethodId: cardToken.payment_method_id,  // Viene del token de MercadoPago
  token: cardToken.id,
  installments: 1,
  billingAddress: '...',
  billingCity: '...',
  billingCountry: '...',
  billingZipCode: '...'
};

this.paymentService.processPayment(paymentRequest).subscribe(/* ... */);
```

## Ejemplo de cURL para Testing

```bash
curl -X 'POST' \
  'http://localhost:45000/payments/process' \
  -H 'accept: */*' \
  -H 'Accept-Language: es' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
  "orderId": 1046,
  "paymentMethodId": "master",
  "token": "54a8dea1ba01a73a0d120b52c097c92e",
  "installments": 1,
  "billingAddress": "Av. Corrientes 1234",
  "billingCity": "Buenos Aires",
  "billingCountry": "Argentina",
  "billingZipCode": "C1043"
}'
```

## Seguridad

- ✅ El `userId` se extrae del token JWT en el backend (no se envía desde el frontend)
- ✅ Todos los endpoints de pago requieren autenticación JWT
- ✅ El token de MercadoPago se usa solo una vez y expira
- ✅ Los datos de tarjeta nunca pasan por nuestro backend (tokenización en MercadoPago)

## Manejo de Errores

### Errores Comunes

| Error | Causa | Solución |
|-------|-------|----------|
| 401 Unauthorized | Token JWT inválido o expirado | Renovar el token o hacer login nuevamente |
| 400 Bad Request | Datos inválidos en el request | Validar todos los campos requeridos |
| 500 Internal Server Error | Error en el procesamiento del pago | Verificar logs del backend |

### Ejemplo de Manejo de Errores

```typescript
this.paymentService.processPayment(paymentRequest).subscribe({
  next: (response) => {
    if (response.success) {
      this.showSuccess('Pago procesado exitosamente');
    } else {
      this.showError(`Error: ${response.message}`);
    }
  },
  error: (error) => {
    if (error.status === 401) {
      this.showError('Tu sesión ha expirado. Por favor inicia sesión nuevamente.');
      this.router.navigate(['/auth/login']);
    } else if (error.status === 400) {
      this.showError('Datos de pago inválidos. Por favor verifica la información.');
    } else {
      this.showError('Error procesando el pago. Por favor intenta nuevamente.');
    }
  }
});
```

## Testing

### Tarjetas de Prueba de MercadoPago

Para ambiente de prueba, usar estas tarjetas:

**Visa - Aprobada**
- Número: 4509 9535 6623 3704
- CVV: 123
- Fecha: 11/25
- Nombre: APRO

**Mastercard - Aprobada**
- Número: 5031 7557 3453 0604
- CVV: 123
- Fecha: 11/25
- Nombre: APRO

**Visa - Rechazada**
- Número: 4074 5957 4459 5763
- CVV: 123
- Fecha: 11/25
- Nombre: OTHE

## Referencias

- [MercadoPago SDK Documentation](https://www.mercadopago.com.ar/developers/es/docs/checkout-api/landing)
- [Tarjetas de Prueba](https://www.mercadopago.com.ar/developers/es/docs/checkout-api/testing)
- [PCI-DSS Compliance](https://www.pcisecuritystandards.org/)
