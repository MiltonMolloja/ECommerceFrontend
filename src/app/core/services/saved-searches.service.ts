import { Injectable, signal, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export interface SavedSearch {
  id: string;
  name: string;
  query: string;
  filters: {
    categories?: number[];
    brands?: number[];
    priceMin?: number;
    priceMax?: number;
    minRating?: number;
    inStock?: boolean;
    hasDiscount?: boolean;
    attributes?: Record<string, string[]>;
  };
  createdAt: Date;
  lastUsed?: Date;
  useCount: number;
}

const STORAGE_KEY = 'saved_searches';
const MAX_SAVED_SEARCHES = 20;

@Injectable({
  providedIn: 'root'
})
export class SavedSearchesService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly savedSearches = signal<SavedSearch[]>(this.loadSavedSearches());

  getSavedSearches(): SavedSearch[] {
    return this.savedSearches();
  }

  saveSearch(search: Omit<SavedSearch, 'id' | 'createdAt' | 'useCount'>): SavedSearch {
    const newSearch: SavedSearch = {
      ...search,
      id: this.generateId(),
      createdAt: new Date(),
      useCount: 0
    };

    const current = this.savedSearches();

    // Verificar si ya existe una búsqueda con el mismo nombre
    const existingIndex = current.findIndex(
      (s) => s.name.toLowerCase() === search.name.toLowerCase()
    );

    if (existingIndex !== -1 && current[existingIndex]) {
      // Actualizar la búsqueda existente
      const updated = [...current];
      const existing = current[existingIndex]!;
      updated[existingIndex] = { ...newSearch, id: existing.id, createdAt: existing.createdAt };
      this.savedSearches.set(updated);
      this.persist(updated);
      return updated[existingIndex];
    }

    // Agregar nueva búsqueda
    const updated = [newSearch, ...current].slice(0, MAX_SAVED_SEARCHES);
    this.savedSearches.set(updated);
    this.persist(updated);

    return newSearch;
  }

  deleteSearch(id: string): void {
    const updated = this.savedSearches().filter((s) => s.id !== id);
    this.savedSearches.set(updated);
    this.persist(updated);
  }

  updateSearch(id: string, updates: Partial<SavedSearch>): void {
    const current = this.savedSearches();
    const index = current.findIndex((s) => s.id === id);

    if (index !== -1) {
      const updated = [...current];
      const existingSearch = updated[index];
      updated[index] = { ...existingSearch, ...updates } as SavedSearch;
      this.savedSearches.set(updated);
      this.persist(updated);
    }
  }

  markAsUsed(id: string): void {
    const current = this.savedSearches();
    const index = current.findIndex((s) => s.id === id);

    if (index !== -1 && current[index]) {
      const updated = [...current];
      const existingSearch = updated[index]!;
      updated[index] = {
        ...existingSearch,
        lastUsed: new Date(),
        useCount: existingSearch.useCount + 1
      };
      this.savedSearches.set(updated);
      this.persist(updated);
    }
  }

  getSearchById(id: string): SavedSearch | undefined {
    return this.savedSearches().find((s) => s.id === id);
  }

  clearAll(): void {
    this.savedSearches.set([]);
    if (isPlatformBrowser(this.platformId)) {
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {
        // Ignore storage errors
      }
    }
  }

  private loadSavedSearches(): SavedSearch[] {
    if (!isPlatformBrowser(this.platformId)) {
      return [];
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return [];

      const parsed = JSON.parse(stored);

      // Convertir strings de fecha a objetos Date
      return parsed.map((search: SavedSearch) => ({
        ...search,
        createdAt: new Date(search.createdAt),
        lastUsed: search.lastUsed ? new Date(search.lastUsed) : undefined
      }));
    } catch {
      return [];
    }
  }

  private persist(searches: SavedSearch[]): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(searches));
    } catch {
      // Ignore storage errors (quota exceeded, incognito mode, etc.)
    }
  }

  private generateId(): string {
    return `search_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Helpers para comparar búsquedas
  isSimilarSearch(search1: SavedSearch, search2: Partial<SavedSearch>): boolean {
    return (
      search1.query === search2.query &&
      JSON.stringify(search1.filters) === JSON.stringify(search2.filters)
    );
  }

  // Obtener búsquedas más usadas
  getMostUsed(limit = 5): SavedSearch[] {
    return [...this.savedSearches()].sort((a, b) => b.useCount - a.useCount).slice(0, limit);
  }

  // Obtener búsquedas más recientes
  getMostRecent(limit = 5): SavedSearch[] {
    return [...this.savedSearches()]
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }
}
