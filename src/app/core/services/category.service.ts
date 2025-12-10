import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap, catchError, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { 
  Category, 
  CategoryTree, 
  CategoryBreadcrumb, 
  CategorySearchRequest 
} from '../models/catalog/category.model';
import { DataCollection } from '../models/common/data-collection.model';

/**
 * Servicio para gestión de categorías de productos
 * Utiliza Angular Signals para estado reactivo
 */
@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiGatewayUrl}/catalog/v1/categories`;

  // Signals para cache de datos frecuentemente usados
  private categoryTreeCache = signal<CategoryTree[] | null>(null);
  private rootCategoriesCache = signal<Category[] | null>(null);

  // Getters públicos para signals (readonly)
  readonly categoryTree = this.categoryTreeCache.asReadonly();
  readonly rootCategories = this.rootCategoriesCache.asReadonly();

  /**
   * Obtiene todas las categorías con paginación
   */
  getAll(request: CategorySearchRequest = {}): Observable<DataCollection<Category>> {
    let params = new HttpParams();
    
    if (request.page) {
      params = params.set('page', request.page.toString());
    }
    if (request.take) {
      params = params.set('take', request.take.toString());
    }

    return this.http.get<DataCollection<Category>>(`${this.baseUrl}`, { params });
  }

  /**
   * Obtiene una categoría por ID con sus subcategorías
   */
  getById(id: number): Observable<Category> {
    return this.http.get<Category>(`${this.baseUrl}/${id}`);
  }

  /**
   * Obtiene una categoría por Slug
   */
  getBySlug(slug: string): Observable<Category> {
    return this.http.get<Category>(`${this.baseUrl}/by-slug/${slug}`);
  }

  /**
   * Obtiene el árbol completo de categorías activas
   * Usa cache en signal para evitar múltiples llamadas
   */
  getCategoryTree(forceRefresh = false): Observable<CategoryTree[]> {
    // Si ya está en cache y no se fuerza refresh, retornar cache
    if (!forceRefresh && this.categoryTreeCache()) {
      return of(this.categoryTreeCache()!);
    }

    return this.http.get<CategoryTree[]>(`${this.baseUrl}/tree`).pipe(
      tap(tree => this.categoryTreeCache.set(tree)),
      catchError(error => {
        console.error('Error fetching category tree:', error);
        return of([]);
      })
    );
  }

  /**
   * Obtiene solo las categorías raíz (sin padre)
   * Usa cache en signal para evitar múltiples llamadas
   */
  getRootCategories(forceRefresh = false): Observable<Category[]> {
    // Si ya está en cache y no se fuerza refresh, retornar cache
    if (!forceRefresh && this.rootCategoriesCache()) {
      return of(this.rootCategoriesCache()!);
    }

    return this.http.get<Category[]>(`${this.baseUrl}/root`).pipe(
      tap(categories => this.rootCategoriesCache.set(categories)),
      catchError(error => {
        console.error('Error fetching root categories:', error);
        return of([]);
      })
    );
  }

  /**
   * Obtiene las subcategorías de una categoría
   */
  getSubCategories(parentId: number): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.baseUrl}/${parentId}/subcategories`);
  }

  /**
   * Obtiene los breadcrumbs de una categoría por ID
   */
  getBreadcrumbs(categoryId: number): Observable<CategoryBreadcrumb[]> {
    return this.http.get<CategoryBreadcrumb[]>(`${this.baseUrl}/${categoryId}/breadcrumbs`);
  }

  /**
   * Obtiene los breadcrumbs de una categoría por Slug
   */
  getBreadcrumbsBySlug(slug: string): Observable<CategoryBreadcrumb[]> {
    return this.http.get<CategoryBreadcrumb[]>(`${this.baseUrl}/by-slug/${slug}/breadcrumbs`);
  }

  /**
   * Limpia el cache de categorías
   * Útil cuando se actualizan categorías desde admin
   */
  clearCache(): void {
    this.categoryTreeCache.set(null);
    this.rootCategoriesCache.set(null);
  }

  /**
   * Construye la URL para navegar a una categoría
   */
  getCategoryUrl(slug: string): string {
    return `/catalog/${slug}`;
  }

  /**
   * Busca una categoría por slug en el árbol de categorías (recursivo)
   */
  findCategoryInTree(tree: CategoryTree[], slug: string): CategoryTree | null {
    for (const category of tree) {
      if (category.slug === slug) {
        return category;
      }
      if (category.subCategories.length > 0) {
        const found = this.findCategoryInTree(category.subCategories, slug);
        if (found) {
          return found;
        }
      }
    }
    return null;
  }

  /**
   * Obtiene la ruta completa de IDs de una categoría (para expandir árbol)
   */
  getCategoryPath(tree: CategoryTree[], targetSlug: string): number[] {
    const path: number[] = [];
    
    const findPath = (categories: CategoryTree[], target: string): boolean => {
      for (const category of categories) {
        path.push(category.categoryId);
        
        if (category.slug === target) {
          return true;
        }
        
        if (category.subCategories.length > 0) {
          if (findPath(category.subCategories, target)) {
            return true;
          }
        }
        
        path.pop();
      }
      return false;
    };
    
    findPath(tree, targetSlug);
    return path;
  }
}
