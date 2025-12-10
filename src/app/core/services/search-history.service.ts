import { Injectable, signal } from '@angular/core';

const STORAGE_KEY = 'search_history';
const MAX_HISTORY_ITEMS = 10;

@Injectable({
  providedIn: 'root'
})
export class SearchHistoryService {
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
      item => item.toLowerCase() !== trimmedQuery.toLowerCase()
    );

    // Agregar al inicio
    const newHistory = [trimmedQuery, ...filtered].slice(0, MAX_HISTORY_ITEMS);

    this.history.set(newHistory);
    this.saveHistory(newHistory);
  }

  removeSearch(query: string): void {
    const currentHistory = this.history();
    const newHistory = currentHistory.filter(item => item !== query);

    this.history.set(newHistory);
    this.saveHistory(newHistory);
  }

  clearHistory(): void {
    this.history.set([]);
    localStorage.removeItem(STORAGE_KEY);
  }

  private loadHistory(): string[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  private saveHistory(history: string[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    } catch (error) {

    }
  }
}
