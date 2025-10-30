import { ApplicationConfig, provideZoneChangeDetection, APP_INITIALIZER } from '@angular/core';
import {
  provideRouter,
  withComponentInputBinding,
  withInMemoryScrolling,
  withPreloading,
  PreloadAllModules
} from '@angular/router';
import { provideHttpClient, withInterceptors, withFetch } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { ThemeService } from './core/services/theme.service';

import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';

// Inicializar ThemeService al arranque de la aplicación
function initializeTheme(themeService: ThemeService) {
  return () => {
    // El servicio se inyecta y el constructor se ejecuta automáticamente
    console.log('ThemeService initialized:', themeService.themeMode());
  };
}

export const appConfig: ApplicationConfig = {
  providers: [
    // Change detection optimizada
    provideZoneChangeDetection({ eventCoalescing: true }),

    // Router con optimizaciones
    provideRouter(
      routes,
      withComponentInputBinding(), // Bind route params como inputs
      withPreloading(PreloadAllModules), // Precarga todas las rutas lazy
      withInMemoryScrolling({
        scrollPositionRestoration: 'enabled',
        anchorScrolling: 'enabled'
      })
    ),

    // HttpClient con interceptores y fetch API
    provideHttpClient(
      withFetch(), // Usa Fetch API en lugar de XMLHttpRequest
      withInterceptors([authInterceptor, errorInterceptor])
    ),

    // Animaciones async para mejor rendimiento inicial
    provideAnimationsAsync(),

    // Initialize ThemeService at app startup
    {
      provide: APP_INITIALIZER,
      useFactory: initializeTheme,
      deps: [ThemeService],
      multi: true
    }
  ]
};
