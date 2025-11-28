import { FilterOption } from './filter.model';

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

export interface PaginationInfo {
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalItems: number;
  hasNext: boolean;
  hasPrevious: boolean;
}
