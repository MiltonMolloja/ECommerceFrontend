import { Pipe, PipeTransform, inject } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({
  name: 'highlightSearch',
  standalone: true
})
export class HighlightSearchPipe implements PipeTransform {
  private readonly sanitizer = inject(DomSanitizer);

  transform(text: string, search: string): SafeHtml {
    if (!search || !text) {
      return text;
    }

    const regex = new RegExp(search, 'gi');
    const highlighted = text.replace(
      regex,
      (match) => `<mark class="search-highlight">${match}</mark>`
    );

    return this.sanitizer.bypassSecurityTrustHtml(highlighted);
  }
}
