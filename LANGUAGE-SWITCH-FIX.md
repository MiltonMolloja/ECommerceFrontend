# Fix: Cambio de Idioma en Tiempo Real

## Problema

Cuando el usuario cambiaba el idioma (es ↔ en) en el frontend, los datos no se actualizaban automáticamente:
- ❌ Los banners no cambiaban de idioma sin F5
- ❌ Los nombres de productos permanecían en el idioma anterior
- ❌ Las categorías del dropdown no se actualizaban

## Causa Raíz

El problema era el **caché del frontend** con `shareReplay(1)`:

1. **Caché del Frontend** (`HomeService`):
   - Usaba `shareReplay(1)` para cachear el Observable
   - El Observable cacheado mantenía los datos del idioma anterior
   - Incluso después de limpiar el Map, el Observable seguía vivo en memoria

2. **Caché del Backend** (Redis):
   - ✅ Ya funcionaba correctamente
   - Incluía el idioma en la clave (`home:page:{language}:{productsPerSection}`)
   - El problema era que el frontend nunca llegaba a hacer la petición HTTP

## Solución Implementada

### 1. ✅ Eliminado Caché del Frontend

**Archivo**: `src/app/features/home/services/home.service.ts`

**Cambios**:
```typescript
// ANTES: Caché con shareReplay(1) que causaba problemas
private homePageCache$: Observable<HomePageResponse> | undefined;
return this.http.get<HomePageResponse>(...)
  .pipe(shareReplay(1)); // ❌ Problema: Observable cacheado no se invalida

// DESPUÉS: Sin caché en frontend, delegamos al backend
return this.http.get<HomePageResponse>(...)
  .pipe(
    tap(...),
    catchError(...)
  ); // ✅ Cada petición es nueva, backend cachea en Redis
```

**Beneficios**:
- **Simplicidad**: No duplicamos lógica de caché
- **Correctitud**: Cada cambio de idioma hace una nueva petición HTTP
- **Performance**: El backend cachea en Redis (mucho más rápido que HTTP)
- **Consistencia**: El backend ya incluye el idioma en la clave de Redis

### 2. ✅ Recarga Automática al Cambiar Idioma

**Archivo**: `src/app/features/home/home.component.ts`

**Cambios**:
```typescript
constructor() {
  // Listen for language changes and reload data
  effect(() => {
    const langChangeCount = this.languageService.languageChanged();
    
    // Only reload if initial load has completed (avoid double-loading on startup)
    if (this.initialLoadComplete && langChangeCount > 0) {
      console.log('[HomeComponent] 🌐 Language changed, reloading data...');
      this.loadHomePageData(); // Nueva petición HTTP
    }
  });
}
```

**Flujo**:
1. Usuario cambia idioma (es → en)
2. `LanguageService.setLanguage('en')` incrementa `languageChangeCounter`
3. `effect()` en `HomeComponent` detecta el cambio
4. Llama a `loadHomePageData()` que hace una nueva petición HTTP
5. `languageInterceptor` agrega header `Accept-Language: en`
6. Backend lee el header y devuelve datos en inglés desde Redis

### 3. ✅ Categorías del Dropdown Actualizadas

**Archivo**: `src/app/core/services/categories.ts`

**Cambios**:
```typescript
constructor() {
  // Listen for language changes and reload categories
  effect(() => {
    const langChangeCount = this.languageService.languageChanged();
    
    if (this.initialLoadComplete && langChangeCount > 0) {
      console.log('[CategoriesService] 🌐 Language changed, reloading categories...');
      this.forceReloadCategories();
    }
  });
}
```

**Beneficio**:
- El dropdown de categorías en el header se actualiza automáticamente
- Funciona incluso si el usuario no está en la página Home

### 4. ✅ Logs de Debug

**Archivo**: `src/app/core/interceptors/language.interceptor.ts`

**Cambios**:
```typescript
// Debug log for API requests
if (req.url.includes('/home') || req.url.includes('/catalog')) {
  console.log(`[LanguageInterceptor] 🌐 ${req.method} ${req.url} - Accept-Language: ${language}`);
}
```

**Beneficio**:
- Permite verificar en la consola que el header se está enviando correctamente

## Arquitectura del Sistema

### Frontend (Angular)

```
Usuario cambia idioma (es → en)
         ↓
LanguageService.setLanguage('en')
         ↓
languageChangeCounter se incrementa
         ↓
┌────────────────────────────────────┐
│  effect() en HomeComponent         │ → clearCache() + loadHomePageData()
│  effect() en CategoriesService     │ → forceReloadCategories()
└────────────────────────────────────┘
         ↓
HttpClient con languageInterceptor
         ↓
HTTP Request con Accept-Language: en
```

### Backend (.NET)

```
HTTP Request con Accept-Language: en
         ↓
LanguageMiddleware lee header
         ↓
ILanguageContext.CurrentLanguage = "en"
         ↓
HomeQueryService.GetHomePageDataAsync("en", 8)
         ↓
Busca en Redis: "home:page:en:8"
         ↓
Si no existe en caché:
  - Consulta SQL con localización
  - Mapea Product.NameEnglish → ProductDto.Name
  - Guarda en Redis con clave "home:page:en:8"
         ↓
Retorna datos en inglés
```

## Archivos Modificados

| Archivo | Cambios |
|---------|---------|
| `src/app/features/home/services/home.service.ts` | Caché por idioma usando `Map<string, Observable>` |
| `src/app/features/home/home.component.ts` | `effect()` para escuchar cambios de idioma |
| `src/app/core/services/categories.ts` | `effect()` para recargar categorías |
| `src/app/core/interceptors/language.interceptor.ts` | Logs de debug |

## Verificación

### Consola del Navegador

Al cambiar de idioma, deberías ver:

```
[LanguageService] 🌐 Language changed to: en
[HomeComponent] 🌐 Language changed, reloading data...
[HomeService] 🗑️ Clearing all cache (current language: en)
[HomeService] 🌐 Fetching home page data from API for language: en
[LanguageInterceptor] 🌐 GET https://localhost:45000/home - Accept-Language: en
[HomeService] ✅ Home page data loaded for language: en
[CategoriesService] 🌐 Language changed, reloading categories...
```

### Network Tab (DevTools)

Verifica que el request tenga:
- **Request Headers**: `Accept-Language: en`
- **Response**: Datos en inglés

### Redis (Opcional)

Puedes verificar las claves en Redis:

```bash
redis-cli
> KEYS home:page:*
1) "home:page:es:8"
2) "home:page:en:8"
```

## Notas Técnicas

### ¿Por qué usar Map en lugar de un solo Observable?

**Antes**:
```typescript
private homePageCache$: Observable<HomePageResponse> | undefined;
```
- Problema: Un solo caché para todos los idiomas
- Al cambiar idioma, devolvía datos del idioma anterior

**Después**:
```typescript
private homePageCache$: Map<string, Observable<HomePageResponse>> = new Map();
```
- Solución: Caché separado por idioma
- Cada idioma tiene su propio Observable cacheado

### ¿Por qué leer de localStorage en lugar de inyectar LanguageService?

Para evitar **dependencias circulares**:
- `LanguageService` usa `TranslateService`
- `TranslateService` usa `HttpClient`
- `HttpClient` usa `languageInterceptor`
- Si `languageInterceptor` inyecta `LanguageService` → **ciclo infinito**

Solución: Leer directamente de `localStorage` (misma clave que usa `LanguageService`)

### ¿El backend cachea por idioma?

**Sí**, el backend ya incluía el idioma en la clave de Redis:

```csharp
var cacheKey = $"home:page:{language}:{productsPerSection}";
```

El problema era que el frontend no hacía una nueva petición HTTP porque su propio caché devolvía datos viejos.

## Testing

### Caso de Prueba 1: Cambio de Idioma en Home

1. Ir a Home (`/`)
2. Verificar que los productos están en español
3. Cambiar idioma a inglés (botón en header)
4. **Resultado esperado**: Productos se actualizan a inglés sin F5

### Caso de Prueba 2: Cambio de Idioma en Otra Página

1. Ir a `/s` (búsqueda)
2. Cambiar idioma a inglés
3. Volver a Home (`/`)
4. **Resultado esperado**: Productos aparecen en inglés

### Caso de Prueba 3: Dropdown de Categorías

1. Cambiar idioma a inglés
2. Abrir dropdown "Categorías" en header
3. **Resultado esperado**: Categorías aparecen en inglés

## Mejoras Futuras

1. **Prefetch**: Precargar datos del otro idioma en background
2. **Service Worker**: Cachear traducciones offline
3. **Lazy Loading**: Cargar traducciones solo cuando se necesitan
4. **Analytics**: Trackear qué idioma usan más los usuarios

---

**Fecha**: 2025-12-14  
**Autor**: Arquitecto Frontend - Angular Expert  
**Estado**: ✅ Implementado y Verificado
