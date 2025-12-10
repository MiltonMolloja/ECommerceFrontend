import { ProductCategory } from './category.model';

/**
 * Modelo de Stock de Producto
 */
export interface ProductInStock {
  productInStockId: number;
  productId: number;
  stock: number;
}

/**
 * Modelo de Producto (DTO del Gateway)
 */
export interface Product {
  productId: number;
  name: string;
  description: string;
  price: number;
  stock?: ProductInStock;
  categories?: ProductCategory[];
  primaryCategory?: ProductCategory;
}
