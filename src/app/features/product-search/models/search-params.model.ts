export interface SearchParams {
  query?: string;
  category?: string;
  filters?: Record<string, string[]>;
  priceRange?: {
    min: number;
    max: number;
  };
  rating?: number;
  sortBy?: SortOption;
  page: number;
  pageSize: number;
}

export enum SortOption {
  RELEVANCE = 'relevance',
  PRICE_LOW_HIGH = 'price_asc',
  PRICE_HIGH_LOW = 'price_desc',
  RATING = 'rating',
  NEWEST = 'newest',
  BEST_SELLER = 'best_seller'
}
