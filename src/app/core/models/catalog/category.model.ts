/**
 * Categoría simplificada en el producto
 * Usada en ProductInfo y respuestas de API
 */
export interface ProductCategory {
  categoryId: number;
  name: string;
  slug: string;
  description?: string;
  isActive?: boolean;
  displayOrder?: number;
}

/**
 * Modelo de Categoría de Producto
 * Representa una categoría con soporte para jerarquías
 */
export interface Category {
  categoryId: number;
  name: string;
  description: string;
  slug: string;
  parentCategoryId?: number;
  isActive: boolean;
  displayOrder: number;
  productCount: number;
  subCategories: Category[];
  level: number;
  breadcrumbs: CategoryBreadcrumb[];
}

/**
 * Breadcrumb para navegación de categorías
 */
export interface CategoryBreadcrumb {
  categoryId: number;
  name: string;
  slug: string;
}

/**
 * Árbol de categorías simplificado (para navegación)
 */
export interface CategoryTree {
  categoryId: number;
  name: string;
  slug: string;
  productCount: number;
  subCategories: CategoryTree[];
}

/**
 * Solicitud de búsqueda de categorías
 */
export interface CategorySearchRequest {
  page?: number;
  take?: number;
  includeInactive?: boolean;
}
