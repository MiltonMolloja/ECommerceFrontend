import { Component, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { CatalogService, Product } from '../services/catalog.service';

@Component({
  selector: 'app-catalog-list',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatIconModule
  ],
  templateUrl: './catalog-list.component.html',
  styleUrl: './catalog-list.component.scss'
})
export class CatalogListComponent implements OnInit {
  readonly products = signal<Product[]>([]);
  readonly loading = signal(false);

  private catalogService = inject(CatalogService);

  ngOnInit(): void {
    this.loadProducts();
  }

  private loadProducts(): void {
    this.loading.set(true);
    this.catalogService.getProducts().subscribe({
      next: (products) => {
        this.products.set(products);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error cargando productos:', err);
        this.loading.set(false);
      }
    });
  }

  addToCart(product: Product): void {
    console.log('Producto agregado al carrito:', product);
    // Aquí integrar con servicio de carrito
  }

  /**
   * trackBy para mejorar performance en *ngFor
   */
  trackByProductId(index: number, product: Product): number {
    return product.id;
  }
}
