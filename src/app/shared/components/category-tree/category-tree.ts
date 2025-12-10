import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatTreeModule, MatTreeNestedDataSource } from '@angular/material/tree';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { NestedTreeControl } from '@angular/cdk/tree';
import { CategoryService } from '../../../core/services/category.service';
import { CategoryTree as CategoryTreeModel } from '../../../core/models';

/**
 * Componente de árbol de categorías con navegación
 * Usa Angular Material Tree y Signals para estado reactivo
 */
@Component({
  selector: 'app-category-tree',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatTreeModule,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './category-tree.html',
  styleUrl: './category-tree.scss'
})
export class CategoryTreeComponent implements OnInit {
  private readonly categoryService = inject(CategoryService);
  private readonly router = inject(Router);

  // Signals
  readonly categories = signal<CategoryTreeModel[]>([]);
  readonly loading = signal<boolean>(true);
  readonly error = signal<string | null>(null);

  // Material Tree
  treeControl = new NestedTreeControl<CategoryTreeModel>(node => node.subCategories);
  dataSource = new MatTreeNestedDataSource<CategoryTreeModel>();

  // Computed: categorías con productos
  readonly categoriesWithProducts = computed(() => 
    this.categories().filter(cat => cat.productCount > 0 || this.hasProductsInSubcategories(cat))
  );

  ngOnInit(): void {
    this.loadCategories();
  }

  /**
   * Carga el árbol de categorías desde el servicio
   */
  private loadCategories(): void {
    this.loading.set(true);
    this.error.set(null);

    this.categoryService.getCategoryTree().subscribe({
      next: (tree) => {
        // Filtrar categorías sin productos
        const filteredTree = this.filterCategoriesWithProducts(tree);
        this.categories.set(filteredTree);
        this.dataSource.data = filteredTree;
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading category tree:', err);
        this.error.set('Error al cargar las categorías');
        this.loading.set(false);
      }
    });
  }

  /**
   * Filtra categorías que tienen productos (recursivamente)
   */
  private filterCategoriesWithProducts(categories: CategoryTreeModel[]): CategoryTreeModel[] {
    return categories
      .map(category => {
        const filteredSubCategories = category.subCategories.length > 0
          ? this.filterCategoriesWithProducts(category.subCategories)
          : [];

        return {
          ...category,
          subCategories: filteredSubCategories
        };
      })
      .filter(category => {
        return category.productCount > 0 || category.subCategories.length > 0;
      });
  }

  /**
   * Verifica si un nodo tiene hijos
   */
  hasChild = (_: number, node: CategoryTreeModel): boolean => {
    return node.subCategories && node.subCategories.length > 0;
  };

  /**
   * Verifica si hay productos en subcategorías recursivamente
   */
  private hasProductsInSubcategories(category: CategoryTreeModel): boolean {
    if (category.productCount > 0) {
      return true;
    }
    if (category.subCategories && category.subCategories.length > 0) {
      return category.subCategories.some(sub => this.hasProductsInSubcategories(sub));
    }
    return false;
  }

  /**
   * Navega a una categoría
   */
  navigateToCategory(category: CategoryTreeModel, event: Event): void {
    event.stopPropagation(); // Evita que se expanda/colapse el nodo
    const url = this.categoryService.getCategoryUrl(category.slug);
    this.router.navigate([url]);
  }

  /**
   * Expande todos los nodos
   */
  expandAll(): void {
    this.treeControl.expandAll();
  }

  /**
   * Colapsa todos los nodos
   */
  collapseAll(): void {
    this.treeControl.collapseAll();
  }

  /**
   * Refresca las categorías desde el servidor
   */
  refresh(): void {
    this.categoryService.clearCache();
    this.loadCategories();
  }
}
