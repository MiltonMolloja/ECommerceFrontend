import { Injectable, ErrorHandler, inject } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

// Type definitions for Sentry (to avoid importing the full library)
type SeverityLevel = 'fatal' | 'error' | 'warning' | 'log' | 'info' | 'debug';

interface Breadcrumb {
  type?: string;
  level?: SeverityLevel;
  event_id?: string;
  category?: string;
  message?: string;
  data?: Record<string, unknown>;
  timestamp?: number;
}

interface SentryModule {
  init: (options: Record<string, unknown>) => void;
  captureException: (error: Error, context?: Record<string, unknown>) => void;
  captureMessage: (message: string, context?: Record<string, unknown>) => void;
  setUser: (user: Record<string, unknown> | null) => void;
  addBreadcrumb: (breadcrumb: Breadcrumb) => void;
  setContext: (name: string, context: Record<string, unknown>) => void;
  setTag: (key: string, value: string) => void;
}

/**
 * Sentry Error Tracking Service
 *
 * Initializes and configures Sentry for production error monitoring.
 * Uses lazy loading to reduce initial bundle size (~50KB savings).
 * In development, errors are logged to console instead.
 */
@Injectable({
  providedIn: 'root'
})
export class SentryService {
  private initialized = false;
  private sentry: SentryModule | null = null;

  /**
   * Initialize Sentry with the configured DSN
   * Uses dynamic import to lazy load Sentry only in production
   */
  async init(): Promise<void> {
    if (this.initialized) {
      return;
    }

    if (environment.sentry?.enabled && environment.sentry?.dsn) {
      try {
        // Lazy load Sentry only when needed
        const SentryModule = await import('@sentry/angular');
        this.sentry = SentryModule;

        SentryModule.init({
          dsn: environment.sentry.dsn,
          environment: environment.production ? 'production' : 'development',

          // Set tracesSampleRate to 1.0 to capture 100% of transactions for performance monitoring.
          // Adjust this value in production for better performance.
          tracesSampleRate: environment.production ? 0.2 : 1.0,

          // Capture Replay for 10% of all sessions,
          // plus for 100% of sessions with an error
          replaysSessionSampleRate: 0.1,
          replaysOnErrorSampleRate: 1.0,

          // Filter out sensitive data
          beforeSend(event) {
            // Remove any PII from the event
            if (event.user) {
              delete event.user.email;
              delete event.user.ip_address;
            }
            return event;
          },

          // Ignore common non-actionable errors
          ignoreErrors: [
            // Browser extensions
            'top.GLOBALS',
            'canvas.contentDocument',
            'MyApp_RemoveAllHighlights',
            'atomicFindClose',
            // Facebook borance
            'fb_xd_fragment',
            // Network errors
            'Network request failed',
            'Failed to fetch',
            'NetworkError',
            'Load failed',
            // User cancellation
            'AbortError',
            'cancelled'
          ]
        });

        this.initialized = true;
      } catch {
        // Failed to initialize Sentry
      }
    }
  }

  /**
   * Capture an exception and send to Sentry
   */
  captureException(error: Error, context?: Record<string, unknown>): void {
    if (environment.sentry?.enabled && this.initialized && this.sentry) {
      this.sentry.captureException(error, context ? { extra: context } : undefined);
    }
  }

  /**
   * Capture a message and send to Sentry
   */
  captureMessage(
    message: string,
    level: SeverityLevel = 'info',
    context?: Record<string, unknown>
  ): void {
    if (environment.sentry?.enabled && this.initialized && this.sentry) {
      const captureContext: { level: SeverityLevel; extra?: Record<string, unknown> } = {
        level
      };
      if (context) {
        captureContext.extra = context;
      }
      this.sentry.captureMessage(message, captureContext);
    }
  }

  /**
   * Set user information for error tracking
   */
  setUser(user: { id: string; email?: string; username?: string } | null): void {
    if (environment.sentry?.enabled && this.initialized && this.sentry) {
      this.sentry.setUser(user);
    }
  }

  /**
   * Add breadcrumb for debugging
   */
  addBreadcrumb(breadcrumb: Breadcrumb): void {
    if (environment.sentry?.enabled && this.initialized && this.sentry) {
      this.sentry.addBreadcrumb(breadcrumb);
    }
  }

  /**
   * Set extra context for all future events
   */
  setContext(name: string, context: Record<string, unknown>): void {
    if (environment.sentry?.enabled && this.initialized && this.sentry) {
      this.sentry.setContext(name, context);
    }
  }

  /**
   * Set a tag for all future events
   */
  setTag(key: string, value: string): void {
    if (environment.sentry?.enabled && this.initialized && this.sentry) {
      this.sentry.setTag(key, value);
    }
  }
}

/**
 * Global Error Handler that integrates with Sentry
 * Extends Angular's ErrorHandler to capture unhandled errors
 */
@Injectable()
export class SentryErrorHandler implements ErrorHandler {
  private sentryService = inject(SentryService);
  private router = inject(Router);

  handleError(error: Error): void {
    // Log to console in development
    console.error('Unhandled error:', error);

    // Capture in Sentry
    this.sentryService.captureException(error, {
      route: this.router.url,
      timestamp: new Date().toISOString()
    });

    // Re-throw the error to maintain default behavior
    // Comment out if you want to suppress the error
    // throw error;
  }
}
