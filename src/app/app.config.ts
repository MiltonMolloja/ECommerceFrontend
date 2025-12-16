import {
  ApplicationConfig,
  provideZoneChangeDetection,
  APP_INITIALIZER,
  ErrorHandler
} from '@angular/core';
import {
  provideRouter,
  withComponentInputBinding,
  withInMemoryScrolling,
  withPreloading,
  PreloadAllModules
} from '@angular/router';
import { provideHttpClient, withInterceptors, withFetch } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideTranslateService } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';
import { ThemeService } from './core/services/theme.service';
import { SentryService, SentryErrorHandler } from './core/services/sentry.service';
import { environment } from '../environments/environment';

import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';
import { languageInterceptor } from './core/interceptors/language.interceptor';

// Initialize ThemeService at app startup
function initializeTheme(themeService: ThemeService) {
  return () => {
    console.log('ThemeService initialized:', themeService.themeMode());
  };
}

// Initialize Sentry at app startup (async for lazy loading)
function initializeSentry(sentryService: SentryService) {
  return () => sentryService.init();
}

export const appConfig: ApplicationConfig = {
  providers: [
    // Global Error Handler - use Sentry in production, default in development
    {
      provide: ErrorHandler,
      useClass: environment.sentry?.enabled ? SentryErrorHandler : ErrorHandler
    },

    // Change detection optimizada
    provideZoneChangeDetection({ eventCoalescing: true }),

    // Router con optimizaciones
    provideRouter(
      routes,
      withComponentInputBinding(),
      withPreloading(PreloadAllModules),
      withInMemoryScrolling({
        scrollPositionRestoration: 'enabled',
        anchorScrolling: 'enabled'
      })
    ),

    // HttpClient con interceptores y fetch API
    provideHttpClient(
      withFetch(),
      withInterceptors([authInterceptor, languageInterceptor, errorInterceptor])
    ),

    // Animaciones async para mejor rendimiento inicial
    provideAnimationsAsync(),

    // ngx-translate configuration
    provideTranslateService({
      defaultLanguage: 'es',
      fallbackLang: 'es'
    }),
    provideTranslateHttpLoader({
      prefix: '/assets/i18n/',
      suffix: '.json'
    }),

    // Initialize ThemeService at app startup
    {
      provide: APP_INITIALIZER,
      useFactory: initializeTheme,
      deps: [ThemeService],
      multi: true
    },

    // Initialize Sentry at app startup
    {
      provide: APP_INITIALIZER,
      useFactory: initializeSentry,
      deps: [SentryService],
      multi: true
    }
  ]
};
