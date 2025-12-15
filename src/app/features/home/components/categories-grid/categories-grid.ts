/**
 * CategoriesGridComponent - Grid de categorías destacadas
 *
 * Muestra las categorías destacadas en un grid responsive
 * Features:
 * - Grid responsive (2-3-4 columnas según viewport)
 * - Navegación a página de categoría
 * - Imágenes lazy loading
 * - Contador de productos
 * - Hover effects
 */

import { Component, input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CategoryDto } from '@core/models';

@Component({
  selector: 'app-categories-grid',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    TranslateModule
  ],
  templateUrl: './categories-grid.html',
  styleUrl: './categories-grid.scss'
})
export class CategoriesGrid {
  private router = inject(Router);
  private translate = inject(TranslateService);

  // Input: Categorías destacadas del backend
  categories = input<CategoryDto[]>([]);

  /**
   * Obtiene la URL de la imagen de la categoría
   * Fallback a imagen por defecto si no existe
   */
  getCategoryImage(category: CategoryDto): string {
    return category.imageUrl || '/assets/images/category-placeholder.jpg';
  }

  /**
   * Navega a la página de búsqueda con filtro de categoría
   */
  navigateToCategory(category: CategoryDto): void {
    this.router.navigate(['/s'], {
      queryParams: { filter_category: category.categoryId }
    });
  }

  /**
   * Formatea el contador de productos con traducción
   */
  formatProductCount(count: number): string {
    if (count >= 1000) {
      const kCount = (count / 1000).toFixed(1);
      return this.translate.instant('PRODUCT.PRODUCTS_COUNT_K', { count: kCount });
    }
    return this.translate.instant('PRODUCT.PRODUCTS_COUNT', { count });
  }
}
