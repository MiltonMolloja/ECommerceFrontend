import { Component, OnInit, inject, signal, effect } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { LanguageService } from '../../core/services/language.service';
import { CartService } from '../../core/services/cart.service';

interface ProductDetailResponse {
  productId?: string;
  id?: string;
  name?: string;
  title?: string;
  description?: string;
  price?: number;
  currentPrice?: number;
  originalPrice?: number;
  currency?: string;
  discount?: number;
  discountPercentage?: number;
  rating?: number;
  averageRating?: number;
  reviewCount?: number;
  ratingCount?: number;
  imageUrls?: string[];
  imageUrl?: string;
  brand?: { name?: string; id?: string };
  brandName?: string;
  category?: { name?: string; id?: string };
  categoryName?: string;
  inStock?: boolean;
  stock?: number;
  stockQuantity?: number;
  deliveryDate?: string;
  features?: string[];
  specifications?: Record<string, string>;
}

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTabsModule,
    MatChipsModule,
    MatSnackBarModule
  ],
  templateUrl: './product-detail.html',
  styleUrls: ['./product-detail.scss']
})
export class ProductDetail implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private location = inject(Location);
  private http = inject(HttpClient);
  private languageService = inject(LanguageService);
  private cartService = inject(CartService);
  private snackBar = inject(MatSnackBar);

  product = signal<ProductDetailResponse | null>(null);
  loading = signal<boolean>(true);
  error = signal<string | null>(null);
  selectedImageIndex = signal<number>(0);
  private currentProductId: string | null = null;
  addingToCart = signal<boolean>(false);

  Math = Math;
  Object = Object;

  constructor() {
    // Watch for language changes and reload product
    effect(() => {
      const languageChanged = this.languageService.languageChanged();
      if (languageChanged > 0 && this.currentProductId) {
        console.log('🌐 Language changed, reloading product detail...');
        this.loadProduct(this.currentProductId);
      }
    });
  }

  ngOnInit(): void {
    const productId = this.route.snapshot.paramMap.get('id');
    if (productId) {
      this.currentProductId = productId;
      this.loadProduct(productId);
    }
  }

  loadProduct(id: string): void {
    this.loading.set(true);
    this.error.set(null);

    this.http.get<ProductDetailResponse>(`/api/products/${id}`).subscribe({
      next: (response) => {
        console.log('Product loaded:', response);
        this.product.set(response);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading product:', err);
        this.error.set('No se pudo cargar el producto');
        this.loading.set(false);
      }
    });
  }

  selectImage(index: number): void {
    this.selectedImageIndex.set(index);
  }

  goBack(): void {
    // Usar location.back() para volver al historial del navegador
    // Esto restaurará automáticamente la página de búsqueda con todos sus parámetros
    if (window.history.length > 1) {
      this.location.back();
    } else {
      // Si no hay historial, redirigir a la página de búsqueda sin parámetros
      this.router.navigate(['/s']);
    }
  }

  addToCart(): void {
    const product = this.product();
    if (!product) return;

    this.addingToCart.set(true);

    // Simular un pequeño delay para feedback visual
    setTimeout(() => {
      const brandName = product.brand?.name || product.brandName;
      this.cartService.addToCart({
        id: (product.productId || product.id) ?? '',
        name: (product.name || product.title) ?? '',
        price: (product.price || product.currentPrice) ?? 0,
        currency: product.currency || 'USD',
        imageUrl: product.imageUrls?.[0] || product.imageUrl || '/assets/placeholder.png',
        ...(brandName && { brand: brandName }),
        inStock: product.inStock !== false
      });

      this.addingToCart.set(false);

      // Mostrar notificación
      this.snackBar
        .open('✅ Producto agregado al carrito', 'Ver carrito', {
          duration: 3000,
          horizontalPosition: 'end',
          verticalPosition: 'top'
        })
        .onAction()
        .subscribe(() => {
          this.router.navigate(['/cart']);
        });
    }, 300);
  }
}
