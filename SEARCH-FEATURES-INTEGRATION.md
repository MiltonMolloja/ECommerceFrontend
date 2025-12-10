# 🔍 Search Features - Guía de Integración

Este documento explica cómo integrar todas las nuevas características de búsqueda implementadas en el frontend.

## 📦 Características Implementadas

1. ✅ **Search Bar con Autocomplete** - Búsqueda en tiempo real con sugerencias
2. ✅ **Historial de Búsqueda** - Últimas 10 búsquedas guardadas
3. ✅ **"Did You Mean?"** - Sugerencias de corrección ortográfica
4. ✅ **Búsquedas Relacionadas** - Chips con búsquedas similares
5. ✅ **Búsquedas Guardadas** - Guardar filtros favoritos con nombre
6. ✅ **Persistencia en URL** - Compartir búsquedas con filtros

---

## 1. Search Bar con Autocomplete

### 📁 Ubicación
`src/app/shared/components/search-bar/`

### ✅ Ya Integrado
El componente ya está integrado en el navbar principal (`main-layout.component.html`)

### Características
- Autocomplete con debounce de 300ms
- Muestra productos con imagen y precio
- Historial de búsquedas cuando no hay query
- Loading spinner
- Click en producto → navega a detalle
- Enter → busca el texto

---

## 2. Historial de Búsqueda

### 📁 Ubicación
`src/app/core/services/search-history.service.ts`

### ✅ Ya Integrado
Se integra automáticamente con el SearchBarComponent

### Características
- Máximo 10 búsquedas
- Almacenado en localStorage
- Previene duplicados (case-insensitive)
- Botón para eliminar individuales
- Botón para limpiar todo

---

## 3. "Did You Mean?" y Búsquedas Relacionadas

### 📁 Ubicación
`src/app/features/product-search/components/search-suggestions/`

### 🔧 Cómo Integrar en `search-results.component.ts`

#### Paso 1: Importar el componente
```typescript
import { SearchSuggestionsComponent } from '../search-suggestions/search-suggestions.component';

@Component({
  imports: [
    // ... otros imports
    SearchSuggestionsComponent
  ]
})
```

#### Paso 2: Agregar signals
```typescript
export class SearchResultsComponent {
  // Agregar estas dos signals
  didYouMean = signal<string | undefined>(undefined);
  relatedSearches = signal<string[]>([]);
}
```

#### Paso 3: Capturar metadata en `performSearch`
```typescript
public performSearch(params: SearchParams): void {
  // ... código existente ...

  this.productSearchService
    .searchProducts(params)
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (response) => {
        // ... código existente de productos y filtros ...

        // AGREGAR ESTO:
        if (response.metadata) {
          this.didYouMean.set(response.metadata.didYouMean);
          this.relatedSearches.set(response.metadata.relatedSearches || []);
        }

        this.loading.set(false);
      }
    });
}
```

#### Paso 4: Agregar métodos de handlers
```typescript
onSuggestionClick(suggestion: string): void {
  // Navegar con la sugerencia
  this.router.navigate(['/s'], {
    queryParams: { k: suggestion }
  });
}

onRelatedSearchClick(search: string): void {
  // Navegar con búsqueda relacionada
  this.router.navigate(['/s'], {
    queryParams: { k: search }
  });
}
```

#### Paso 5: Agregar en `search-results.component.html`
```html
<!-- Agregar DESPUÉS del breadcrumb y ANTES de los filtros -->
<app-search-suggestions
  [didYouMean]="didYouMean()"
  [relatedSearches]="relatedSearches()"
  [currentQuery]="searchQuery()"
  (suggestionClick)="onSuggestionClick($event)"
  (relatedSearchClick)="onRelatedSearchClick($event)"
></app-search-suggestions>
```

---

## 4. Búsquedas Guardadas

### 📁 Ubicación
- Servicio: `src/app/core/services/saved-searches.service.ts`
- Menú: `src/app/shared/components/saved-searches-menu/`
- Diálogo: `src/app/shared/components/save-search-dialog/`

### 🔧 Cómo Integrar

#### Opción A: En el Navbar (Recomendado)

Editar `main-layout.component.html`:

```html
<!-- Agregar después del language switcher -->
<app-saved-searches-menu
  (searchSelected)="onSavedSearchSelected($event)"
></app-saved-searches-menu>
```

Agregar en `main-layout.component.ts`:

```typescript
import { SavedSearchesMenuComponent } from '../../shared/components/saved-searches-menu/saved-searches-menu.component';
import { SavedSearch } from '../../core/services/saved-searches.service';

@Component({
  imports: [
    // ... otros
    SavedSearchesMenuComponent
  ]
})
export class MainLayoutComponent {
  onSavedSearchSelected(search: SavedSearch): void {
    const queryParams: any = { k: search.query };

    if (search.filters.categories?.length) {
      queryParams.categories = search.filters.categories.join(',');
    }
    if (search.filters.brands?.length) {
      queryParams.brands = search.filters.brands.join(',');
    }
    if (search.filters.minPrice) {
      queryParams.minPrice = search.filters.minPrice;
    }
    if (search.filters.maxPrice) {
      queryParams.maxPrice = search.filters.maxPrice;
    }
    // ... otros filtros según necesites

    this.router.navigate(['/s'], { queryParams });
  }
}
```

#### Opción B: Botón "Guardar" en search-results

Agregar en `search-results.component.ts`:

```typescript
import { MatDialog } from '@angular/material/dialog';
import { SaveSearchDialogComponent } from '../save-search-dialog/save-search-dialog.component';
import { SavedSearchesService } from '../../../core/services/saved-searches.service';

export class SearchResultsComponent {
  private dialog = inject(MatDialog);
  private savedSearchesService = inject(SavedSearchesService);

  onSaveSearch(): void {
    const filterCount = this.getActiveFilterCount();

    const dialogRef = this.dialog.open(SaveSearchDialogComponent, {
      width: '450px',
      data: {
        query: this.searchQuery(),
        filterCount: filterCount
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.savedSearchesService.saveSearch({
          name: result.name,
          query: this.searchQuery(),
          filters: this.getCurrentFilters()
        });

        // Mostrar mensaje de confirmación
        this.snackBar.open('Búsqueda guardada', 'Cerrar', { duration: 3000 });
      }
    });
  }

  private getCurrentFilters() {
    // Extraer filtros actuales de currentSearchParams
    return {
      categories: this.currentSearchParams?.categoryIds,
      brands: this.currentSearchParams?.brandIds,
      minPrice: this.currentSearchParams?.minPrice,
      maxPrice: this.currentSearchParams?.maxPrice,
      // ... otros filtros
    };
  }

  private getActiveFilterCount(): number {
    let count = 0;
    if (this.currentSearchParams?.categoryIds?.length) count++;
    if (this.currentSearchParams?.brandIds?.length) count++;
    if (this.currentSearchParams?.minPrice) count++;
    if (this.currentSearchParams?.maxPrice) count++;
    // ... contar otros filtros
    return count;
  }
}
```

Agregar botón en HTML:

```html
<button
  mat-raised-button
  color="accent"
  (click)="onSaveSearch()"
  [disabled]="!hasResults()"
>
  <mat-icon>bookmark_add</mat-icon>
  Guardar búsqueda
</button>
```

---

## 5. Persistencia de Filtros en URL

### 📁 Ubicación
`src/app/features/product-search/services/url-sync.service.ts`

### 🔧 Cómo Integrar en `search-results.component.ts`

#### Paso 1: Inyectar servicio
```typescript
import { UrlSyncService } from '../../services/url-sync.service';

export class SearchResultsComponent {
  private urlSyncService = inject(UrlSyncService);
}
```

#### Paso 2: Sincronizar cuando cambien filtros
```typescript
onFilterChange(filters: any): void {
  // Convertir filtros al formato UrlFilters
  const urlFilters: UrlFilters = {
    query: this.searchQuery(),
    categories: filters.categoryIds,
    brands: filters.brandIds,
    minPrice: filters.minPrice,
    maxPrice: filters.maxPrice,
    minRating: filters.minRating,
    inStock: filters.inStock,
    hasDiscount: filters.hasDiscount,
    sortBy: filters.sortBy,
    sortOrder: filters.sortOrder,
    page: this.currentPage(),
    attributes: filters.attributes
  };

  // Sincronizar con URL (replaceUrl: true para no agregar a history)
  this.urlSyncService.syncFiltersToUrl(urlFilters, true);

  // Realizar búsqueda
  this.performSearch(filters);
}
```

#### Paso 3: Parsear filtros desde URL en `initializeFromQueryParams`
```typescript
private initializeFromQueryParams(): void {
  this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe((params) => {
    // Usar el servicio para parsear
    const urlFilters = this.urlSyncService.parseFiltersFromUrl(params);

    // Convertir a SearchParams
    const searchParams: SearchParams = {
      query: urlFilters.query || '',
      categoryIds: urlFilters.categories,
      brandIds: urlFilters.brands,
      minPrice: urlFilters.minPrice,
      maxPrice: urlFilters.maxPrice,
      minRating: urlFilters.minRating,
      inStock: urlFilters.inStock,
      hasDiscount: urlFilters.hasDiscount,
      sortBy: urlFilters.sortBy || 'relevance',
      sortOrder: urlFilters.sortOrder || 'asc',
      page: urlFilters.page || 1,
      pageSize: urlFilters.pageSize || 20,
      attributes: urlFilters.attributes
    };

    this.searchQuery.set(urlFilters.query || '');
    this.performSearch(searchParams);
  });
}
```

---

## 6. Botón para Compartir Búsqueda

### 📁 Ubicación
`src/app/features/product-search/components/share-search-button/`

### 🔧 Cómo Integrar

Agregar en `search-results.component.html`:

```html
<!-- En el header, junto a otros botones -->
<app-share-search-button
  [filters]="{
    query: searchQuery(),
    categories: currentSearchParams?.categoryIds,
    brands: currentSearchParams?.brandIds,
    minPrice: currentSearchParams?.minPrice,
    maxPrice: currentSearchParams?.maxPrice
  }"
  [disabled]="!hasResults()"
></app-share-search-button>
```

Importar en el componente:

```typescript
import { ShareSearchButtonComponent } from '../share-search-button/share-search-button.component';

@Component({
  imports: [
    // ... otros
    ShareSearchButtonComponent
  ]
})
```

---

## 📊 Resumen de Archivos

### Nuevos Componentes
```
src/app/
├── shared/components/
│   ├── search-bar/                      ← Autocomplete + historial
│   ├── saved-searches-menu/             ← Menú de búsquedas guardadas
│   └── save-search-dialog/              ← Diálogo para guardar
├── features/product-search/components/
│   ├── search-suggestions/              ← Did you mean + relacionadas
│   └── share-search-button/             ← Botón compartir
└── core/services/
    ├── search-history.service.ts        ← Historial localStorage
    └── saved-searches.service.ts        ← Búsquedas guardadas
```

### Nuevos Servicios
```
src/app/features/product-search/services/
└── url-sync.service.ts                  ← Sincronización URL
```

---

## 🎨 Personalización

### Cambiar cantidad de sugerencias en autocomplete
`search-bar.component.ts`:
```typescript
return this.searchService.searchProducts({
  query: query.trim(),
  page: 1,
  pageSize: 5  // ← Cambiar aquí (máximo recomendado: 10)
});
```

### Cambiar cantidad de búsquedas en historial
`search-history.service.ts`:
```typescript
const MAX_HISTORY_ITEMS = 10;  // ← Cambiar aquí
```

### Cambiar cantidad de búsquedas guardadas
`saved-searches.service.ts`:
```typescript
const MAX_SAVED_SEARCHES = 20;  // ← Cambiar aquí
```

---

## 🧪 Testing

### Probar Autocomplete
1. Ir al navbar
2. Escribir > 2 caracteres en el search bar
3. Ver sugerencias aparecer
4. Click en un producto → debe navegar al detalle
5. Click en una búsqueda del historial → debe buscar

### Probar Did You Mean
1. Buscar algo mal escrito: "laptpo"
2. El backend debe devolver `didYouMean: "laptop"`
3. Ver banner amarillo con sugerencia
4. Click en la sugerencia → debe buscar correctamente

### Probar Búsquedas Guardadas
1. Click en el botón de bookmark en navbar
2. Ver menú vacío
3. En search results, click en "Guardar búsqueda"
4. Ingresar nombre
5. Guardar
6. Volver al menú → debe aparecer
7. Click en la búsqueda → debe aplicar filtros

### Probar URL Sharing
1. Aplicar varios filtros en búsqueda
2. Ver que la URL se actualiza con query params
3. Copiar URL
4. Abrir en nueva pestaña → debe mantener filtros
5. Click en botón compartir → debe copiar URL

---

## 🐛 Troubleshooting

### Autocomplete no muestra sugerencias
- Verificar que el backend está corriendo
- Abrir DevTools > Network > verificar request a `/api/products/search`
- Verificar que el query tiene > 2 caracteres

### Historial no persiste
- Verificar localStorage en DevTools > Application
- Buscar key: `search_history`
- Si está bloqueado por privacy settings, no funcionará

### Did You Mean no aparece
- Verificar que el backend devuelve `metadata.didYouMean`
- Verificar en DevTools > Network > Response

### URL no se actualiza
- Verificar que `UrlSyncService` está siendo inyectado
- Verificar que `syncFiltersToUrl` se llama después de cambiar filtros
- Revisar console por errores de routing

---

## ✅ Checklist de Integración

- [ ] Search Bar integrado en navbar
- [ ] Historial funciona correctamente
- [ ] SearchSuggestionsComponent agregado a search-results
- [ ] signals `didYouMean` y `relatedSearches` agregados
- [ ] Metadata capturada en `performSearch`
- [ ] SavedSearchesMenu agregado al navbar
- [ ] Handler `onSavedSearchSelected` implementado
- [ ] Botón "Guardar búsqueda" agregado (opcional)
- [ ] UrlSyncService inyectado en search-results
- [ ] `syncFiltersToUrl` llamado al cambiar filtros
- [ ] `parseFiltersFromUrl` usado en `initializeFromQueryParams`
- [ ] ShareSearchButton agregado (opcional)
- [ ] Traducciones verificadas (ES/EN)
- [ ] Testing completo realizado

---

## 📞 Soporte

Si encuentras algún problema:
1. Revisar la console del navegador por errores
2. Verificar que todos los imports están correctos
3. Verificar que los servicios están en `providedIn: 'root'`
4. Verificar que el backend está devolviendo los campos correctos

---

**Última actualización**: 2025-01-02
