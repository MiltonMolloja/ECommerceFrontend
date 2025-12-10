import { NumericRange } from './facets.model';

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

/**
 * Representa un filtro de atributo dinámico
 * Para filtros de selección (Select/MultiSelect)
 */
export interface AttributeFilter {
  attributeName: string;
  values: string[];
}

/**
 * Representa un filtro de atributo numérico con rango
 */
export interface AttributeRangeFilter {
  attributeName: string;
  min: number;
  max: number;
}

/**
 * Parámetros extendidos para búsqueda avanzada con facetas
 */
export interface AdvancedSearchParams extends SearchParams {
  // Reemplaza category (singular) con categoryIds (plural)
  categoryIds?: number[];

  // Reemplaza brandIds (string) con brandIds (number[])
  brandIds?: number[];

  // Nuevos filtros de rating y reviews
  minAverageRating?: number;
  minReviewCount?: number;

  // Atributos dinámicos - Formato backend compatible
  attributes?: Record<string, string[]>;
  attributeRanges?: Record<string, NumericRange>;

  // Atributos dinámicos - Formato alternativo tipado
  attributeFilters?: AttributeFilter[];
  attributeRangeFilters?: AttributeRangeFilter[];

  // Flags para solicitar facetas específicas
  includeBrandFacets?: boolean;
  includeCategoryFacets?: boolean;
  includePriceFacets?: boolean;
  includeRatingFacets?: boolean;
  includeAttributeFacets?: boolean;
}

export enum SortOption {
  RELEVANCE = 'relevance',
  PRICE_LOW_HIGH = 'price_asc',
  PRICE_HIGH_LOW = 'price_desc',
  RATING = 'rating',
  NEWEST = 'newest',
  BEST_SELLER = 'best_seller'
}
