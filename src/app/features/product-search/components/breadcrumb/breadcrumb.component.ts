import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-breadcrumb',
  standalone: true,
  imports: [CommonModule, RouterModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nav class="breadcrumb" aria-label="Breadcrumb">
      <a [routerLink]="['/']" class="breadcrumb-item">Inicio</a>
      <span class="separator">›</span>
      @if (category) {
        <a
          [routerLink]="['/catalog']"
          [queryParams]="{ category: category }"
          class="breadcrumb-item"
          >{{ category }}</a
        >
        <span class="separator">›</span>
      }
      <span class="breadcrumb-item active">{{ query || 'Resultados' }}</span>
    </nav>
  `,
  styles: [
    `
      .breadcrumb {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 12px;
        padding: 12px 0;
        color: var(--text-secondary);
      }

      .breadcrumb-item {
        color: #007185;
        text-decoration: none;

        &:hover:not(.active) {
          text-decoration: underline;
        }

        &.active {
          color: var(--text-primary);
          font-weight: 600;
        }
      }

      .separator {
        color: var(--text-secondary);
      }
    `
  ]
})
export class BreadcrumbComponent {
  @Input() query = '';
  @Input() category?: string;
}
