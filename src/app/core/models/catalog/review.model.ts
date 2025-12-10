/**
 * Modelo de review de producto
 */
export interface ProductReview {
  reviewId: number;
  productId: number;
  userId: number;
  rating: number;
  title?: string;
  comment?: string;
  isVerifiedPurchase: boolean;
  helpfulCount: number;
  notHelpfulCount: number;
  isApproved: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Distribución de ratings por estrellas
 */
export interface RatingDistribution {
  fiveStar: number;
  fourStar: number;
  threeStar: number;
  twoStar: number;
  oneStar: number;
}

/**
 * Resumen de ratings de un producto
 */
export interface ProductRatingSummary {
  productId: number;
  averageRating: number;
  totalReviews: number;
  rating5Star: number;
  rating4Star: number;
  rating3Star: number;
  rating2Star: number;
  rating1Star: number;
  ratingDistribution: RatingDistribution;
  lastUpdated?: Date;
}

/**
 * Respuesta paginada de reviews
 */
export interface ProductReviewsResponse {
  productId: number;
  ratingSummary: ProductRatingSummary;
  items: ProductReview[];
  page: number;
  pageSize: number;
  totalPages: number;
  totalItems: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

/**
 * Opciones de ordenamiento para reviews
 */
export enum ReviewSortOption {
  NEWEST = 'newest',
  OLDEST = 'oldest',
  RATING_HIGH = 'rating_high',
  RATING_LOW = 'rating_low',
  HELPFUL = 'helpful'
}

/**
 * Parámetros para filtrar reviews
 */
export interface ReviewFilterParams {
  page?: number;
  pageSize?: number;
  sortBy?: ReviewSortOption;
  minRating?: number;
  verifiedOnly?: boolean;
}
