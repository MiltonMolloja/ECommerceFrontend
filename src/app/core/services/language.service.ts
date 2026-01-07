import { Injectable, signal, effect, computed, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';

export type Language = 'es' | 'en';

interface LanguageOption {
  code: Language;
  name: string;
  flag: string;
}

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  private readonly translateService = inject(TranslateService);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly STORAGE_KEY = 'language';
  private readonly DEFAULT_LANGUAGE: Language = 'es';

  // Available languages
  readonly languages: LanguageOption[] = [
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'en', name: 'English', flag: '🇺🇸' }
  ];

  // Current language signal
  readonly currentLanguage = signal<Language>(this.getInitialLanguage());

  // Signal to notify when language changes (for triggering data reloads)
  private readonly languageChangeCounter = signal<number>(0);

  // Computed signal that components can watch for language changes
  readonly languageChanged = computed(() => this.languageChangeCounter());

  // Get current language option
  readonly currentLanguageOption = computed(
    () => this.languages.find((lang) => lang.code === this.currentLanguage()) || this.languages[0]
  );

  constructor() {
    // Initialize ngx-translate with current language
    this.translateService.setDefaultLang(this.DEFAULT_LANGUAGE);
    this.translateService.use(this.currentLanguage());

    // Sync language changes to localStorage and ngx-translate
    effect(() => {
      const language = this.currentLanguage();
      if (isPlatformBrowser(this.platformId)) {
        try {
          localStorage.setItem(this.STORAGE_KEY, language);
        } catch {
          // Ignore storage errors
        }
      }
      this.translateService.use(language);
    });

    // Listen for storage changes from other tabs
    if (isPlatformBrowser(this.platformId)) {
      window.addEventListener('storage', this.handleStorageChange.bind(this));
    }
  }

  /**
   * Get initial language from localStorage or browser default
   */
  private getInitialLanguage(): Language {
    if (!isPlatformBrowser(this.platformId)) {
      return this.DEFAULT_LANGUAGE;
    }

    // Try to get from localStorage
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored && this.isValidLanguage(stored)) {
        return stored as Language;
      }
    } catch {
      // Ignore storage errors
    }

    // COMENTADO: No usar idioma del navegador, siempre usar español por defecto
    // Try to get from browser language
    // try {
    // const browserLang = navigator.language?.split('-')[0];
    // if (browserLang && this.isValidLanguage(browserLang)) {
    // return browserLang as Language;
    // }
    // } catch {
    //   // Ignore navigator errors
    // }

    return this.DEFAULT_LANGUAGE;
  }

  /**
   * Validate if a language code is supported
   */
  private isValidLanguage(lang: string): boolean {
    return this.languages.some((l) => l.code === lang);
  }

  /**
   * Handle storage changes from other tabs
   */
  private handleStorageChange(event: StorageEvent): void {
    if (event.key === this.STORAGE_KEY && event.newValue) {
      const newLanguage = event.newValue;
      if (this.isValidLanguage(newLanguage) && newLanguage !== this.currentLanguage()) {
        this.currentLanguage.set(newLanguage as Language);
        this.languageChangeCounter.update((v) => v + 1);
      }
    }
  }

  /**
   * Set the current language
   * @param language - The language code to set
   */
  setLanguage(language: Language): void {
    if (!this.isValidLanguage(language)) {
      return;
    }

    if (language !== this.currentLanguage()) {
      this.currentLanguage.set(language);
      this.languageChangeCounter.update((v) => v + 1);
    }
  }

  /**
   * Toggle between available languages
   */
  toggleLanguage(): void {
    const current = this.currentLanguage();
    const nextLanguage = current === 'es' ? 'en' : 'es';
    this.setLanguage(nextLanguage);
  }

  /**
   * Get the language code to use in HTTP headers
   */
  getLanguageHeader(): string {
    return this.currentLanguage();
  }

  /**
   * Get a translated string immediately (synchronous)
   * @param key - Translation key
   * @param params - Optional interpolation parameters
   */
  instant(key: string, params?: Record<string, unknown>): string {
    return this.translateService.instant(key, params);
  }

  /**
   * Check if current language is Spanish
   */
  isSpanish(): boolean {
    return this.currentLanguage() === 'es';
  }

  /**
   * Check if current language is English
   */
  isEnglish(): boolean {
    return this.currentLanguage() === 'en';
  }
}
