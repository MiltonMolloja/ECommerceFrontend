import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-search-suggestions',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    TranslateModule
  ],
  templateUrl: './search-suggestions.component.html',
  styleUrl: './search-suggestions.component.scss'
})
export class SearchSuggestionsComponent {
  // Inputs
  readonly didYouMean = input<string | undefined>();
  readonly relatedSearches = input<string[]>([]);
  readonly currentQuery = input<string>('');

  // Outputs
  readonly suggestionClick = output<string>();
  readonly relatedSearchClick = output<string>();

  onDidYouMeanClick(): void {
    const suggestion = this.didYouMean();
    if (suggestion) {
      this.suggestionClick.emit(suggestion);
    }
  }

  onRelatedSearchClick(search: string): void {
    this.relatedSearchClick.emit(search);
  }
}
