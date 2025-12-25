# Implementación de Renovación Automática de Token

## Resumen

Se implementó un sistema de renovación automática de tokens JWT cuando expiran, con manejo de concurrencia y logging detallado.

## Problema Resuelto

**Antes:**
- Cuando el access token expiraba, las peticiones HTTP fallaban con 401
- El usuario veía errores "No autorizado" aunque tuviera un refresh token válido
- No se intentaba renovar el token automáticamente
- El usuario tenía que hacer login manualmente

**Después:**
- Cuando el access token expira, el sistema detecta el 401
- Intenta renovar el token automáticamente usando el refresh token
- Si múltiples peticiones fallan simultáneamente, solo se hace 1 refresh
- Todas las peticiones se reintentan con el nuevo token
- Si el refresh falla, se limpia la sesión y redirige al login preservando la URL actual

---

## Archivos Modificados

### 1. `src/app/core/interceptors/auth.interceptor.ts`
**Cambio:** Reescritura completa (31 líneas → 180 líneas)

**Nuevas características:**
- ✅ Detección de errores 401 (token expirado)
- ✅ Renovación automática de token usando refresh token
- ✅ Manejo de concurrencia con `BehaviorSubject`
- ✅ Cola de peticiones mientras se renueva el token
- ✅ Logging detallado para depuración
- ✅ Exclusión de URLs de autenticación (evitar loop infinito)
- ✅ Redirección al login externo preservando URL actual

**URLs excluidas del interceptor:**
```typescript
const EXCLUDED_URLS = [
  '/v1/identity/authentication', // Login
  '/v1/identity/refresh-token',  // Refresh token
  '/v1/identity'                 // Register (POST)
];
```

### 2. `src/app/core/services/auth.service.ts`
**Cambios:** Agregados 3 métodos nuevos

**Métodos agregados:**
```typescript
// Verifica si hay refresh token disponible
hasRefreshToken(): boolean

// Obtiene el refresh token actual
getRefreshToken(): string | null

// Modificado para no lanzar excepción
refreshToken(): Observable<IdentityAccess>
```

---

## Flujo de Renovación de Token

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. Petición HTTP con token expirado                            │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 2. Servidor responde 401 (Unauthorized)                        │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 3. Auth Interceptor detecta 401                                │
└─────────────────────────────────────────────────────────────────┘
                            ↓
                    ┌───────┴───────┐
                    │               │
        ┌───────────▼─────┐   ┌─────▼──────────┐
        │ ¿Ya refrescando? │   │ ¿Hay refresh   │
        │      SÍ          │   │    token?      │
        └───────────┬─────┘   └─────┬──────────┘
                    │               │ NO
                    │               ↓
                    │         ┌─────────────┐
                    │         │ Logout +    │
                    │         │ Redirect    │
                    │         └─────────────┘
                    │
                    │         SÍ
                    ↓         ↓
        ┌─────────────────────────────┐
        │ Encolar petición en cola    │
        │ (refreshTokenSubject)       │
        └─────────────┬───────────────┘
                      │
                      ↓
        ┌─────────────────────────────┐
        │ Llamar a /refresh-token     │
        └─────────────┬───────────────┘
                      │
              ┌───────┴────────┐
              │                │
        ┌─────▼─────┐    ┌─────▼──────┐
        │  Éxito    │    │   Error    │
        └─────┬─────┘    └─────┬──────┘
              │                │
              ↓                ↓
    ┌──────────────────┐  ┌──────────────┐
    │ Nuevo token      │  │ Logout +     │
    │ guardado         │  │ Redirect     │
    └──────┬───────────┘  └──────────────┘
           │
           ↓
    ┌──────────────────────────┐
    │ Notificar a todas las    │
    │ peticiones encoladas     │
    └──────┬───────────────────┘
           │
           ↓
    ┌──────────────────────────┐
    │ Reintentar peticiones    │
    │ con nuevo token          │
    └──────────────────────────┘
```

---

## Manejo de Concurrencia

### Problema
Si múltiples peticiones HTTP fallan con 401 simultáneamente, todas intentarían renovar el token al mismo tiempo.

### Solución
Usamos un patrón de "cola" con `BehaviorSubject`:

```typescript
// Estado compartido
let isRefreshing = false;
const refreshTokenSubject = new BehaviorSubject<string | null>(null);

// Primera petición que recibe 401
if (!isRefreshing) {
  isRefreshing = true;
  // Iniciar refresh
  authService.refreshToken().subscribe(...)
}

// Peticiones subsiguientes que reciben 401
if (isRefreshing) {
  // Encolar y esperar el nuevo token
  return refreshTokenSubject.pipe(
    filter(token => token !== null),
    take(1),
    switchMap(token => retry(request, token))
  );
}
```

**Resultado:**
- Solo 1 llamada a `/refresh-token` aunque haya 10 peticiones con 401
- Todas las peticiones esperan el nuevo token
- Todas se reintentan automáticamente con el nuevo token

---

## Logging Implementado

### Niveles de Log

| Emoji | Nivel | Descripción |
|-------|-------|-------------|
| 🔑 | DEBUG | Token agregado a la petición |
| ⏭️ | DEBUG | URL excluida del interceptor |
| ⚠️ | WARN | Token expirado detectado (401) |
| ⏳ | DEBUG | Petición encolada (refresh en progreso) |
| 🔄 | INFO | Iniciando renovación de token |
| ✅ | INFO | Token renovado exitosamente |
| ❌ | ERROR | Error al renovar token |
| 🔐 | INFO | Redirigiendo al login (sesión expirada) |
| 🏁 | DEBUG | Proceso de refresh finalizado |

### Ejemplo de Logs en Consola

```
🔑 Token agregado a la petición { url: 'http://localhost:45000/orders', method: 'POST' }
⚠️ Token expirado (401), intentando renovar... { url: 'http://localhost:45000/orders', method: 'POST' }
🔄 Iniciando renovación de token...
⏳ Refresh en progreso, encolando petición { url: 'http://localhost:45000/cart' }
✅ Token renovado exitosamente
✅ Token renovado, reintentando petición encolada { url: 'http://localhost:45000/cart' }
🏁 Proceso de refresh finalizado
```

---

## Redirección al Login

Cuando el refresh token falla o no existe, el sistema:

1. Limpia la sesión local (tokens, expiración)
2. Construye la URL de retorno preservando la ubicación actual
3. Redirige al login externo

### Ejemplo de URL de Redirección

**Usuario estaba en:** `https://localhost:4200/checkout?step=3`

**URL de redirección generada:**
```
https://localhost:4400/login?returnUrl=https%3A%2F%2Flocalhost%3A4200%2Flogin-callback%3Fnext%3D%252Fcheckout%253Fstep%253D3
```

**Decodificada:**
```
https://localhost:4400/login?returnUrl=https://localhost:4200/login-callback?next=/checkout?step=3
```

**Flujo completo:**
1. Usuario hace login en `https://localhost:4400/login`
2. Login exitoso → redirige a `https://localhost:4200/login-callback?next=/checkout?step=3`
3. Login callback procesa tokens → redirige a `/checkout?step=3`
4. Usuario vuelve exactamente donde estaba

---

## Casos de Prueba

| Escenario | Comportamiento Esperado | Estado |
|-----------|------------------------|--------|
| Token válido | Petición normal con token | ✅ |
| Token expirado, refresh exitoso | Renovar token, reintentar petición | ✅ |
| Token expirado, múltiples peticiones | Solo 1 refresh, todas reintentan | ✅ |
| Token expirado, refresh falla | Limpiar sesión, redirigir a login | ✅ |
| Sin refresh token | Limpiar sesión, redirigir a login | ✅ |
| Petición a `/v1/identity/authentication` | No interceptar | ✅ |
| Petición a `/v1/identity/refresh-token` | No interceptar | ✅ |
| Petición a `POST /v1/identity` (register) | No interceptar | ✅ |

---

## Configuración

### Variables de Entorno

```typescript
// environment.ts
export const environment = {
  apiGatewayUrl: 'http://localhost:45000',
  identityUrl: 'http://localhost:10000',
  loginServiceUrl: 'https://localhost:4400',
  tokenKey: 'ecommerce_access_token',
  refreshTokenKey: 'ecommerce_refresh_token',
  tokenExpirationKey: 'ecommerce_token_expiration'
};
```

### Orden de Interceptores

```typescript
// app.config.ts
provideHttpClient(
  withFetch(),
  withInterceptors([
    authInterceptor,        // 1. Maneja autenticación y refresh
    languageInterceptor,    // 2. Agrega header de idioma
    errorInterceptor        // 3. Maneja otros errores
  ])
)
```

**Importante:** El `authInterceptor` debe estar **antes** del `errorInterceptor` para que maneje los 401 primero.

---

## Mejoras Futuras (Opcionales)

1. **Refresh preventivo**: Renovar el token antes de que expire (ej: 5 minutos antes)
2. **Retry con backoff**: Si el refresh falla por error de red, reintentar con exponential backoff
3. **Notificación al usuario**: Mostrar un toast "Renovando sesión..." durante el refresh
4. **Métricas**: Trackear cuántas veces se renueva el token (analytics)
5. **Timeout del refresh**: Cancelar el refresh si tarda más de X segundos

---

## Troubleshooting

### El token no se renueva

**Verificar:**
1. ¿Hay refresh token en localStorage? → `localStorage.getItem('ecommerce_refresh_token')`
2. ¿El endpoint de refresh funciona? → Probar manualmente en Postman
3. ¿Los logs muestran el intento de refresh? → Buscar "🔄 Iniciando renovación"

### Loop infinito de refresh

**Causa probable:** El endpoint de refresh no está excluido

**Solución:** Verificar que `/v1/identity/refresh-token` esté en `EXCLUDED_URLS`

### Múltiples llamadas a refresh-token

**Causa probable:** El manejo de concurrencia no funciona

**Solución:** Verificar que `isRefreshing` y `refreshTokenSubject` sean variables globales (fuera del interceptor)

---

## Autor

Implementado el 25 de diciembre de 2024

## Referencias

- [Angular HTTP Interceptors](https://angular.dev/guide/http/interceptors)
- [RxJS BehaviorSubject](https://rxjs.dev/api/index/class/BehaviorSubject)
- [JWT Refresh Token Best Practices](https://auth0.com/blog/refresh-tokens-what-are-they-and-when-to-use-them/)
