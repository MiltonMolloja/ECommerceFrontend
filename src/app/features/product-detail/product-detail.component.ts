import {
  Component,
  OnInit,
  OnDestroy,
  inject,
  signal,
  computed,
  effect,
  ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';

// Angular Material
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';

// Translation
import { TranslateModule } from '@ngx-translate/core';

// Services
import { CartService } from '../../core/services/cart.service';
import { LanguageService } from '../../core/services/language.service';
import { ApiConfigService } from '../../core/services/api-config.service';

// Components
import { ProductDetailImagesComponent } from './components/product-detail-images/product-detail-images.component';
import {
  ProductDetailInfoComponent,
  ProductInfo
} from './components/product-detail-info/product-detail-info.component';
import { ProductSpecificationsComponent } from './components/product-specifications/product-specifications.component';
import { ProductReviewsComponent } from '../../shared/components/product-reviews/product-reviews.component';

/**
 * Categoría del producto (del backend)
 */
interface ProductCategory {
  categoryId: number;
  name: string;
  description?: string;
  slug: string;
  isActive?: boolean;
  displayOrder?: number;
}

/**
 * Interfaz de respuesta del backend (flexible)
 */
interface ProductDetailResponse {
  productId?: string | number;
  id?: string | number;
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
  totalReviews?: number; // Backend usa totalReviews
  ratingCount?: number;
  imageUrls?: string[];
  imageUrl?: string;
  brandId?: number; // ID de la marca
  brand?: string | { name?: string; id?: string }; // Soportar string o objeto
  brandName?: string;
  category?: string | { name?: string; id?: string }; // Soportar string o objeto (deprecated)
  categoryName?: string;
  categories?: ProductCategory[]; // Array de categorías
  primaryCategory?: ProductCategory; // Categoría principal
  inStock?: boolean;
  stock?:
    | number
    | {
        stock?: number;
        minStock?: number;
        maxStock?: number;
        isLowStock?: boolean;
        isOutOfStock?: boolean;
      };
  stockQuantity?: number;
  features?: string[];
  specifications?: Record<string, string>;
}

/**
 * Componente principal de detalle de producto
 * Integra todos los sub-componentes:
 * - ProductDetailImagesComponent
 * - ProductDetailInfoComponent
 * - ProductSpecificationsComponent
 * - ProductReviewsComponent
 */
@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatSnackBarModule,
    MatCardModule,
    TranslateModule,
    ProductDetailImagesComponent,
    ProductDetailInfoComponent,
    ProductSpecificationsComponent,
    ProductReviewsComponent
  ],
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductDetailComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private location = inject(Location);
  private http = inject(HttpClient);
  private languageService = inject(LanguageService);
  private cartService = inject(CartService);
  private snackBar = inject(MatSnackBar);
  private apiConfig = inject(ApiConfigService);
  private destroy$ = new Subject<void>();

  // Estado reactivo
  loading = signal(true);
  error = signal<string | null>(null);
  productResponse = signal<ProductDetailResponse | null>(null);
  currentProductId: string | null = null;
  // Helper method to access Object in template
  readonly Object = Object;

  // Computed signals para datos transformados
  productImages = computed(() => {
    const product = this.productResponse();
    if (!product) return ['/assets/placeholder.png'];

    // Obtener imágenes en orden de prioridad
    if (product.imageUrls && Array.isArray(product.imageUrls) && product.imageUrls.length > 0) {
      return product.imageUrls;
    }

    if (product.imageUrl) {
      return [product.imageUrl];
    }

    return ['/assets/placeholder.png'];
  });

  productInfo = computed((): ProductInfo | null => {
    const product = this.productResponse();
    if (!product) return null;

    const productId = product.productId || product.id;
    const name = product.name || product.title || 'Producto sin nombre';

    // Extract brandId
    const brandId =
      product.brandId || (typeof product.brand === 'object' ? product.brand?.id : undefined);

    // Soportar brand como string o como objeto { name: string }
    const brandName =
      typeof product.brand === 'string'
        ? product.brand
        : product.brand?.name || product.brandName || 'Sin marca';

    // Debug log para verificar la marca
    console.log('🏷️ Brand mapping:', {
      rawBrand: product.brand,
      brandType: typeof product.brand,
      brandId: brandId,
      brandName: product.brandName,
      finalBrandName: brandName
    });

    const categoryName =
      typeof product.category === 'string'
        ? product.category
        : product.category?.name || product.categoryName || 'Sin categoría';
    const currentPrice = product.price || product.currentPrice || 0;
    const currency = product.currency || 'USD';
    const rating = product.rating || product.averageRating || 0;
    const reviewCount = product.totalReviews || product.reviewCount || product.ratingCount || 0;

    // Extract stock information (support both number and object)
    const stockInfo =
      typeof product.stock === 'object'
        ? product.stock
        : { stock: product.stock || product.stockQuantity || 0 };

    const inStock =
      product.inStock !== undefined
        ? product.inStock
        : stockInfo.isOutOfStock !== undefined
          ? !stockInfo.isOutOfStock
          : (stockInfo.stock || 0) > 0;

    // Build price object with proper optional handling
    const priceObject: {
      current: number;
      original?: number;
      currency: string;
      discount?: number;
    } = {
      current: currentPrice,
      currency
    };

    if (product.originalPrice !== undefined) {
      priceObject.original = product.originalPrice;
    }

    const discount = product.discount || product.discountPercentage;
    if (discount !== undefined) {
      priceObject.discount = discount;
    }

    // Build availability object with proper optional handling
    const availabilityObject: {
      inStock: boolean;
      quantity?: number;
    } = {
      inStock
    };

    // Extract quantity from stock object or direct number
    const quantity = stockInfo.stock !== undefined ? stockInfo.stock : product.stockQuantity;
    if (quantity !== undefined) {
      availabilityObject.quantity = quantity;
    }

    // Create base result object without imageUrl
    const result: ProductInfo = {
      productId: productId!,
      name,
      brand: brandName,
      category: categoryName, // Deprecated - mantener por compatibilidad
      price: priceObject,
      rating: {
        average: rating,
        count: reviewCount
      },
      availability: availabilityObject,
      features: product.features || []
    };

    // Add brandId if available
    if (brandId !== undefined) {
      result.brandId = Number(brandId);
    }

    // Add imageUrl only if it exists (proper handling for exactOptionalPropertyTypes)
    const imageUrl = this.productImages()[0];
    if (imageUrl && imageUrl !== '/assets/placeholder.png') {
      result.imageUrl = imageUrl;
    }

    // Map categories from backend response
    if (product.primaryCategory) {
      result.primaryCategory = {
        categoryId: product.primaryCategory.categoryId,
        name: product.primaryCategory.name,
        slug: product.primaryCategory.slug
      };
      console.log('✅ Mapped primaryCategory:', result.primaryCategory);
    } else {
      console.warn('⚠️ No primaryCategory in product response');
    }

    if (product.categories && product.categories.length > 0) {
      result.categories = product.categories.map((cat) => ({
        categoryId: cat.categoryId,
        name: cat.name,
        slug: cat.slug
      }));
      console.log('✅ Mapped categories:', result.categories);
    } else {
      console.warn('⚠️ No categories in product response');
    }

    console.log('📋 Final ProductInfo:', result);
    return result;
  });

  productSpecifications = computed(() => {
    const product = this.productResponse();
    return product?.specifications || {};
  });

  productIdNumber = computed(() => {
    const product = this.productResponse();
    const id = product?.productId || product?.id;
    return typeof id === 'number' ? id : parseInt(id as string, 10);
  });

  breadcrumbs = computed(() => {
    const product = this.productResponse();
    const categoryName =
      typeof product?.category === 'string'
        ? product.category
        : product?.category?.name || product?.categoryName;

    return [
      { label: 'Inicio', url: '/' },
      { label: 'Buscar', url: '/s' },
      ...(categoryName ? [{ label: categoryName, url: `/s?category=${categoryName}` }] : []),
      { label: product?.name || product?.title || 'Producto', url: '' }
    ];
  });

  constructor() {
    // Recargar producto cuando cambia el idioma
    effect(() => {
      const languageChanged = this.languageService.languageChanged();
      if (languageChanged > 0 && this.currentProductId) {
        this.loadProduct(this.currentProductId);
      }
    });
  }

  ngOnInit(): void {
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      const productId = params['id'];
      if (productId) {
        this.currentProductId = productId;
        this.loadProduct(productId);
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Cargar producto desde el backend
   */
  private loadProduct(id: string): void {
    this.loading.set(true);
    this.error.set(null);

    console.log('🌐 Current language:', this.languageService.currentLanguage());

    this.http
      .get<ProductDetailResponse>(`${this.apiConfig.getApiUrl('/products')}/${id}`)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.loading.set(false);
        })
      )
      .subscribe({
        next: (response) => {
          console.log('📦 Product API Response:', response);
          console.log('🏷️ Categories:', response.categories);
          console.log('🎯 Primary Category:', response.primaryCategory);

          this.productResponse.set(response);

          // Analytics tracking
          this.trackProductView(response);
        },
        error: () => {
          this.error.set('No se pudo cargar el producto. Por favor, intenta de nuevo.');

          // Mostrar notificación de error
          this.snackBar.open('Error al cargar el producto', 'Cerrar', {
            duration: 5000,
            horizontalPosition: 'end',
            verticalPosition: 'top',
            panelClass: ['error-snackbar']
          });
        }
      });
  }

  /**
   * Navegar hacia atrás
   */
  goBack(): void {
    if (window.history.length > 1) {
      this.location.back();
    } else {
      this.router.navigate(['/s']);
    }
  }

  /**
   * Reintentar carga del producto
   */
  retry(): void {
    if (this.currentProductId) {
      this.loadProduct(this.currentProductId);
    }
  }

  /**
   * Manejar el evento de agregar al carrito
   */
  onAddToCart(quantity: number): void {
    const product = this.productResponse();
    if (!product) return;

    console.log(`🛒 Added ${quantity} item(s) to cart`);

    // Mostrar notificación
    this.snackBar
      .open(
        `✓ ${quantity} ${quantity === 1 ? 'producto agregado' : 'productos agregados'} al carrito`,
        'Ver carrito',
        {
          duration: 4000,
          horizontalPosition: 'end',
          verticalPosition: 'top'
        }
      )
      .onAction()
      .subscribe(() => {
        this.router.navigate(['/cart']);
      });

    // Analytics tracking
    this.trackAddToCart(product, quantity);
  }

  /**
   * Scroll suave a las reviews con offset para mostrar el título
   */
  scrollToReviews(): void {
    const reviewsElement = document.getElementById('reviews-section');
    if (reviewsElement) {
      // Obtener la posición del elemento
      const elementPosition = reviewsElement.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - 150; // 150px de offset

      // Scroll suave con offset
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  }

  /**
   * Track product view (analytics)
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private trackProductView(_product: ProductDetailResponse): void {
    // TODO: Implementar integración con Google Analytics, etc.
  }

  /**
   * Track add to cart (analytics)
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private trackAddToCart(_product: ProductDetailResponse, _quantity: number): void {
    // TODO: Implementar integración con Google Analytics, etc.
  }
}
