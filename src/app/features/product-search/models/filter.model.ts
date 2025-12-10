export interface FilterOption {
  id: string;
  name: string;
  type: FilterType;
  options: FilterValue[];
  isExpanded?: boolean;
  range?: {
    min: number;
    max: number;
    step?: number;
    selectedMin?: number;
    selectedMax?: number;
  };
  // Nuevas propiedades para facetas avanzadas
  expandable?: boolean;      // Para "Show more/less"
  searchable?: boolean;      // Para búsqueda dentro del filtro
  maxVisibleOptions?: number; // Opciones visibles por defecto
  unit?: string;             // Unidad de medida (para atributos numéricos)
}

export enum FilterType {
  CHECKBOX = 'checkbox',
  RADIO = 'radio',
  RANGE = 'range',
  COLOR = 'color',
  SIZE = 'size',
  CATEGORY = 'category',  // NUEVO: Para jerarquía de categorías
  ATTRIBUTE = 'attribute' // NUEVO: Para atributos genéricos
}

export interface FilterValue {
  id: string;
  label: string;
  count?: number;
  isSelected?: boolean;
  value?: string | number | boolean;
  color?: string;
  disabled?: boolean;  // NUEVO: Para opciones sin resultados
}

export interface ActiveFilter {
  filterId: string;
  filterName: string;
  valueId: string;
  valueLabel: string;
}
