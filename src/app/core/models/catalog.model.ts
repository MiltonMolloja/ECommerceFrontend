/**
 * Modelos del catálogo de productos
 * Sincronizados con el backend (Catalog.Api)
 */

export interface ProductDto {
  productId: number;
  name: string;
  description: string;
  sku: string;
  brandId?: number;
  brand: string;
  slug: string;

  // Pricing
  price: number;
  originalPrice?: number;
  discountPercentage: number;
  taxRate: number;
  finalPrice: number;
  hasDiscount: boolean;
  priceWithTax: number;

  // Media
  images: string;
  imageUrls: string[];
  primaryImageUrl: string;

  // SEO
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;

  // Flags
  isActive: boolean;
  isFeatured: boolean;

  // Dates
  createdAt: string;
  updatedAt: string;

  // Stock
  stock: ProductStockDto;

  // Rating
  averageRating?: number;
  totalReviews?: number;
  rating5Star?: number;
  rating4Star?: number;
  rating3Star?: number;
  rating2Star?: number;
  rating1Star?: number;

  // Categories
  categories: CategoryDto[];
  primaryCategory?: CategoryDto;
}

export interface ProductStockDto {
  productInStockId: number;
  productId: number;
  stock: number;
  minStock: number;
  maxStock: number;
  isLowStock: boolean;
  isOutOfStock: boolean;
  isOverStock: boolean;
}

export interface CategoryDto {
  categoryId: number;
  name: string;
  description?: string;
  slug: string;
  parentCategoryId?: number;
  isActive: boolean;
  displayOrder: number;
  imageUrl?: string;
  isFeatured: boolean;
  productCount: number;
}

export interface ProductSearchRequest {
  query?: string;
  page?: number;
  pageSize?: number;
  sortBy?: ProductSortField;
  sortOrder?: SortOrder;
  categoryId?: number;
  brandIds?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  isFeatured?: boolean;
  hasDiscount?: boolean;
  minRating?: number;
}

export interface ProductSearchResponse {
  items: ProductDto[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasMore: boolean;
}

export enum ProductSortField {
  Relevance = 'Relevance',
  Name = 'Name',
  Price = 'Price',
  Newest = 'Newest',
  Bestseller = 'Bestseller',
  Rating = 'Rating',
  Discount = 'Discount'
}

export enum SortOrder {
  Ascending = 'Ascending',
  Descending = 'Descending'
}
