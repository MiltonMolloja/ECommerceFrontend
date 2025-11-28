# Configuración HTTPS para Desarrollo Local

Este documento explica cómo ejecutar el frontend de ECommerce con HTTPS habilitado, necesario para la integración con MercadoPago.

## ¿Por qué HTTPS?

MercadoPago requiere HTTPS (SSL/TLS) para tokenizar tarjetas de crédito, incluso en modo de prueba. Esto es parte de los requisitos de seguridad PCI-DSS.

## Configuración Actual

El proyecto ya está configurado para usar HTTPS automáticamente. Angular CLI generará certificados autofirmados en el primer inicio.

### Archivo `angular.json`

La configuración SSL ya está habilitada:

```json
"serve": {
  "builder": "@angular/build:dev-server",
  "options": {
    "ssl": true,
    "port": 4200
  }
}
```

## Cómo Ejecutar con HTTPS

### Método 1: Usando npm start (Recomendado)

```bash
cd C:\Source\ECommerceFrontend
npm start
```

El servidor se iniciará en: **https://localhost:4200**

### Método 2: Usando ng serve directamente

```bash
cd C:\Source\ECommerceFrontend
ng serve
```

### Método 3: Con puerto personalizado

```bash
ng serve --ssl --port 4300
```

## Advertencia de Certificado

La primera vez que accedas a `https://localhost:4200`, el navegador mostrará una advertencia de seguridad porque el certificado es autofirmado.

### Chrome/Edge:
1. Haz clic en "Avanzado"
2. Haz clic en "Continuar a localhost (no seguro)"

### Firefox:
1. Haz clic en "Avanzado"
2. Haz clic en "Aceptar el riesgo y continuar"

## Credenciales de MercadoPago

El proyecto usa credenciales de **TEST** de MercadoPago configuradas en:

**Archivo**: `src/environments/environment.ts`

```typescript
mercadoPagoPublicKey: 'APP_USR-8ca245f1-7586-4db6-ba30-93c030fb147a'
```

### Tarjetas de Prueba

Para probar pagos, usa las tarjetas de prueba de MercadoPago:

| Tarjeta | Número | CVV | Fecha | Resultado |
|---------|--------|-----|-------|-----------|
| Visa | 4509 9535 6623 3704 | 123 | 11/25 | Aprobado |
| Mastercard | 5031 7557 3453 0604 | 123 | 11/25 | Aprobado |
| Visa | 4074 5957 4459 5763 | 123 | 11/25 | Rechazado |

**Datos del titular**:
- Nombre: APRO (aprobado) o OTHE (rechazado)
- DNI: 12345678
- Email: test_user_123@testuser.com

## Verificar que HTTPS está funcionando

1. Abre la consola del navegador (F12)
2. Ve a la pestaña "Network" o "Red"
3. Verifica que las URLs comiencen con `https://localhost:4200`
4. No debes ver el error: "SSL certificate is required to operate"

## Troubleshooting

### Error: "Cannot find module '@angular/build'"

```bash
npm install
```

### Puerto 4200 ya en uso

```bash
# Detener el proceso en el puerto 4200
netstat -ano | findstr :4200
taskkill /PID [PID] /F

# O usar otro puerto
ng serve --ssl --port 4300
```

### Certificado no confiable

El certificado autofirmado es normal para desarrollo local. Los navegadores modernos permiten continuar después de la advertencia.

## Flujo de Checkout con HTTPS

1. Usuario completa el formulario de checkout
2. Frontend tokeniza la tarjeta con MercadoPago SDK (requiere HTTPS)
3. Se crea la orden en el backend
4. Se procesa el pago con el token
5. Redirección a confirmación de orden

## Archivos Relacionados

- `angular.json` - Configuración SSL del servidor de desarrollo
- `src/environments/environment.ts` - Credenciales de MercadoPago
- `src/app/features/checkout/checkout.ts` - Lógica de checkout y tokenización
- `src/app/core/services/mercadopago.service.ts` - Integración con MercadoPago SDK

## Referencias

- [MercadoPago SDK Documentation](https://www.mercadopago.com.ar/developers/es/docs/checkout-api/landing)
- [Tarjetas de Prueba MercadoPago](https://www.mercadopago.com.ar/developers/es/docs/checkout-api/testing)
- [Angular HTTPS Configuration](https://angular.dev/tools/cli/serve)
