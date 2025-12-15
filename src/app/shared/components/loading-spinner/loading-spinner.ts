import { Component, inject, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { LoadingService } from '../../../core/services/loading.service';

/**
 * Componente de loading spinner global
 *
 * Uso:
 * 1. Agregar <app-loading-spinner /> en app.component.html
 * 2. El spinner se muestra automáticamente cuando LoadingService.isLoading() es true
 *
 * También puede usarse de forma standalone con [show]="true"
 */
@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [CommonModule, MatProgressSpinnerModule],
  template: `
    @if (show() || loadingService.isLoading()) {
      <div class="loading-overlay" [class.transparent]="transparent()">
        <div class="spinner-container">
          <mat-spinner [diameter]="diameter()" [strokeWidth]="strokeWidth()"></mat-spinner>
          @if (message()) {
            <p class="loading-message">{{ message() }}</p>
          }
        </div>
      </div>
    }
  `,
  styles: [
    `
      .loading-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(255, 255, 255, 0.9);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9998;

        &.transparent {
          background: rgba(255, 255, 255, 0.5);
        }
      }

      :host-context(.dark-theme) .loading-overlay {
        background: rgba(30, 30, 30, 0.9);

        &.transparent {
          background: rgba(30, 30, 30, 0.5);
        }
      }

      .spinner-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 16px;
      }

      .loading-message {
        margin: 0;
        font-size: 14px;
        color: #666;
        text-align: center;
      }

      :host-context(.dark-theme) .loading-message {
        color: #aaa;
      }
    `
  ]
})
export class LoadingSpinnerComponent {
  readonly loadingService = inject(LoadingService);

  // Inputs para personalización
  readonly show = input(false);
  readonly message = input<string>('');
  readonly diameter = input(50);
  readonly strokeWidth = input(4);
  readonly transparent = input(false);
}

/**
 * Componente de loading spinner inline (no overlay)
 * Para usar dentro de componentes específicos
 */
@Component({
  selector: 'app-inline-spinner',
  standalone: true,
  imports: [CommonModule, MatProgressSpinnerModule],
  template: `
    <div class="inline-spinner" [class.centered]="centered()">
      <mat-spinner [diameter]="diameter()" [strokeWidth]="strokeWidth()"></mat-spinner>
      @if (message()) {
        <span class="spinner-message">{{ message() }}</span>
      }
    </div>
  `,
  styles: [
    `
      .inline-spinner {
        display: inline-flex;
        align-items: center;
        gap: 12px;

        &.centered {
          justify-content: center;
          width: 100%;
          padding: 24px;
        }
      }

      .spinner-message {
        font-size: 14px;
        color: #666;
      }

      :host-context(.dark-theme) .spinner-message {
        color: #aaa;
      }
    `
  ]
})
export class InlineSpinnerComponent {
  readonly message = input<string>('');
  readonly diameter = input(24);
  readonly strokeWidth = input(3);
  readonly centered = input(false);
}
