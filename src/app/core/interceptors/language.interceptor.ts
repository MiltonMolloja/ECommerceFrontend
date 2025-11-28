import { HttpInterceptorFn } from '@angular/common/http';

/**
 * HTTP Interceptor para agregar el header Accept-Language a todas las peticiones
 *
 * IMPORTANTE: No inyectamos LanguageService para evitar dependencias circulares
 * ya que TranslateService (usado por LanguageService) usa HttpClient para cargar traducciones.
 * En su lugar, leemos directamente desde localStorage.
 */
export const languageInterceptor: HttpInterceptorFn = (req, next) => {
  // Skip translation file requests - they don't need language headers
  if (req.url.includes('/assets/i18n/')) {
    return next(req);
  }

  // Read language directly from localStorage to avoid circular dependency
  // This matches the STORAGE_KEY in LanguageService
  const language =
    typeof window !== 'undefined' ? localStorage.getItem('app-language') || 'es' : 'es';

  // Clone request and add Accept-Language header
  const clonedRequest = req.clone({
    setHeaders: {
      'Accept-Language': language
    }
  });

  return next(clonedRequest);
};
