import { Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

export interface SeoConfig {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'product' | 'article';
  price?: number;
  currency?: string;
  availability?: 'in stock' | 'out of stock' | 'preorder';
}

/**
 * SEO Service for dynamic meta tags management
 * Handles Open Graph, Twitter Cards, and standard meta tags
 */
@Injectable({
  providedIn: 'root'
})
export class SeoService {
  private readonly meta = inject(Meta);
  private readonly title = inject(Title);
  private readonly router = inject(Router);

  private readonly defaultConfig: SeoConfig = {
    title: 'ECommerce - Tu tienda online de confianza',
    description:
      'Descubrí los mejores productos con los mejores precios. Envíos a todo el país y pagos seguros.',
    keywords: 'ecommerce, tienda online, compras, productos, ofertas',
    image: 'https://www.ecommerce.com/assets/og-image.jpg',
    url: 'https://www.ecommerce.com',
    type: 'website'
  };

  private readonly baseUrl = 'https://www.ecommerce.com';

  constructor() {
    // Reset to defaults on navigation
    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => {
      // Meta tags will be updated by the component that loads
    });
  }

  /**
   * Update all SEO meta tags
   */
  updateMetaTags(config: SeoConfig): void {
    const mergedConfig = { ...this.defaultConfig, ...config };

    // Update title
    if (mergedConfig.title) {
      this.title.setTitle(mergedConfig.title);
      this.meta.updateTag({ property: 'og:title', content: mergedConfig.title });
      this.meta.updateTag({ name: 'twitter:title', content: mergedConfig.title });
    }

    // Update description
    if (mergedConfig.description) {
      this.meta.updateTag({ name: 'description', content: mergedConfig.description });
      this.meta.updateTag({ property: 'og:description', content: mergedConfig.description });
      this.meta.updateTag({ name: 'twitter:description', content: mergedConfig.description });
    }

    // Update keywords
    if (mergedConfig.keywords) {
      this.meta.updateTag({ name: 'keywords', content: mergedConfig.keywords });
    }

    // Update image
    if (mergedConfig.image) {
      this.meta.updateTag({ property: 'og:image', content: mergedConfig.image });
      this.meta.updateTag({ name: 'twitter:image', content: mergedConfig.image });
    }

    // Update URL
    const url = mergedConfig.url || `${this.baseUrl}${this.router.url}`;
    this.meta.updateTag({ property: 'og:url', content: url });
    this.meta.updateTag({ name: 'twitter:url', content: url });
    this.updateCanonicalUrl(url);

    // Update type
    if (mergedConfig.type) {
      this.meta.updateTag({ property: 'og:type', content: mergedConfig.type });
    }
  }

  /**
   * Set SEO tags for a product page
   */
  setProductMeta(product: {
    name: string;
    description: string;
    price: number;
    image?: string;
    id: number;
    stock?: number;
  }): void {
    const availability = product.stock && product.stock > 0 ? 'in stock' : 'out of stock';
    const imageUrl = product.image ?? this.defaultConfig.image ?? '';

    this.updateMetaTags({
      title: `${product.name} - ECommerce`,
      description: product.description.substring(0, 160),
      image: imageUrl,
      url: `${this.baseUrl}/products/${product.id}`,
      type: 'product'
    });

    // Product-specific meta tags (Schema.org via Open Graph)
    this.meta.updateTag({ property: 'product:price:amount', content: product.price.toString() });
    this.meta.updateTag({ property: 'product:price:currency', content: 'ARS' });
    this.meta.updateTag({ property: 'product:availability', content: availability });
  }

  /**
   * Set SEO tags for a category page
   */
  setCategoryMeta(category: { name: string; description?: string; id: number }): void {
    this.updateMetaTags({
      title: `${category.name} - ECommerce`,
      description:
        category.description ||
        `Explorá nuestra selección de ${category.name}. Los mejores productos al mejor precio.`,
      url: `${this.baseUrl}/categories/${category.id}`,
      type: 'website'
    });
  }

  /**
   * Set SEO tags for search results
   */
  setSearchMeta(query: string, resultsCount: number): void {
    this.updateMetaTags({
      title: `Resultados para "${query}" - ECommerce`,
      description: `${resultsCount} productos encontrados para "${query}". Descubrí las mejores ofertas.`,
      url: `${this.baseUrl}/search?q=${encodeURIComponent(query)}`,
      type: 'website'
    });
  }

  /**
   * Reset to default meta tags
   */
  resetToDefaults(): void {
    this.updateMetaTags(this.defaultConfig);
  }

  /**
   * Update canonical URL
   */
  private updateCanonicalUrl(url: string): void {
    let link: HTMLLinkElement | null = document.querySelector('link[rel="canonical"]');

    if (!link) {
      link = document.createElement('link');
      link.setAttribute('rel', 'canonical');
      document.head.appendChild(link);
    }

    link.setAttribute('href', url);
  }

  /**
   * Add structured data (JSON-LD) for products
   */
  addProductStructuredData(product: {
    name: string;
    description: string;
    price: number;
    image?: string;
    sku?: string;
    brand?: string;
    rating?: number;
    reviewCount?: number;
  }): void {
    const structuredData = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.name,
      description: product.description,
      image: product.image,
      sku: product.sku,
      brand: product.brand
        ? {
            '@type': 'Brand',
            name: product.brand
          }
        : undefined,
      offers: {
        '@type': 'Offer',
        price: product.price,
        priceCurrency: 'ARS',
        availability: 'https://schema.org/InStock'
      },
      aggregateRating: product.rating
        ? {
            '@type': 'AggregateRating',
            ratingValue: product.rating,
            reviewCount: product.reviewCount || 0
          }
        : undefined
    };

    this.addJsonLd(structuredData);
  }

  /**
   * Add JSON-LD structured data to the page
   */
  private addJsonLd(data: object): void {
    // Remove existing JSON-LD
    const existing = document.querySelector('script[type="application/ld+json"]');
    if (existing) {
      existing.remove();
    }

    // Add new JSON-LD
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(data);
    document.head.appendChild(script);
  }
}
