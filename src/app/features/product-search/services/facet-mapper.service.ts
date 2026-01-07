import { Injectable } from '@angular/core';
import { FilterOption, FilterType } from '../models/filter.model';
import {
  SearchFacets,
  FacetItem,
  PriceRangeFacet,
  RatingFacet,
  AttributeFacet
} from '../models/facets.model';

/**
 * Servicio para mapear facetas del backend a filtros del frontend
 */
@Injectable({
  providedIn: 'root'
})
export class FacetMapperService {
  /**
   * Convierte las facetas del backend a filtros del frontend
   * ORDEN: Precio > Marcas > Disponibilidad > Ofertas > Calificación > Categorías > Atributos
   */
  mapFacetsToFilters(facets: SearchFacets): FilterOption[] {
    const filters: FilterOption[] = [];

    // 1. Mapear facetas de precio (PRIMERO)
    if (facets.priceRanges) {
      filters.push(this.createPriceFilter(facets.priceRanges));
    }

    // 2. Mapear facetas de marcas
    if (facets.brands && facets.brands.length > 0) {
      filters.push(this.createBrandFilter(facets.brands));
    }

    // 3. Agregar filtros estáticos SIEMPRE (Disponibilidad, Ofertas, Calificación)
    // Estos filtros deben aparecer antes de atributos dinámicos
    this.addStaticFilters(filters);

    // 4. Mapear facetas de rating (puede sobrescribir el filtro estático con datos reales)
    if (facets.ratings && facets.ratings.ranges && facets.ratings.ranges.length > 0) {
      // Remover filtro de rating estático y agregar el del backend
      const ratingIndex = filters.findIndex((f) => f.id === 'rating');
      if (ratingIndex !== -1) {
        filters[ratingIndex] = this.createRatingFilter(facets.ratings);
      }
    }

    // 5. Mapear facetas de categorías
    if (facets.categories && facets.categories.length > 0) {
      filters.push(this.createCategoryFilter(facets.categories));
    }

    // 6. Mapear atributos dinámicos (ÚLTIMO)
    if (facets.attributes) {
      Object.entries(facets.attributes).forEach(([key, attr]) => {
        const attributeFilter = this.createAttributeFilter(key, attr);
        if (attributeFilter) {
          filters.push(attributeFilter);
        }
      });
    }

    return filters;
  }

  private createBrandFilter(brands: FacetItem[]): FilterOption {
    return {
      id: 'brand',
      name: 'Marca',
      type: FilterType.CHECKBOX,
      options: brands.map((b) => ({
        id: b.id.toString(),
        label: b.name,
        count: b.count,
        isSelected: b.isSelected || false,
        value: b.id
      })),
      searchable: brands.length > 10,
      expandable: brands.length > 8,
      maxVisibleOptions: 8,
      isExpanded: true // ← Expandido por defecto
    };
  }

  private createCategoryFilter(categories: FacetItem[]): FilterOption {
    return {
      id: 'category',
      name: 'Categoría',
      type: FilterType.CATEGORY,
      options: categories.map((c) => ({
        id: c.id.toString(),
        label: c.name,
        count: c.count,
        isSelected: c.isSelected || false,
        value: c.id
      })),
      expandable: categories.length > 6,
      maxVisibleOptions: 6,
      isExpanded: false
    };
  }

  private createPriceFilter(priceRanges: PriceRangeFacet): FilterOption {
    return {
      id: 'price',
      name: 'Precio',
      type: FilterType.RANGE,
      options: [],
      range: {
        min: priceRanges.min,
        max: priceRanges.max,
        step: this.calculatePriceStep(priceRanges.min, priceRanges.max),
        selectedMin: priceRanges.min,
        selectedMax: priceRanges.max
      },
      isExpanded: true // ← Expandido por defecto
    };
  }

  private createRatingFilter(ratings: RatingFacet): FilterOption {
    return {
      id: 'rating',
      name: 'Calificación',
      type: FilterType.CHECKBOX,
      options: ratings.ranges.map((r) => ({
        id: r.minRating.toString(),
        label: r.label,
        count: r.count,
        isSelected: false,
        value: r.minRating
      })),
      isExpanded: true
    };
  }

  private createDefaultRatingFilter(): FilterOption {
    return {
      id: 'rating',
      name: 'Calificación',
      type: FilterType.CHECKBOX,
      isExpanded: true,
      options: [
        {
          id: '4',
          label: '4 estrellas o más',
          isSelected: false,
          value: 4
        },
        {
          id: '3',
          label: '3 estrellas o más',
          isSelected: false,
          value: 3
        },
        {
          id: '2',
          label: '2 estrellas o más',
          isSelected: false,
          value: 2
        }
      ]
    };
  }

  /**
   * Crea un filtro de atributo dinámico
   * @param attributeName - Clave del atributo (ej: "RAM", "Storage")
   * @param attr - Faceta de atributo del backend
   * @returns FilterOption configurado o null si no es válido
   */
  private createAttributeFilter(attributeName: string, attr: AttributeFacet): FilterOption | null {
    // Lista de atributos a excluir (blacklist)
    // Solo excluir atributos con problemas de encoding, NO los correctos
    const excludedAttributes = [
      'CondiciÃ³n', // Mal encoding de "Condición" (UTF-8 mal interpretado)
      'CondicíÃ³n', // Otra variante mal codificada
      'CondiciÃ"n' // Otra variante mal codificada
    ];

    // Verificar si el atributo debe ser excluido
    if (
      excludedAttributes.includes(attr.attributeName) ||
      excludedAttributes.includes(attributeName)
    ) {
      return null;
    }

    // Filtros de selección (Select/MultiSelect)
    if (
      attr.attributeType === 'Select' ||
      attr.attributeType === 'MultiSelect' ||
      attr.attributeType === 'Text'
    ) {
      if (!attr.values || attr.values.length === 0) {
        return null;
      }

      // Usar el attributeId del backend si está disponible, sino el nombre
      const filterId = attr.attributeId ? `attr_${attr.attributeId}` : `attr_${attributeName}`;

      return {
        id: filterId,
        name: attr.attributeName,
        type: FilterType.CHECKBOX, // Usar CHECKBOX para mejor UX con Material
        options: attr.values.map((v) => ({
          id: v.id.toString(),
          label: v.name,
          count: v.count,
          isSelected: v.isSelected || false,
          value: v.id,
          disabled: v.count === 0 // Deshabilitar opciones sin resultados
        })),
        ...(attr.unit && { unit: attr.unit }),
        expandable: attr.values.length > 6,
        maxVisibleOptions: 6,
        searchable: attr.values.length > 10,
        isExpanded: false
      };
    }
    // Filtros numéricos con rango
    else if (attr.attributeType === 'Number' && attr.range) {
      const filterId = attr.attributeId ? `attr_${attr.attributeId}` : `attr_${attributeName}`;

      return {
        id: filterId,
        name: attr.attributeName,
        type: FilterType.RANGE,
        options: [],
        range: {
          min: attr.range.min,
          max: attr.range.max,
          step: this.calculateNumericStep(attr.range.min, attr.range.max),
          selectedMin: attr.range.min,
          selectedMax: attr.range.max
        },
        ...(attr.unit && { unit: attr.unit }),
        isExpanded: false
      };
    }
    // Filtros booleanos
    else if (attr.attributeType === 'Boolean') {
      const filterId = attr.attributeId ? `attr_${attr.attributeId}` : `attr_${attributeName}`;

      return {
        id: filterId,
        name: attr.attributeName,
        type: FilterType.CHECKBOX,
        options: [
          {
            id: 'true',
            label: 'Sí',
            isSelected: false,
            value: true
          }
        ],
        isExpanded: false
      };
    }

    return null;
  }

  /**
   * Agrega filtros estáticos que siempre deben aparecer
   */
  private addStaticFilters(filters: FilterOption[]): void {
    // 1. Filtro de disponibilidad
    if (!filters.find((f) => f.id === 'inStock')) {
      filters.push({
        id: 'inStock',
        name: 'Disponibilidad',
        type: FilterType.CHECKBOX,
        isExpanded: true,
        options: [
          {
            id: 'true',
            label: 'En stock',
            isSelected: false
          }
        ]
      });
    }

    // 2. Filtro de ofertas/descuento
    if (!filters.find((f) => f.id === 'discount')) {
      filters.push({
        id: 'discount',
        name: 'Ofertas',
        type: FilterType.CHECKBOX,
        isExpanded: true,
        options: [
          {
            id: 'true',
            label: 'Con descuento',
            isSelected: false
          }
        ]
      });
    }

    // 3. Filtro de calificación (por defecto, puede ser sobrescrito por facetas del backend)
    if (!filters.find((f) => f.id === 'rating')) {
      filters.push(this.createDefaultRatingFilter());
    }
  }

  private calculatePriceStep(min: number, max: number): number {
    const range = max - min;
    if (range <= 100) return 1;
    if (range <= 1000) return 10;
    if (range <= 10000) return 100;
    return 1000;
  }

  private calculateNumericStep(min: number, max: number): number {
    const range = max - min;
    if (range <= 10) return 0.1;
    if (range <= 100) return 1;
    if (range <= 1000) return 10;
    return 100;
  }
}
