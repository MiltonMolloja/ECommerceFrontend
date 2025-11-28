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
}

export enum FilterType {
  CHECKBOX = 'checkbox',
  RADIO = 'radio',
  RANGE = 'range',
  COLOR = 'color',
  SIZE = 'size'
}

export interface FilterValue {
  id: string;
  label: string;
  count?: number;
  isSelected?: boolean;
  value?: string | number | boolean;
  color?: string;
}

export interface ActiveFilter {
  filterId: string;
  filterName: string;
  valueId: string;
  valueLabel: string;
}
