/**
 * Modelo genérico para respuestas paginadas del backend
 */
export interface DataCollection<T> {
  items: T[];
  total: number;
  page: number;
  pages: number;
  pageSize: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}
