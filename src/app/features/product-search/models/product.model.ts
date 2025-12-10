import { FilterOption } from './filter.model';
import { SearchFacets, SearchMetadata } from './facets.model';

export interface Product {
  id: string;
  title: string;
  description: string;
  brand: string;
  brandId?: string;
  category: string;
  categoryId?: string;
  subcategory?: string;
  price: {
    current: number;
    original?: number;
    currency: string;
    discount?: number;
  };
  rating: {
    average: number;
    count: number;
  };
  images: {
    main: string;
    thumbnails: string[];
    large?: string;
  };
  availability: {
    inStock: boolean;
    quantity?: number;
    deliveryDate?: Date;
  };
  features: string[];
  specifications: Record<string, string>;
  isPrime?: boolean;
  isSponsored?: boolean;
  seller?: {
    id: string;
    name: string;
    rating?: number;
  };
}

export interface ProductListResponse {
  products: Product[];
  pagination: PaginationInfo;
  filters: FilterOption[];
  totalResults: number;
  searchQuery: string;
}

/**
 * Respuesta extendida con facetas y metadata de performance
 */
export interface AdvancedProductListResponse extends ProductListResponse {
  facets?: SearchFacets;
  metadata?: SearchMetadata;
  pageCount?: number;
  hasMore?: boolean;
}

export interface PaginationInfo {
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalItems: number;
  hasNext: boolean;
  hasPrevious: boolean;
}
