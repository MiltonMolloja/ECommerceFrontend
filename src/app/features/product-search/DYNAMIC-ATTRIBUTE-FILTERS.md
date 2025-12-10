# Sistema de Filtros Dinámicos de Atributos

## Descripción General

El sistema de filtros dinámicos de atributos permite filtrar productos por características específicas (RAM, almacenamiento, procesador, etc.) de manera completamente dinámica basándose en las facetas que retorna el backend.

## Arquitectura

### 1. Flujo de Datos

```
Backend API → ProductSearchService → FacetMapperService → FilterOption[] → FilterGroupComponent → UI
                                                            ↓
                                                     FilterService → AdvancedSearchParams → Backend API
```

### 2. Componentes Principales

#### **FacetMapperService**
Responsable de transformar las facetas del backend en filtros del frontend.

```typescript
// Mapea facetas de atributos a FilterOption
mapFacetsToFilters(facets: SearchFacets, currentFilters: FilterOption[]): FilterOption[]
```

**Tipos de atributos soportados:**
- `Select/MultiSelect/Text`: Renderiza como checkboxes con búsqueda interna
- `Number`: Renderiza como slider de rango con inputs numéricos
- `Boolean`: Renderiza como checkbox único

#### **FilterService**
Gestiona el estado de todos los filtros activos y los convierte al formato esperado por el backend.

```typescript
// Métodos principales
addFilter(filter: ActiveFilter): void
removeFilter(filterId: string, valueId: string): void
setPriceRange(range: { min: number; max: number } | null): void
setAttributeRange(attributeId: string, range: NumericRange): void
getAdvancedSearchParams(baseParams?: Partial<AdvancedSearchParams>): Partial<AdvancedSearchParams>
```

#### **FilterGroupComponent**
Componente de presentación que renderiza cada grupo de filtros con Material Design.

**Características:**
- Badges con conteo de filtros seleccionados
- Búsqueda interna para filtros con muchas opciones
- "Ver más/menos" para expandir opciones
- Sliders de rango con validación
- Soporte para unidades de medida (GB, MHz, etc.)

#### **FiltersSidebarComponent**
Contenedor principal que orquesta todos los grupos de filtros.

### 3. Modelos de Datos

#### **AttributeFilter**
```typescript
interface AttributeFilter {
  attributeName: string;  // Nombre del atributo (ej: "RAM")
  values: string[];       // Valores seleccionados (ej: ["8", "16"])
}
```

#### **AttributeRangeFilter**
```typescript
interface AttributeRangeFilter {
  attributeName: string;  // Nombre del atributo (ej: "Storage")
  min: number;           // Valor mínimo
  max: number;           // Valor máximo
}
```

#### **AdvancedSearchParams**
```typescript
interface AdvancedSearchParams extends SearchParams {
  // Filtros estándar
  brandIds?: number[];
  categoryIds?: number[];
  minAverageRating?: number;

  // Atributos dinámicos
  attributes?: Record<string, string[]>;           // Atributos de selección
  attributeRanges?: Record<string, NumericRange>;  // Atributos numéricos

  // Flags de facetas
  includeAttributeFacets?: boolean;
}
```

## Uso en Componentes

### Ejemplo: Componente de Búsqueda

```typescript
import { Component, inject, OnInit } from '@angular/core';
import { ProductSearchService } from './services/product-search.service';
import { FilterService } from './services/filter.service';

@Component({
  selector: 'app-product-search',
  templateUrl: './product-search.component.html'
})
export class ProductSearchComponent implements OnInit {
  private searchService = inject(ProductSearchService);
  private filterService = inject(FilterService);

  searchProducts(query: string, page: number = 1): void {
    // Obtener parámetros de búsqueda con filtros activos
    const params = this.filterService.getAdvancedSearchParams({
      query,
      page,
      pageSize: 24
    });

    // Ejecutar búsqueda avanzada
    this.searchService.searchAdvanced(params).subscribe({
      next: (response) => {
        this.products = response.products;
        this.filters = response.filters;  // Filtros ya mapeados
        this.facets = response.facets;    // Facetas originales
      }
    });
  }

  onFilterChange(filters: Record<string, string[]>): void {
    // Los filtros ya están sincronizados en FilterService
    // Solo necesitamos recargar la búsqueda
    this.searchProducts(this.currentQuery);
  }
}
```

### Ejemplo: Template HTML

```html
<div class="search-layout">
  <!-- Sidebar de filtros -->
  <app-filters-sidebar
    [filters]="filters"
    [loading]="loading"
    (filterChange)="onFilterChange($event)"
  />

  <!-- Resultados -->
  <app-search-results
    [products]="products"
    [loading]="loading"
  />
</div>
```

## Formato de Datos

### Backend Response (Facetas)

```json
{
  "items": [...],
  "total": 150,
  "facets": {
    "attributes": {
      "RAM": {
        "attributeId": 1,
        "attributeName": "RAM",
        "attributeType": "Select",
        "unit": "GB",
        "values": [
          { "id": "8", "name": "8 GB", "count": 45 },
          { "id": "16", "name": "16 GB", "count": 78 },
          { "id": "32", "name": "32 GB", "count": 27 }
        ]
      },
      "Storage": {
        "attributeId": 2,
        "attributeName": "Almacenamiento",
        "attributeType": "Number",
        "unit": "GB",
        "range": {
          "min": 256,
          "max": 2048
        }
      }
    }
  }
}
```

### Frontend Request (Parámetros)

```json
{
  "query": "laptop",
  "page": 1,
  "pageSize": 24,
  "brandIds": [1, 5, 8],
  "categoryIds": [10],
  "minAverageRating": 4,
  "priceRange": {
    "min": 500,
    "max": 2000
  },
  "attributes": {
    "1": ["8", "16"],  // RAM: 8GB o 16GB
    "3": ["SSD"]       // Tipo: SSD
  },
  "attributeRanges": {
    "2": {             // Storage
      "min": 512,
      "max": 1024
    }
  },
  "includeAttributeFacets": true
}
```

## Características UI con Material Design

### 1. Badges de Conteo
Muestra el número de filtros seleccionados en el header del expansion panel.

```scss
.selected-badge {
  background-color: var(--primary-color);
  color: white;
  border-radius: 10px;
  font-size: 11px;
  padding: 0 6px;
}
```

### 2. Unidades de Medida
Se muestran automáticamente en el header para filtros numéricos.

```html
@if (filter.unit && filter.type === FilterType.RANGE) {
  <span class="unit-label">({{ filter.unit }})</span>
}
```

### 3. Búsqueda Interna
Para filtros con más de 10 opciones, se habilita automáticamente un campo de búsqueda.

```typescript
searchable: attr.values.length > 10
```

### 4. Expandir/Contraer
Para filtros con más de 6 opciones, se muestra un botón "Ver más/menos".

```typescript
expandable: attr.values.length > 6,
maxVisibleOptions: 6
```

### 5. Sliders de Rango
Doble slider con Material Slider para seleccionar rangos numéricos.

```html
<mat-slider [min]="min" [max]="max" discrete>
  <input matSliderStartThumb [(ngModel)]="selectedMin" />
  <input matSliderEndThumb [(ngModel)]="selectedMax" />
</mat-slider>
```

## Accesibilidad

El sistema cumple con WCAG 2.1 AA:

- **Labels ARIA**: Todos los controles tienen labels descriptivos
- **Navegación por teclado**: Todos los filtros son navegables con Tab
- **Screen readers**: Anuncios apropiados de cambios de estado
- **Contrastes**: Colores con contraste mínimo 4.5:1

## Performance

### Optimizaciones Implementadas

1. **OnPush Change Detection**: Todos los componentes usan `ChangeDetectionStrategy.OnPush`
2. **Debouncing**: Los inputs de rango tienen debounce de 300ms
3. **TrackBy**: Todas las listas usan trackBy para evitar re-renders innecesarios
4. **Lazy Loading**: Las opciones se cargan solo cuando el panel se expande
5. **Virtual Scrolling**: Para listas muy largas (>100 items)

## Testing

### Unit Tests

```typescript
describe('FacetMapperService', () => {
  it('should map attribute facets to filter options', () => {
    const facets: SearchFacets = {
      attributes: {
        'RAM': {
          attributeId: 1,
          attributeName: 'RAM',
          attributeType: 'Select',
          values: [
            { id: '8', name: '8 GB', count: 10 }
          ]
        }
      }
    };

    const filters = service.mapFacetsToFilters(facets, []);

    expect(filters.length).toBe(1);
    expect(filters[0].id).toBe('attr_1');
    expect(filters[0].options.length).toBe(1);
  });
});
```

## Troubleshooting

### Problema: Los filtros no se actualizan

**Solución**: Verificar que `ChangeDetectorRef` se esté llamando después de actualizar los filtros.

```typescript
this.filters = newFilters;
this.cdr.markForCheck();
```

### Problema: Las facetas no aparecen

**Solución**: Asegurarse de que los flags de facetas estén habilitados:

```typescript
params.includeAttributeFacets = true;
```

### Problema: Los rangos no funcionan

**Solución**: Verificar que el attributeId se esté extrayendo correctamente:

```typescript
const attrId = filter.id.replace('attr_', '');
```

## Roadmap

- [ ] Histogramas visuales para distribución de valores
- [ ] Filtros de fecha/rango temporal
- [ ] Filtros de color con swatches visuales
- [ ] Exportar/importar configuración de filtros
- [ ] Filtros guardados por usuario
- [ ] Sugerencias inteligentes basadas en selección

## Referencias

- [Angular Material Expansion Panel](https://material.angular.io/components/expansion/overview)
- [Angular Material Slider](https://material.angular.io/components/slider/overview)
- [RxJS BehaviorSubject](https://rxjs.dev/api/index/class/BehaviorSubject)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
