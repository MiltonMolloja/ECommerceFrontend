import { Injectable, ErrorHandler, inject } from '@angular/core';
import { Router } from '@angular/router';
import * as Sentry from '@sentry/angular';
import { environment } from '../../../environments/environment';

/**
 * Sentry Error Tracking Service
 *
 * Initializes and configures Sentry for production error monitoring.
 * In development, errors are logged to console instead.
 */
@Injectable({
  providedIn: 'root'
})
export class SentryService {
  private initialized = false;

  /**
   * Initialize Sentry with the configured DSN
   * Should be called once at application startup
   */
  init(): void {
    if (this.initialized) {
      return;
    }

    if (environment.sentry?.enabled && environment.sentry?.dsn) {
      try {
        Sentry.init({
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
        console.log('[Sentry] Initialized successfully');
      } catch (error) {
        console.error('[Sentry] Failed to initialize:', error);
      }
    } else {
      console.log('[Sentry] Disabled - not in production or no DSN configured');
    }
  }

  /**
   * Capture an exception and send to Sentry
   */
  captureException(error: Error, context?: Record<string, unknown>): void {
    if (environment.sentry?.enabled && this.initialized) {
      Sentry.captureException(error, context ? { extra: context } : undefined);
    } else {
      console.error('[Error]', error, context);
    }
  }

  /**
   * Capture a message and send to Sentry
   */
  captureMessage(
    message: string,
    level: Sentry.SeverityLevel = 'info',
    context?: Record<string, unknown>
  ): void {
    if (environment.sentry?.enabled && this.initialized) {
      const captureContext: { level: Sentry.SeverityLevel; extra?: Record<string, unknown> } = {
        level
      };
      if (context) {
        captureContext.extra = context;
      }
      Sentry.captureMessage(message, captureContext);
    } else {
      console.log(`[${level.toUpperCase()}]`, message, context);
    }
  }

  /**
   * Set user information for error tracking
   */
  setUser(user: { id: string; email?: string; username?: string } | null): void {
    if (environment.sentry?.enabled && this.initialized) {
      Sentry.setUser(user);
    }
  }

  /**
   * Add breadcrumb for debugging
   */
  addBreadcrumb(breadcrumb: Sentry.Breadcrumb): void {
    if (environment.sentry?.enabled && this.initialized) {
      Sentry.addBreadcrumb(breadcrumb);
    }
  }

  /**
   * Set extra context for all future events
   */
  setContext(name: string, context: Record<string, unknown>): void {
    if (environment.sentry?.enabled && this.initialized) {
      Sentry.setContext(name, context);
    }
  }

  /**
   * Set a tag for all future events
   */
  setTag(key: string, value: string): void {
    if (environment.sentry?.enabled && this.initialized) {
      Sentry.setTag(key, value);
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
