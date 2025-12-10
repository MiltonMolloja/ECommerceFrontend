import { Component, signal, OnInit, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { CatalogService } from '../services/catalog.service';
import { CategoryService } from '../../../core/services/category.service';
import { Product, Category, CategoryTree, ProductCategory } from '../../../core/models';
import { CategoryBreadcrumbComponent } from '../../../shared/components/category-breadcrumb/category-breadcrumb';
import { CategoryFilterComponent } from '../../../shared/components/category-filter/category-filter';

@Component({
  selector: 'app-catalog-list',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatIconModule,
    CategoryBreadcrumbComponent,
    CategoryFilterComponent
  ],
  templateUrl: './catalog-list.component.html',
  styleUrl: './catalog-list.component.scss'
})
export class CatalogListComponent implements OnInit {
  readonly products = signal<Product[]>([]);
  readonly loading = signal(false);
  readonly currentCategorySlug = signal<string | null>(null);
  readonly currentCategory = signal<Category | null>(null);

  private catalogService = inject(CatalogService);
  private categoryService = inject(CategoryService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  constructor() {
    // Effect para reaccionar a cambios en la ruta
    effect(() => {
      const slug = this.currentCategorySlug();
      if (slug) {
        this.loadCategoryInfo(slug);
      }
    });
  }

  ngOnInit(): void {
    // Suscribirse a cambios en los parámetros de ruta
    this.route.paramMap.subscribe(params => {
      const slug = params.get('categorySlug');
      this.currentCategorySlug.set(slug);
      this.loadProducts(slug);
    });
  }

  /**
   * Carga información de la categoría actual
   */
  private loadCategoryInfo(slug: string): void {
    this.categoryService.getBySlug(slug).subscribe({
      next: (category) => {
        this.currentCategory.set(category);
      },
      error: (err) => {
        console.error('Error loading category:', err);
        this.currentCategory.set(null);
      }
    });
  }

  /**
   * Carga productos, opcionalmente filtrados por categoría
   */
  private loadProducts(categorySlug: string | null = null): void {
    this.loading.set(true);
    
    // TODO: Modificar CatalogService para aceptar categorySlug como parámetro
    // Por ahora, carga todos los productos
    this.catalogService.getProducts(1, 100).subscribe({
      next: (response) => {
        // Si hay categoría, filtrar productos localmente (temporal)
        let filteredProducts = response.items;
        
        if (categorySlug && this.currentCategory()) {
          filteredProducts = response.items.filter(p => 
            p.categories?.some((c: ProductCategory) => c.slug === categorySlug)
          );
        }
        
        this.products.set(filteredProducts);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading products:', err);
        this.loading.set(false);
      }
    });
  }

  /**
   * Maneja la selección de categoría desde el filtro lateral
   */
  onCategorySelected(category: CategoryTree | null): void {
    if (category) {
      this.router.navigate(['/catalog', category.slug]);
    } else {
      this.router.navigate(['/catalog']);
    }
  }

  addToCart(product: Product): void {

    // Aquí integrar con servicio de carrito
  }

  /**
   * trackBy para mejorar performance en @for
   */
  trackByProductId(index: number, product: Product): number {
    return product.productId;
  }
}
