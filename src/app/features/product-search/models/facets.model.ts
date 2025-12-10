/**
 * Modelos para el sistema de facetas dinámicas
 * Integración con backend Advanced Search API
 */

export interface FacetItem {
  id: number | string;
  name: string;
  count: number;
  isSelected?: boolean;
}

export interface PriceRangeFacet {
  min: number;
  max: number;
  ranges: PriceRange[];
}

export interface PriceRange {
  min: number;
  max: number;
  count: number;
  label: string;
}

export interface RatingFacet {
  ranges: RatingRange[];
}

export interface RatingRange {
  minRating: number;
  count: number;
  label: string;
}

export interface AttributeFacet {
  attributeId: number;
  attributeName: string;
  attributeType: 'Text' | 'Number' | 'Boolean' | 'Select' | 'MultiSelect';
  unit?: string;
  values?: FacetItem[];
  range?: NumericRange;
}

export interface NumericRange {
  min: number;
  max: number;
}

export interface SearchFacets {
  brands?: FacetItem[];
  categories?: FacetItem[];
  priceRanges?: PriceRangeFacet;
  ratings?: RatingFacet;
  attributes?: Record<string, AttributeFacet>;
}

export interface SearchPerformanceMetrics {
  queryExecutionTime: number;
  facetCalculationTime: number;
  totalExecutionTime: number;
  totalFilteredResults: number;
  cacheHit: boolean;
}

export interface SearchMetadata {
  query?: string;
  performance?: SearchPerformanceMetrics;
  didYouMean?: string;
  relatedSearches?: string[];
}
