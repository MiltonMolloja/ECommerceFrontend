import { Injectable, signal, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

const STORAGE_KEY = 'search_history';
const MAX_HISTORY_ITEMS = 10;

@Injectable({
  providedIn: 'root'
})
export class SearchHistoryService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly history = signal<string[]>(this.loadHistory());

  getHistory(): string[] {
    return this.history();
  }

  addSearch(query: string): void {
    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      return;
    }

    const currentHistory = this.history();

    // Remover duplicados (case-insensitive)
    const filtered = currentHistory.filter(
      (item) => item.toLowerCase() !== trimmedQuery.toLowerCase()
    );

    // Agregar al inicio
    const newHistory = [trimmedQuery, ...filtered].slice(0, MAX_HISTORY_ITEMS);

    this.history.set(newHistory);
    this.saveHistory(newHistory);
  }

  removeSearch(query: string): void {
    const currentHistory = this.history();
    const newHistory = currentHistory.filter((item) => item !== query);

    this.history.set(newHistory);
    this.saveHistory(newHistory);
  }

  clearHistory(): void {
    this.history.set([]);
    if (isPlatformBrowser(this.platformId)) {
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {
        // Ignore storage errors
      }
    }
  }

  private loadHistory(): string[] {
    if (!isPlatformBrowser(this.platformId)) {
      return [];
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  private saveHistory(history: string[]): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    } catch {
      // Ignore storage errors (quota exceeded, incognito mode, etc.)
    }
  }
}
