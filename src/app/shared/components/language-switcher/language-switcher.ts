import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { LanguageService, Language } from '../../../core/services/language.service';

@Component({
  selector: 'app-language-switcher',
  imports: [CommonModule, MatButtonModule, MatMenuModule, MatIconModule],
  templateUrl: './language-switcher.html',
  styleUrl: './language-switcher.scss'
})
export class LanguageSwitcher {
  readonly languageService = inject(LanguageService);

  /**
   * Change the current language
   */
  changeLanguage(language: Language): void {
    this.languageService.setLanguage(language);
  }
}
