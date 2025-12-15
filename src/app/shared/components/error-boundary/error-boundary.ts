import { Component, ErrorHandler, Injectable, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { Router } from '@angular/router';
import { LoggerService } from '../../../core/services/logger.service';

/**
 * Información del error capturado
 */
export interface ErrorInfo {
  message: string;
  stack?: string;
  timestamp: Date;
  url?: string;
}

/**
 * Global Error Handler que captura errores no manejados
 * y los registra usando LoggerService
 */
@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  private logger = inject(LoggerService);

  // Signal para comunicar errores al ErrorBoundaryComponent
  private static errorSignal = signal<ErrorInfo | null>(null);

  static getErrorSignal() {
    return this.errorSignal;
  }

  handleError(error: unknown): void {
    // Extraer información del error
    const errorInfo: ErrorInfo = {
      message: this.getErrorMessage(error),
      timestamp: new Date()
    };

    // Agregar stack si está disponible
    if (error instanceof Error && error.stack) {
      errorInfo.stack = error.stack;
    }

    // Agregar URL si estamos en el browser
    if (typeof window !== 'undefined') {
      errorInfo.url = window.location.href;
    }

    // Log del error
    this.logger.error('Unhandled error caught by GlobalErrorHandler', error as Error, {
      url: errorInfo.url,
      timestamp: errorInfo.timestamp.toISOString()
    });

    // Actualizar el signal para que el ErrorBoundaryComponent pueda mostrar el error
    GlobalErrorHandler.errorSignal.set(errorInfo);

    // También mostrar en consola en desarrollo
    console.error('GlobalErrorHandler caught:', error);
  }

  private getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }
    if (typeof error === 'string') {
      return error;
    }
    return 'An unexpected error occurred';
  }
}

/**
 * Componente que muestra una UI de fallback cuando ocurre un error no manejado
 */
@Component({
  selector: 'app-error-boundary',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatCardModule],
  template: `
    @if (error()) {
      <div class="error-boundary-overlay">
        <mat-card class="error-card">
          <mat-card-header>
            <mat-icon mat-card-avatar class="error-icon">error_outline</mat-icon>
            <mat-card-title>Oops! Something went wrong</mat-card-title>
            <mat-card-subtitle>{{ error()?.timestamp | date: 'medium' }}</mat-card-subtitle>
          </mat-card-header>

          <mat-card-content>
            <p class="error-message">{{ error()?.message }}</p>

            @if (showDetails()) {
              <details class="error-details">
                <summary>Technical Details</summary>
                <pre>{{ error()?.stack }}</pre>
              </details>
            }
          </mat-card-content>

          <mat-card-actions align="end">
            <button mat-button (click)="toggleDetails()">
              <mat-icon>{{ showDetails() ? 'visibility_off' : 'visibility' }}</mat-icon>
              {{ showDetails() ? 'Hide Details' : 'Show Details' }}
            </button>
            <button mat-button color="primary" (click)="goHome()">
              <mat-icon>home</mat-icon>
              Go Home
            </button>
            <button mat-raised-button color="accent" (click)="reload()">
              <mat-icon>refresh</mat-icon>
              Reload Page
            </button>
          </mat-card-actions>
        </mat-card>
      </div>
    }
  `,
  styles: [
    `
      .error-boundary-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.7);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        padding: 16px;
      }

      .error-card {
        max-width: 600px;
        width: 100%;
      }

      .error-icon {
        color: #f44336;
        font-size: 40px;
        width: 40px;
        height: 40px;
      }

      .error-message {
        font-size: 16px;
        color: #666;
        margin: 16px 0;
      }

      .error-details {
        margin-top: 16px;

        summary {
          cursor: pointer;
          color: #666;
          font-size: 14px;

          &:hover {
            color: #333;
          }
        }

        pre {
          background: #f5f5f5;
          padding: 12px;
          border-radius: 4px;
          overflow-x: auto;
          font-size: 12px;
          max-height: 200px;
          overflow-y: auto;
        }
      }

      mat-card-actions {
        button {
          margin-left: 8px;
        }
      }
    `
  ]
})
export class ErrorBoundaryComponent {
  private router = inject(Router);

  readonly error = GlobalErrorHandler.getErrorSignal();
  readonly showDetails = signal(false);

  toggleDetails(): void {
    this.showDetails.update((v) => !v);
  }

  reload(): void {
    window.location.reload();
  }

  goHome(): void {
    // Limpiar el error
    GlobalErrorHandler.getErrorSignal().set(null);
    // Navegar al home
    this.router.navigate(['/']);
  }

  dismiss(): void {
    GlobalErrorHandler.getErrorSignal().set(null);
  }
}
