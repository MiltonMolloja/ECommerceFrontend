/**
 * Modelos para la página Home
 * Arquitectura Híbrida: Endpoint Agregador + Endpoints Individuales
 */

import { ProductDto, CategoryDto } from './catalog.model';

/**
 * Respuesta del endpoint agregador GET /home
 * Contiene todas las secciones de la página Home
 */
export interface HomePageResponse {
  banners: BannerDto[];
  featuredProducts: ProductDto[];
  deals: ProductDto[];
  bestSellers: ProductDto[];
  newArrivals: ProductDto[];
  topRated: ProductDto[];
  featuredCategories: CategoryDto[];
  metadata: HomeMetadata;
}

/**
 * Metadata de la respuesta Home
 * Incluye información de cache y performance
 */
export interface HomeMetadata {
  language: string;
  generatedAt: string;
  cacheDurationSeconds: number;
  queryExecutionTimeMs: number;
  fromCache: boolean;
}

/**
 * Banner para el hero section
 * Soporta multiidioma (es/en)
 */
export interface BannerDto {
  bannerId: number;
  title: string;           // Localizado según Accept-Language
  subtitle: string;        // Localizado
  imageUrl: string;
  imageUrlMobile?: string;
  linkUrl?: string;
  buttonText?: string;     // Localizado
  displayOrder: number;
}

/**
 * Parámetros para el endpoint agregador
 */
export interface HomePageParams {
  productsPerSection?: number;
}

/**
 * Parámetros para endpoints individuales
 */
export interface HomeSectionParams {
  limit?: number;
  position?: string;      // Para banners: 'hero', 'sidebar', 'footer'
  minRating?: number;     // Para top-rated
}
