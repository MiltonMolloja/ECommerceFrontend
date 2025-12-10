import {
  Component,
  Input,
  OnInit,
  ChangeDetectionStrategy,
  signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';

/**
 * Interface para un grupo de especificaciones
 */
export interface SpecificationGroup {
  groupName: string;
  isExpanded: boolean;
  specifications: {
    label: string;
    value: string;
  }[];
}

/**
 * Componente de especificaciones técnicas del producto
 * Características:
 * - Grupos expandibles de especificaciones
 * - Diseño tipo tabla limpio
 * - Valores formateados
 * - Primera sección expandida por defecto
 */
@Component({
  selector: 'app-product-specifications',
  standalone: true,
  imports: [CommonModule, MatExpansionModule, MatTableModule, MatIconModule],
  templateUrl: './product-specifications.component.html',
  styleUrls: ['./product-specifications.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductSpecificationsComponent implements OnInit {
  @Input() specifications: Record<string, string> = {};
  @Input() groupByPrefix = true; // Agrupar por prefijo (ej: "Dimensiones:", "Batería:")

  // Estado reactivo
  specificationGroups = signal<SpecificationGroup[]>([]);

  ngOnInit(): void {
    this.processSpecifications();
  }

  /**
   * Procesar las especificaciones en grupos
   */
  private processSpecifications(): void {
    if (!this.specifications || Object.keys(this.specifications).length === 0) {
      this.specificationGroups.set([]);
      return;
    }

    if (this.groupByPrefix) {
      this.specificationGroups.set(this.groupSpecificationsByPrefix());
    } else {
      this.specificationGroups.set([
        {
          groupName: 'Especificaciones Técnicas',
          isExpanded: true,
          specifications: Object.entries(this.specifications).map(([label, value]) => ({
            label,
            value
          }))
        }
      ]);
    }
  }

  /**
   * Agrupar especificaciones por prefijo común
   */
  private groupSpecificationsByPrefix(): SpecificationGroup[] {
    const groups = new Map<string, { label: string; value: string }[]>();
    const generalSpecs: { label: string; value: string }[] = [];

    // Patrones comunes de grupos
    const groupPatterns = [
      { pattern: /^(dimensiones?|medidas?|tamaño)/i, name: 'Dimensiones y Peso' },
      { pattern: /^(pantalla|display|screen)/i, name: 'Pantalla' },
      { pattern: /^(procesador|cpu|chip)/i, name: 'Procesador' },
      { pattern: /^(memoria|ram|almacenamiento|storage)/i, name: 'Memoria y Almacenamiento' },
      { pattern: /^(cámara|camera|foto)/i, name: 'Cámara' },
      { pattern: /^(batería|battery|autonomía)/i, name: 'Batería' },
      { pattern: /^(conectividad|wireless|wifi|bluetooth)/i, name: 'Conectividad' },
      { pattern: /^(sistema|os|software)/i, name: 'Sistema Operativo' },
      { pattern: /^(material|construcción|diseño)/i, name: 'Diseño y Materiales' }
    ];

    Object.entries(this.specifications).forEach(([label, value]) => {
      let grouped = false;

      for (const { pattern, name } of groupPatterns) {
        if (pattern.test(label)) {
          if (!groups.has(name)) {
            groups.set(name, []);
          }
          groups.get(name)!.push({ label, value });
          grouped = true;
          break;
        }
      }

      if (!grouped) {
        generalSpecs.push({ label, value });
      }
    });

    const result: SpecificationGroup[] = [];
    let isFirstGroup = true;

    // Agregar grupos específicos
    groups.forEach((specs, groupName) => {
      result.push({
        groupName,
        isExpanded: isFirstGroup,
        specifications: specs
      });
      isFirstGroup = false;
    });

    // Agregar especificaciones generales si existen
    if (generalSpecs.length > 0) {
      result.push({
        groupName: 'Especificaciones Generales',
        isExpanded: result.length === 0, // Expandir si es el único grupo
        specifications: generalSpecs
      });
    }

    // Si no se creó ningún grupo, crear uno general
    if (result.length === 0) {
      result.push({
        groupName: 'Especificaciones Técnicas',
        isExpanded: true,
        specifications: Object.entries(this.specifications).map(([label, value]) => ({
          label,
          value
        }))
      });
    }

    return result;
  }

  /**
   * Formatear valor de especificación
   */
  formatValue(value: string): string {
    // Si es un número con unidades, formatear apropiadamente
    const numberMatch = value.match(/^(\d+(?:\.\d+)?)\s*([a-zA-Z]+)?$/);
    if (numberMatch) {
      const [, number, unit] = numberMatch;
      return unit ? `${number} ${unit}` : String(number);
    }

    return value;
  }
}
