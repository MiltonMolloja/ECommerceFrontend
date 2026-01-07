import { Injectable, inject, signal, effect } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CategoryDto } from '../models';
import { tap } from 'rxjs';
import { LanguageService } from './language.service';
import { ApiConfigService } from './api-config.service';

@Injectable({
  providedIn: 'root'
})
export class CategoriesService {
  private http = inject(HttpClient);
  private languageService = inject(LanguageService);
  private apiConfig = inject(ApiConfigService);

  // Signal para almacenar las categorías
  categories = signal<CategoryDto[]>([]);
  isLoading = signal(false);

  // Track if initial load has completed
  private initialLoadComplete = false;

  constructor() {
    // Listen for language changes and reload categories
    effect(() => {
      const langChangeCount = this.languageService.languageChanged();

      // Only reload if initial load has completed (avoid double-loading on startup)
      if (this.initialLoadComplete && langChangeCount > 0) {
        this.forceReloadCategories();
      }
    });
  }

  /**
   * Carga las categorías desde el endpoint de Home
   */
  loadCategories(): void {
    if (this.categories().length > 0) {
      // Ya están cargadas
      return;
    }

    this.fetchCategories();
  }

  /**
   * Fuerza la recarga de categorías (ignora el cache)
   */
  forceReloadCategories(): void {
    this.fetchCategories();
  }

  /**
   * Realiza la petición HTTP para obtener categorías
   */
  private fetchCategories(): void {
    this.isLoading.set(true);
    this.http
      .get<{ categories: CategoryDto[] }>(this.apiConfig.getApiUrl('/home'))
      .pipe(
        tap((response) => {
          this.categories.set(response.categories || []);
          this.isLoading.set(false);
          this.initialLoadComplete = true;
        })
      )
      .subscribe({
        error: (err) => {
          console.error('[CategoriesService] ❌ Error loading categories:', err);
          this.isLoading.set(false);
        }
      });
  }

  /**
   * Actualiza las categorías manualmente
   */
  setCategories(categories: CategoryDto[]): void {
    this.categories.set(categories);
    this.initialLoadComplete = true;
  }
}
