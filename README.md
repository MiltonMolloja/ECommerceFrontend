# ECommerceFrontend

Proyecto profesional de e-commerce construido con **Angular 20**, **Angular Material** y las mejores prácticas de desarrollo front-end enterprise.

## Características

- Angular 20.3 con **Standalone Components**
- Angular Material 20.2 con tema Azure Blue (claro/oscuro automático)
- Arquitectura escalable por features (core, shared, features, layouts)
- Routing lazy con precarga inteligente
- Change Detection optimizada con event coalescing
- Signals para estado reactivo
- TypeScript estricto con todas las validaciones
- i18n preparado con @angular/localize
- ESLint + Prettier + Husky + lint-staged
- Responsive design con Material CDK BreakpointObserver
- Interceptores HTTP y manejo de errores global

## Estructura del Proyecto

```
src/app/
├── core/                      # Servicios singleton y lógica central
│   ├── interceptors/         # Interceptores HTTP
│   ├── guards/               # Guards de navegación
│   └── services/             # Servicios globales
├── shared/                    # Componentes y utilidades reutilizables
│   ├── components/
│   ├── pipes/
│   └── directives/
├── features/                  # Features modulares con lazy loading
│   ├── home/                 # Página de inicio
│   ├── catalog/              # Catálogo de productos
│   └── cart/                 # Carrito de compras
└── layouts/                   # Layouts de la aplicación
    └── main-layout/          # Layout principal con toolbar + sidenav
```

## Scripts Disponibles

```bash
# Desarrollo
npm start                # Servidor de desarrollo (puerto 4200)
npm run watch            # Build en modo watch

# Build
npm run build            # Build de desarrollo
npm run build:prod       # Build de producción optimizado

# Calidad de código
npm run lint             # Ejecutar ESLint
npm run lint:fix         # Ejecutar ESLint y auto-fix
npm run format           # Formatear código con Prettier
npm run format:check     # Verificar formato sin modificar

# Testing
npm test                 # Tests en modo watch
npm run test:ci          # Tests en CI (ChromeHeadless + coverage)
```

## Instalación y Uso

### Prerrequisitos

- Node.js >= 22.20.0
- npm >= 10.9.3

### Instalación

```bash
# Clonar el repositorio
git clone <repository-url>
cd ECommerceFrontend

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm start
```

La aplicación estará disponible en `http://localhost:4200/`

## Configuración de TypeScript

El proyecto usa configuración TypeScript **ultra-estricta** para máxima seguridad de tipos:

- `strict: true`
- `noImplicitOverride: true`
- `noUncheckedIndexedAccess: true`
- `exactOptionalPropertyTypes: true`
- `noImplicitReturns: true`
- `noFallthroughCasesInSwitch: true`

## Linting y Formato

El proyecto usa:

- **ESLint** con reglas de Angular
- **Prettier** con formato automático
- **Husky** para hooks de Git
- **lint-staged** para validar archivos staged antes de commit

Los archivos se formatean automáticamente al hacer commit.

## Arquitectura de Componentes

### Core Module
Servicios singleton que se cargan una sola vez:
- `BreakpointService`: Gestión de breakpoints responsive con Signals
- `errorInterceptor`: Manejo global de errores HTTP

### Shared Module
Componentes, pipes y directivas reutilizables en toda la app.

### Features Module
Cada feature tiene su propia carpeta con:
- Componentes
- Servicios
- Rutas lazy
- Modelos

### Layouts
Layouts de página completa. El `MainLayoutComponent` incluye:
- Toolbar responsivo con Material
- Sidenav que se adapta a móvil/desktop
- Footer
- Router outlet para contenido dinámico

## Performance

### Optimizaciones implementadas:

1. **Lazy Loading**: Todas las rutas cargan módulos bajo demanda
2. **Preloading**: Estrategia `PreloadAllModules` para rutas lazy
3. **Change Detection**: Event coalescing activado
4. **Signals**: Estado reactivo sin RxJS innecesario
5. **trackBy**: En todos los `@for` para optimizar rendering
6. **OnPush**: Componentes con ChangeDetectionStrategy.OnPush cuando corresponde
7. **Bundle Size**: Bundle inicial ~90 kB (comprimido)

## Internacionalización (i18n)

El proyecto está preparado para i18n con `@angular/localize`. Para extraer textos:

```bash
ng extract-i18n
```

## Build de Producción

```bash
npm run build:prod
```

Optimizaciones de producción:
- Tree-shaking
- Minificación
- AOT Compilation
- Bundle budgets configurados
- Source maps habilitados

## Responsiveness

Breakpoints:
- **XSmall**: < 600px (móvil)
- **Small**: 600px - 959px (tablet)
- **Medium**: 960px - 1279px (desktop pequeño)
- **Large**: 1280px - 1919px (desktop)
- **XLarge**: >= 1920px (desktop grande)

## Accesibilidad

- Roles ARIA en componentes clave
- Labels en todos los botones interactivos
- Navegación por teclado
- Contraste de colores según WCAG 2.1

## Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## Licencia

Este proyecto es privado y de uso interno.

## Recursos

- [Angular Documentation](https://angular.dev)
- [Angular Material](https://material.angular.dev)
- [RxJS Documentation](https://rxjs.dev)
