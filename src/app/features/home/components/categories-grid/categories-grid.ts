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

import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CategoryDto } from '@core/models';

@Component({
  selector: 'app-categories-grid',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    MatCardModule, 
    MatButtonModule, 
    MatIconModule
  ],
  templateUrl: './categories-grid.html',
  styleUrl: './categories-grid.scss'
})
export class CategoriesGrid {
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
   * Obtiene el link de navegación a la categoría
   */
  getCategoryLink(category: CategoryDto): string {
    return `/catalog/category/${category.categoryId}`;
  }

  /**
   * Formatea el contador de productos
   */
  formatProductCount(count: number): string {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k+ productos`;
    }
    return `${count} productos`;
  }
}
