# 🔍 Debugging de la Búsqueda de Productos

## Problema: Carga infinita en búsqueda

Si la búsqueda se queda cargando indefinidamente, sigue estos pasos:

### 1. Verificar que el backend esté corriendo

```bash
# El backend debe estar corriendo en http://localhost:45000
curl http://localhost:45000/products/search?Query=notebook&Page=1&PageSize=12
```

### 2. Verificar la consola del navegador

Abre las DevTools (F12) y busca estos logs:

```
🚀 Iniciando búsqueda con params: {...}
🔍 Buscando productos con params: Query=notebook&Page=1&PageSize=24
```

Si ves errores:
- `❌ Error en búsqueda de productos` - Ver detalles del error
- `CORS error` - El proxy no está funcionando
- `404 Not Found` - La URL del backend está mal
- `500 Internal Server Error` - Error en el backend

### 3. Verificar el proxy

El proxy debería redirigir `/api` a `http://localhost:45000`:

**En Network tab (DevTools):**
- Buscar request a: `http://localhost:4200/api/products/search?Query=...`
- Debería mostrar status 200 (o el error específico)

### 4. Verificar que el servidor de desarrollo use el proxy

El comando debe ser:
```bash
npm start
# o
ng serve
```

NO usar:
```bash
ng serve --proxy-config=proxy.conf.json  # Redundante, ya está en angular.json
```

### 5. Posibles soluciones

#### Si el proxy no funciona:

**Opción A: Reiniciar el servidor**
```bash
# Ctrl+C para detener
npm start
```

#### Opción B: Verificar angular.json
Debe tener:
```json
"serve": {
  "configurations": {
    "development": {
      "proxyConfig": "proxy.conf.json"
    }
  }
}
```

#### Opción C: Usar URL directa temporalmente

En `product-search.service.ts`:
```typescript
private readonly API_URL = 'http://localhost:45000/products';
```

**NOTA:** Esto causará error CORS si el backend no tiene configurado CORS para localhost:4200

### 6. Verificar respuesta del backend

La respuesta debe tener este formato:
```json
{
  "items": [
    {
      "id": "...",
      "title": "...",
      "price": {...},
      ...
    }
  ],
  "pageNumber": 1,
  "pageSize": 24,
  "totalCount": 100,
  "totalPages": 5
}
```

### 7. Logs útiles

En la consola del navegador deberías ver:

**Búsqueda exitosa:**
```
🚀 Iniciando búsqueda con params: {query: "notebook", page: 1, pageSize: 24}
🔍 Buscando productos con params: Query=notebook&Page=1&PageSize=24
✅ Respuesta del backend: {items: [...], pageNumber: 1, ...}
📦 Respuesta procesada: {products: [...], pagination: {...}, ...}
```

**Búsqueda con error:**
```
🚀 Iniciando búsqueda con params: {...}
🔍 Buscando productos con params: ...
❌ Error en búsqueda de productos: {...}
💥 Error en componente: {...}
```

### 8. Comandos de verificación rápida

```bash
# 1. Verificar que el backend responde
curl http://localhost:45000/products/search?Query=test&Page=1&PageSize=10

# 2. Verificar proxy (desde otra terminal mientras ng serve corre)
curl http://localhost:4200/api/products/search?Query=test&Page=1&PageSize=10

# 3. Reiniciar frontend
npm start
```

## Checklist de verificación

- [ ] Backend corriendo en puerto 45000
- [ ] Frontend corriendo con `npm start`
- [ ] Proxy configurado en angular.json
- [ ] archivo proxy.conf.json existe
- [ ] Console muestra logs de búsqueda
- [ ] Network tab muestra el request
- [ ] No hay errores CORS en consola
