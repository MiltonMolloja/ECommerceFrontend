# Arquitectura ECommerceFrontend

## Visión General

Este proyecto sigue una arquitectura **feature-based** escalable, optimizada para equipos enterprise y proyectos grandes.

## Principios de Diseño

### 1. Standalone Components (Angular 20+)
- **Sin NgModules**: Todos los componentes son standalone
- **Imports explícitos**: Mejor tree-shaking y claridad
- **Lazy loading granular**: Cada componente puede cargarse de forma independiente

### 2. Signals-First
- **Estado local**: Usar `signal()` en lugar de BehaviorSubject
- **Estado computado**: `computed()` para valores derivados
- **Effects**: `effect()` para side-effects reactivos
- **toSignal()**: Convertir Observables legacy a Signals

### 3. Zoneless Change Detection (Preparado)
El proyecto está configurado con `provideZoneChangeDetection({ eventCoalescing: true })` para migrar fácilmente a zoneless en el futuro.

## Estructura de Carpetas Detallada

```
src/
├── app/
│   ├── app.ts                    # AppComponent raíz (mínimo)
│   ├── app.html                  # Template con router-outlet
│   ├── app.config.ts            # Configuración de providers
│   ├── app.routes.ts            # Rutas principales
│   │
│   ├── core/                    # Código singleton de la aplicación
│   │   ├── interceptors/
│   │   │   └── error.interceptor.ts      # Manejo global de errores HTTP
│   │   ├── guards/
│   │   │   └── auth.guard.ts             # Guards de autenticación (ejemplo)
│   │   └── services/
│   │       └── breakpoint.service.ts     # Servicio de breakpoints responsive
│   │
│   ├── shared/                  # Recursos reutilizables
│   │   ├── components/          # Componentes UI genéricos
│   │   ├── pipes/               # Pipes compartidos
│   │   └── directives/          # Directivas reutilizables
│   │
│   ├── features/                # Features de negocio
│   │   ├── home/
│   │   │   ├── home.component.ts
│   │   │   ├── home.component.html
│   │   │   └── home.component.scss
│   │   │
│   │   ├── catalog/
│   │   │   ├── catalog.routes.ts         # Rutas lazy del feature
│   │   │   ├── services/
│   │   │   │   └── catalog.service.ts    # Lógica de negocio
│   │   │   └── catalog-list/
│   │   │       ├── catalog-list.component.ts
│   │   │       ├── catalog-list.component.html
│   │   │       └── catalog-list.component.scss
│   │   │
│   │   └── cart/
│   │       └── cart.component.ts
│   │
│   └── layouts/                 # Layouts de página
│       └── main-layout/
│           ├── main-layout.component.ts
│           ├── main-layout.component.html
│           └── main-layout.component.scss
│
├── styles.scss                  # Estilos globales + tema Material
└── main.ts                      # Bootstrap de la aplicación
```

## Responsabilidades de Cada Capa

### Core
**Propósito**: Servicios singleton que se usan en toda la app.

**Reglas**:
- Debe contener solo servicios con `providedIn: 'root'`
- Nunca debe importar `Features` o `Layouts`
- Puede importar `Shared` si es necesario
- Ejemplos: AuthService, LoggerService, ApiService, interceptores, guards

### Shared
**Propósito**: Componentes, pipes y directivas reutilizables.

**Reglas**:
- No debe tener lógica de negocio
- Debe ser totalmente genérico y reutilizable
- Puede importar Core (servicios)
- Nunca debe importar `Features` o `Layouts`
- Ejemplos: LoadingSpinner, ConfirmDialog, DatePipe

### Features
**Propósito**: Módulos de funcionalidad de negocio.

**Reglas**:
- Cada feature es independiente y puede lazy-loadarse
- Puede importar `Core` y `Shared`
- No debe importar otros `Features` (evitar dependencias cruzadas)
- Contiene componentes, servicios y modelos específicos del feature
- Ejemplos: Catalog, Cart, Checkout, UserProfile

### Layouts
**Propósito**: Estructuras de página completa.

**Reglas**:
- Define la estructura visual de toda la página
- Puede importar `Core` y `Shared`
- Contiene toolbar, sidenav, footer, etc.
- Ejemplos: MainLayout, AuthLayout, AdminLayout

## Routing y Lazy Loading

### app.routes.ts
```typescript
export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./layouts/main-layout/main-layout.component')
      .then(m => m.MainLayoutComponent),
    children: [
      {
        path: '',
        loadComponent: () => import('./features/home/home.component')
          .then(m => m.HomeComponent)
      },
      {
        path: 'catalog',
        loadChildren: () => import('./features/catalog/catalog.routes')
          .then(m => m.CATALOG_ROUTES)
      }
    ]
  },
  { path: '**', redirectTo: '' }
];
```

### Estrategias de Precarga
```typescript
provideRouter(
  routes,
  withPreloading(PreloadAllModules) // Precarga todas las rutas lazy en idle time
)
```

**Alternativas**:
- `NoPreloading`: Sin precarga (solo bajo demanda)
- `PreloadAllModules`: Precarga todas (mejor UX, más consumo inicial)
- Custom strategy: Precarga selectiva según criterios

## Estado con Signals

### Patrón Service + Signals

```typescript
@Injectable({ providedIn: 'root' })
export class CartService {
  // Estado privado
  private readonly _items = signal<CartItem[]>([]);

  // Estado público (readonly)
  readonly items = this._items.asReadonly();

  // Estado computado
  readonly totalItems = computed(() =>
    this._items().reduce((sum, item) => sum + item.quantity, 0)
  );

  readonly totalPrice = computed(() =>
    this._items().reduce((sum, item) => sum + item.price * item.quantity, 0)
  );

  // Acciones
  addItem(item: CartItem): void {
    this._items.update(items => [...items, item]);
  }

  removeItem(id: string): void {
    this._items.update(items => items.filter(i => i.id !== id));
  }
}
```

### Uso en Componentes

```typescript
@Component({
  selector: 'app-cart-summary',
  standalone: true,
  template: `
    <div>
      <p>Total items: {{ cartService.totalItems() }}</p>
      <p>Total price: {{ cartService.totalPrice() | currency }}</p>
    </div>
  `
})
export class CartSummaryComponent {
  readonly cartService = inject(CartService);
}
```

## HTTP y Estado

### Patrón: Observable → Signal

```typescript
@Component({...})
export class CatalogListComponent implements OnInit {
  readonly products = signal<Product[]>([]);
  readonly loading = signal(false);

  constructor(private catalogService: CatalogService) {}

  ngOnInit(): void {
    this.loading.set(true);
    this.catalogService.getProducts().subscribe({
      next: products => {
        this.products.set(products);
        this.loading.set(false);
      },
      error: err => {
        console.error(err);
        this.loading.set(false);
      }
    });
  }
}
```

### Alternativa con toSignal

```typescript
@Component({...})
export class CatalogListComponent {
  private catalogService = inject(CatalogService);

  readonly products = toSignal(
    this.catalogService.getProducts(),
    { initialValue: [] }
  );
}
```

## Responsive Design

### BreakpointService

```typescript
@Component({...})
export class MyComponent {
  private breakpointService = inject(BreakpointService);

  readonly isMobile = this.breakpointService.isMobile;
  readonly isTablet = computed(() =>
    this.breakpointService.isSmall() || this.breakpointService.isMedium()
  );
}
```

### En Templates

```html
@if (isMobile()) {
  <app-mobile-menu />
} @else {
  <app-desktop-menu />
}
```

## Performance Best Practices

### 1. TrackBy en *ngFor
```typescript
@for (product of products(); track product.id) {
  <app-product-card [product]="product" />
}
```

### 2. Lazy Loading de Imágenes
```html
<img [src]="product.image" [alt]="product.name" loading="lazy" />
```

### 3. Defer para Componentes Pesados
```html
@defer (on viewport) {
  <app-heavy-chart />
} @placeholder {
  <div>Loading chart...</div>
}
```

### 4. Signals en lugar de RxJS
```typescript
// ❌ Malo (innecesario RxJS)
readonly count$ = new BehaviorSubject(0);

// ✅ Bueno (Signals)
readonly count = signal(0);
```

## Interceptores HTTP

### Error Interceptor
```typescript
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Logging
      console.error('HTTP Error:', error);

      // Notificación al usuario (integrar con servicio de notificaciones)
      // this.notificationService.error(error.message);

      return throwError(() => error);
    })
  );
};
```

## Testing (Preparado)

### Estructura de Tests
```
src/app/
├── features/
│   └── catalog/
│       ├── catalog.service.ts
│       └── catalog.service.spec.ts    # Tests unitarios
```

### Ejemplo de Test con Signals
```typescript
describe('CartService', () => {
  let service: CartService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CartService);
  });

  it('should add item to cart', () => {
    const item: CartItem = { id: '1', name: 'Product', price: 100 };
    service.addItem(item);

    expect(service.items().length).toBe(1);
    expect(service.totalPrice()).toBe(100);
  });
});
```

## Checklist de Nuevos Features

Al crear un nuevo feature, asegurarse de:

- [ ] Crear carpeta en `features/`
- [ ] Crear archivo de rutas lazy (`feature.routes.ts`)
- [ ] Usar standalone components
- [ ] Implementar servicios con Signals
- [ ] Agregar trackBy en todos los `@for`
- [ ] Implementar loading states
- [ ] Agregar manejo de errores
- [ ] Responsive design (móvil-primero)
- [ ] Accesibilidad (aria-labels, roles)
- [ ] Tests unitarios básicos

## Convenciones de Código

### Naming
- **Componentes**: `PascalCase` + `Component` suffix
- **Servicios**: `PascalCase` + `Service` suffix
- **Interfaces**: `PascalCase` sin prefijo `I`
- **Signals**: `camelCase` sin sufijos especiales
- **Observables**: `camelCase` + `$` suffix (legacy)

### Estructura de Componente
```typescript
@Component({
  selector: 'app-example',
  standalone: true,
  imports: [...],
  templateUrl: './example.component.html',
  styleUrl: './example.component.scss'
})
export class ExampleComponent {
  // 1. Signals de entrada (inputs)
  readonly input = input<string>('');

  // 2. Signals de salida (outputs)
  readonly output = output<void>();

  // 3. Servicios inyectados
  private service = inject(ExampleService);

  // 4. Signals locales
  readonly localState = signal(0);

  // 5. Computed signals
  readonly derivedState = computed(() => this.localState() * 2);

  // 6. Métodos públicos
  handleClick(): void {
    this.localState.update(v => v + 1);
    this.output.emit();
  }

  // 7. Métodos privados
  private helper(): void {
    // ...
  }
}
```

## Próximos Pasos

### Features Pendientes
1. Implementar autenticación (Auth feature)
2. Agregar gestión de estado global (si es necesario)
3. Implementar carritos persistentes (LocalStorage)
4. Agregar tests E2E con Playwright/Cypress
5. Configurar CI/CD pipeline
6. Implementar PWA capabilities

### Mejoras de Performance
1. Implementar Virtual Scrolling para listas largas
2. Agregar Service Worker para caching
3. Optimizar imágenes con CDN
4. Implementar prefetch de rutas críticas
5. Migrar a Zoneless Change Detection

## Referencias

- [Angular Style Guide](https://angular.dev/style-guide)
- [Angular Performance Guide](https://angular.dev/best-practices/runtime-performance)
- [Signals RFC](https://github.com/angular/angular/discussions/49090)
- [Standalone Components](https://angular.dev/guide/components/standalone)
