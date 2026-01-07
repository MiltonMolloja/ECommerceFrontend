import { Injectable, signal, effect, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';

export type ThemeMode = 'light' | 'dark' | 'auto';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private translateService = inject(TranslateService);
  private platformId = inject(PLATFORM_ID);
  private readonly THEME_STORAGE_KEY = 'theme';

  // Signal para el modo de tema seleccionado por el usuario
  readonly themeMode = signal<ThemeMode>(this.getStoredTheme());

  // Signal para el tema efectivo (resuelve 'auto' a 'light' o 'dark')
  readonly effectiveTheme = signal<'light' | 'dark'>('light');

  private mediaQuery: MediaQueryList | null = null;
  private isExternalUpdate = false; // Flag para evitar guardar cuando viene de storage event

  constructor() {
    // Solo ejecutar en el browser
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    // Configurar listener para cambios en preferencias del sistema
    this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    this.mediaQuery.addEventListener('change', () => this.updateEffectiveTheme());

    // Listener para sincronización cross-tab/cross-project
    // Detecta cambios en localStorage desde otras pestañas o proyectos
    window.addEventListener('storage', (event: StorageEvent) => {
      if (event.key === this.THEME_STORAGE_KEY && event.newValue) {
        const newTheme = event.newValue as ThemeMode;

        if (newTheme === 'light' || newTheme === 'dark' || newTheme === 'auto') {
          // Marcar como actualización externa para evitar guardar de nuevo
          this.isExternalUpdate = true;
          this.themeMode.set(newTheme);
          this.isExternalUpdate = false;
        }
      }
    });

    // Effect para aplicar el tema cuando cambia
    effect(() => {
      const mode = this.themeMode();

      // Solo guardar si no es una actualización externa
      if (!this.isExternalUpdate) {
        this.saveThemePreference(mode);
      }
      this.updateEffectiveTheme();
    });

    // Aplicar tema inicial
    this.updateEffectiveTheme();
  }

  /**
   * Cambia el modo de tema
   */
  setThemeMode(mode: ThemeMode): void {
    this.themeMode.set(mode);
  }

  /**
   * Obtiene la preferencia de tema guardada en localStorage
   */
  private getStoredTheme(): ThemeMode {
    if (!isPlatformBrowser(this.platformId)) {
      return 'auto';
    }

    try {
      const stored = localStorage.getItem(this.THEME_STORAGE_KEY);
      if (stored === 'light' || stored === 'dark' || stored === 'auto') {
        return stored;
      }
    } catch {
      // Ignore storage errors (incognito mode, quota exceeded, etc.)
    }
    return 'auto'; // Default
  }

  /**
   * Guarda la preferencia de tema en localStorage
   */
  private saveThemePreference(mode: ThemeMode): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    try {
      localStorage.setItem(this.THEME_STORAGE_KEY, mode);
    } catch {
      // Ignore storage errors
    }
  }

  /**
   * Actualiza el tema efectivo basado en el modo seleccionado
   */
  private updateEffectiveTheme(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const mode = this.themeMode();
    let effective: 'light' | 'dark';

    if (mode === 'auto') {
      // Usar preferencias del sistema
      effective = this.mediaQuery?.matches ? 'dark' : 'light';
    } else {
      effective = mode;
    }

    this.effectiveTheme.set(effective);
    this.applyThemeToDocument(effective);
  }

  /**
   * Aplica la clase de tema al documento
   */
  private applyThemeToDocument(theme: 'light' | 'dark'): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const htmlElement = document.documentElement;

    // Remover clases de tema existentes
    htmlElement.classList.remove('light-theme', 'dark-theme');

    // Agregar la clase del tema actual
    htmlElement.classList.add(`${theme}-theme`);

    // Actualizar el atributo data-theme para mejor accesibilidad
    htmlElement.setAttribute('data-theme', theme);
  }

  /**
   * Obtiene el ícono de Material correspondiente al modo actual
   */
  getThemeIcon(): string {
    const mode = this.themeMode();
    switch (mode) {
      case 'light':
        return 'light_mode';
      case 'dark':
        return 'dark_mode';
      case 'auto':
        return 'brightness_auto';
    }
  }

  /**
   * Obtiene el label traducido para el modo actual
   */
  getThemeLabel(): string {
    const mode = this.themeMode();
    switch (mode) {
      case 'light':
        return this.translateService.instant('THEME.LIGHT');
      case 'dark':
        return this.translateService.instant('THEME.DARK');
      case 'auto':
        return this.translateService.instant('THEME.AUTO');
    }
  }
}
