import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressBarModule } from '@angular/material/progress-bar';

@Component({
  selector: 'app-search-header',
  standalone: true,
  imports: [CommonModule, MatProgressBarModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="search-header">
      <h1 class="results-text">{{ resultsText }}</h1>
      @if (loading) {
        <mat-progress-bar mode="indeterminate"></mat-progress-bar>
      }
    </div>
  `,
  styles: [
    `
      .search-header {
        margin-bottom: 16px;
      }

      .results-text {
        font-size: 18px;
        font-weight: 600;
        margin-bottom: 8px;
        color: var(--text-primary);
      }
    `
  ]
})
export class SearchHeaderComponent {
  @Input() resultsText = '';
  @Input() loading = false;
}
