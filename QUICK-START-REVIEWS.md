# Quick Start - Sistema de Reviews y Ratings

Guía rápida para comenzar a usar el sistema de reviews en 5 minutos.

## Paso 1: Importar el Componente

En tu componente de detalle de producto:

```typescript
import { Component } from '@angular/core';
import { ProductReviewsComponent } from './shared/components/product-reviews';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [ProductReviewsComponent],
  template: `
    <div class="container">
      <!-- Tu contenido del producto aquí -->

      <!-- Sistema de Reviews - ¡Eso es todo! -->
      <app-product-reviews
        [productId]="productId"
        [pageSize]="10"
        [showSummary]="true">
      </app-product-reviews>
    </div>
  `
})
export class ProductDetailComponent {
  productId = 123; // O desde tu ruta/servicio
}
```

## Paso 2: Verificar la Configuración del Environment

Asegúrate de que `src/environments/environment.ts` tenga:

```typescript
export const environment = {
  apiGatewayUrl: 'http://localhost:45000', // Tu API Gateway
  // ... resto de configuración
};
```

## Paso 3: ¡Listo!

El componente ahora:
- ✅ Cargará automáticamente las reviews del producto
- ✅ Mostrará el resumen de ratings con estrellas
- ✅ Incluirá paginación automática
- ✅ Permitirá ordenar por fecha, rating, útiles
- ✅ Mostrará badges de compra verificada
- ✅ Incluirá botones de helpful/not helpful

## Ejemplos de Uso

### Solo mostrar el resumen (sin lista completa)

```typescript
import { RatingSummaryComponent } from './shared/components/rating-summary';

@Component({
  selector: 'app-product-card',
  imports: [RatingSummaryComponent],
  template: `
    <app-rating-summary
      [ratingSummary]="summary"
      [showDetails]="false">
    </app-rating-summary>
  `
})
```

### Personalizar el número de items por página

```typescript
<app-product-reviews
  [productId]="123"
  [pageSize]="20"     <!-- 20 reviews por página -->
  [showSummary]="true">
</app-product-reviews>
```

### Ocultar el resumen de ratings

```typescript
<app-product-reviews
  [productId]="123"
  [showSummary]="false">  <!-- Solo lista de reviews -->
</app-product-reviews>
```

## Características Incluidas

### Automáticas (sin configuración)
- Estados de carga
- Manejo de errores
- Paginación
- Ordenamiento
- Filtros
- Responsive design
- Accesibilidad

### Interactivas
- Botones de "útil/no útil"
- Cambio de página
- Cambio de ordenamiento
- Filtro de compras verificadas

## API Endpoints Requeridos

Tu backend debe implementar:

```
GET /api/products/{productId}/reviews
GET /api/products/{productId}/reviews/summary
POST /api/products/{productId}/reviews/{reviewId}/helpful
POST /api/products/{productId}/reviews/{reviewId}/not-helpful
```

### Ejemplo de respuesta esperada:

```json
{
  "productId": 123,
  "items": [
    {
      "reviewId": 1,
      "rating": 5,
      "title": "Excelente",
      "comment": "Me encantó",
      "isVerifiedPurchase": true,
      "helpfulCount": 10,
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ],
  "ratingSummary": {
    "averageRating": 4.5,
    "totalReviews": 100,
    "rating5Star": 60,
    "rating4Star": 25,
    "rating3Star": 10,
    "rating2Star": 3,
    "rating1Star": 2
  },
  "page": 1,
  "totalItems": 100,
  "totalPages": 10
}
```

## Personalización Rápida

### Cambiar color de estrellas

```scss
// En tu styles.scss global
.star-icon {
  color: #ff6b6b !important; // Rojo en lugar de amarillo
}
```

### Ajustar espaciado

```scss
app-product-reviews {
  margin-top: 3rem;
  padding: 0 1rem;
}
```

## Troubleshooting

### Las reviews no cargan
1. Verifica que `apiGatewayUrl` en environment.ts sea correcto
2. Abre DevTools y verifica las llamadas HTTP
3. Asegúrate de que el backend esté corriendo

### Error de CORS
Configura CORS en tu backend para permitir el origen de tu frontend

### Estilos no se ven bien
Asegúrate de tener Angular Material instalado y configurado:

```bash
ng add @angular/material
```

## Próximos Pasos

1. Ver `REVIEWS-USAGE-EXAMPLE.md` para ejemplos avanzados
2. Ver `REVIEWS-SYSTEM-IMPLEMENTATION.md` para detalles técnicos
3. Personalizar estilos según tu marca
4. Implementar formulario para crear reviews

## Archivos Importantes

- **Servicio**: `src/app/core/services/product-review.service.ts`
- **Modelos**: `src/app/core/models/catalog/review.model.ts`
- **Componente principal**: `src/app/shared/components/product-reviews/`
- **Documentación**: `src/app/shared/components/product-reviews/README.md`

## Stack Tecnológico

- Angular 17+ (Standalone Components)
- Angular Material 17+
- RxJS
- TypeScript
- Signals

## Soporte

Si necesitas ayuda, revisa:
1. La documentación completa en los archivos MD
2. Los comentarios JSDoc en el código
3. Los ejemplos en REVIEWS-USAGE-EXAMPLE.md

---

**¡Disfruta tu sistema de reviews!** 🌟
