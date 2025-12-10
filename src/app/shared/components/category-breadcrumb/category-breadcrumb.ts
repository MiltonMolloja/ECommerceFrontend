import { Component, Input, signal, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { CategoryService } from '../../../core/services/category.service';
import { CategoryBreadcrumb as BreadcrumbModel } from '../../../core/models';

/**
 * Componente de breadcrumbs para navegación de categorías
 * Muestra la ruta completa desde la raíz hasta la categoría actual
 * Ejemplo: Inicio > Electrónica > Computadoras > Laptops
 */
@Component({
  selector: 'app-category-breadcrumb',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './category-breadcrumb.html',
  styleUrl: './category-breadcrumb.scss'
})
export class CategoryBreadcrumbComponent {
  private readonly categoryService = inject(CategoryService);
  private readonly router = inject(Router);

  // Input: Slug de la categoría actual
  @Input() set categorySlug(value: string | null) {
    if (value) {
      this.loadBreadcrumbs(value);
    } else {
      this.breadcrumbs.set([]);
    }
  }

  // Input alternativo: ID de categoría
  @Input() set categoryId(value: number | null) {
    if (value) {
      this.loadBreadcrumbsById(value);
    } else {
      this.breadcrumbs.set([]);
    }
  }

  // Signal con los breadcrumbs
  readonly breadcrumbs = signal<BreadcrumbModel[]>([]);
  readonly loading = signal<boolean>(false);
  readonly error = signal<string | null>(null);

  /**
   * Carga los breadcrumbs por slug
   */
  private loadBreadcrumbs(slug: string): void {
    this.loading.set(true);
    this.error.set(null);

    this.categoryService.getBreadcrumbsBySlug(slug).subscribe({
      next: (crumbs) => {
        this.breadcrumbs.set(crumbs);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading breadcrumbs:', err);
        this.error.set('Error al cargar la navegación');
        this.breadcrumbs.set([]);
        this.loading.set(false);
      }
    });
  }

  /**
   * Carga los breadcrumbs por ID
   */
  private loadBreadcrumbsById(id: number): void {
    this.loading.set(true);
    this.error.set(null);

    this.categoryService.getBreadcrumbs(id).subscribe({
      next: (crumbs) => {
        this.breadcrumbs.set(crumbs);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading breadcrumbs:', err);
        this.error.set('Error al cargar la navegación');
        this.breadcrumbs.set([]);
        this.loading.set(false);
      }
    });
  }

  /**
   * Navega a una categoría
   */
  navigateToCategory(breadcrumb: BreadcrumbModel, event: Event): void {
    event.preventDefault();
    const url = this.categoryService.getCategoryUrl(breadcrumb.slug);
    this.router.navigate([url]);
  }

  /**
   * Navega al inicio
   */
  navigateToHome(event: Event): void {
    event.preventDefault();
    this.router.navigate(['/']);
  }
}
