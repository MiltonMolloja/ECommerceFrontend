import { Component, OnInit, Output, EventEmitter, Input, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { CategoryService } from '../../../core/services/category.service';
import { CategoryTree } from '../../../core/models';

/**
 * Componente de filtro lateral de categorías
 * Muestra categorías expandibles para filtrar productos en el catálogo
 * Diseñado para sidebar de productos
 */
@Component({
  selector: 'app-category-filter',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatExpansionModule,
    MatListModule,
    MatIconModule,
    MatBadgeModule,
    MatButtonModule
  ],
  templateUrl: './category-filter.html',
  styleUrl: './category-filter.scss'
})
export class CategoryFilterComponent implements OnInit {
  private readonly categoryService = inject(CategoryService);
  private readonly router = inject(Router);

  // Input: Slug de categoría seleccionada actualmente
  @Input() selectedCategorySlug: string | null = null;

  // Output: Evento cuando se selecciona una categoría
  @Output() categorySelected = new EventEmitter<CategoryTree>();

  // Signals
  readonly categories = signal<CategoryTree[]>([]);
  readonly loading = signal<boolean>(true);
  readonly error = signal<string | null>(null);
  readonly expandedCategories = signal<Set<number>>(new Set());

  ngOnInit(): void {
    this.loadCategories();
  }

  /**
   * Carga el árbol de categorías
   */
  private loadCategories(): void {
    this.loading.set(true);
    this.error.set(null);

    this.categoryService.getCategoryTree().subscribe({
      next: (tree) => {
        // Filtrar categorías sin productos (recursivamente)
        const filteredTree = this.filterCategoriesWithProducts(tree);
        this.categories.set(filteredTree);
        this.loading.set(false);
        
        // Auto-expandir categoría seleccionada
        if (this.selectedCategorySlug) {
          this.expandSelectedCategory(filteredTree);
        }
      },
      error: (err) => {
        console.error('Error loading categories:', err);
        this.error.set('Error al cargar categorías');
        this.loading.set(false);
      }
    });
  }

  /**
   * Filtra categorías que tienen productos (recursivamente)
   * Una categoría se muestra si:
   * - Tiene productos directamente (productCount > 0)
   * - O alguna de sus subcategorías tiene productos
   */
  private filterCategoriesWithProducts(categories: CategoryTree[]): CategoryTree[] {
    return categories
      .map(category => {
        // Filtrar subcategorías recursivamente
        const filteredSubCategories = category.subCategories.length > 0
          ? this.filterCategoriesWithProducts(category.subCategories)
          : [];

        // Retornar categoría con subcategorías filtradas
        return {
          ...category,
          subCategories: filteredSubCategories
        };
      })
      .filter(category => {
        // Mostrar si tiene productos o si tiene subcategorías con productos
        return category.productCount > 0 || category.subCategories.length > 0;
      });
  }

  /**
   * Expande la categoría seleccionada y sus padres
   */
  private expandSelectedCategory(tree: CategoryTree[]): void {
    const path = this.categoryService.getCategoryPath(tree, this.selectedCategorySlug!);
    const expanded = new Set(path);
    this.expandedCategories.set(expanded);
  }

  /**
   * Toggle expansión de una categoría
   */
  toggleCategory(categoryId: number): void {
    const expanded = new Set(this.expandedCategories());
    if (expanded.has(categoryId)) {
      expanded.delete(categoryId);
    } else {
      expanded.add(categoryId);
    }
    this.expandedCategories.set(expanded);
  }

  /**
   * Verifica si una categoría está expandida
   */
  isCategoryExpanded(categoryId: number): boolean {
    return this.expandedCategories().has(categoryId);
  }

  /**
   * Verifica si una categoría está seleccionada
   */
  isCategorySelected(slug: string): boolean {
    return this.selectedCategorySlug === slug;
  }

  /**
   * Maneja el click en una categoría
   */
  onCategoryClick(category: CategoryTree, event: Event): void {
    event.stopPropagation();
    this.categorySelected.emit(category);
    
    // Opcionalmente navegar a la categoría
    const url = this.categoryService.getCategoryUrl(category.slug);
    this.router.navigate([url]);
  }

  /**
   * Limpia el filtro de categorías
   */
  clearFilter(): void {
    this.selectedCategorySlug = null;
    this.categorySelected.emit(null as any);
    this.router.navigate(['/catalog']);
  }

  /**
   * Expande todas las categorías
   */
  expandAll(): void {
    const allIds = this.getAllCategoryIds(this.categories());
    this.expandedCategories.set(new Set(allIds));
  }

  /**
   * Colapsa todas las categorías
   */
  collapseAll(): void {
    this.expandedCategories.set(new Set());
  }

  /**
   * Obtiene todos los IDs de categorías recursivamente
   */
  private getAllCategoryIds(categories: CategoryTree[]): number[] {
    const ids: number[] = [];
    const traverse = (cats: CategoryTree[]) => {
      cats.forEach(cat => {
        ids.push(cat.categoryId);
        if (cat.subCategories.length > 0) {
          traverse(cat.subCategories);
        }
      });
    };
    traverse(categories);
    return ids;
  }

  /**
   * Verifica si tiene productos
   */
  hasProducts(category: CategoryTree): boolean {
    return category.productCount > 0;
  }
}
