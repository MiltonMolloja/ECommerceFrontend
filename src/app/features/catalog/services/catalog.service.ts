import { Injectable, signal } from '@angular/core';
import { Observable, of, delay } from 'rxjs';

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  inStock: boolean;
}

/**
 * Servicio para gestionar productos del catálogo
 * En producción, conectar con API real usando HttpClient
 */
@Injectable({
  providedIn: 'root'
})
export class CatalogService {
  // Signal para estado de carga
  readonly loading = signal(false);

  // Mock de productos
  private readonly mockProducts: Product[] = [
    {
      id: 1,
      name: 'Laptop Premium',
      description: 'Laptop de alto rendimiento con procesador i7',
      price: 1299.99,
      image: 'https://placehold.co/300x200?text=Laptop',
      category: 'Electrónica',
      inStock: true
    },
    {
      id: 2,
      name: 'Smartphone Pro',
      description: 'Último modelo con cámara de 108MP',
      price: 899.99,
      image: 'https://placehold.co/300x200?text=Smartphone',
      category: 'Electrónica',
      inStock: true
    },
    {
      id: 3,
      name: 'Audífonos Bluetooth',
      description: 'Cancelación de ruido activa',
      price: 199.99,
      image: 'https://placehold.co/300x200?text=Audifonos',
      category: 'Audio',
      inStock: false
    },
    {
      id: 4,
      name: 'Teclado Mecánico',
      description: 'Switches Cherry MX con retroiluminación RGB',
      price: 149.99,
      image: 'https://placehold.co/300x200?text=Teclado',
      category: 'Accesorios',
      inStock: true
    },
    {
      id: 5,
      name: 'Monitor 4K',
      description: '27 pulgadas con HDR',
      price: 499.99,
      image: 'https://placehold.co/300x200?text=Monitor',
      category: 'Electrónica',
      inStock: true
    },
    {
      id: 6,
      name: 'Mouse Gaming',
      description: 'Sensor óptico de 16000 DPI',
      price: 79.99,
      image: 'https://placehold.co/300x200?text=Mouse',
      category: 'Accesorios',
      inStock: true
    }
  ];

  /**
   * Obtiene todos los productos (simula latencia de red)
   */
  getProducts(): Observable<Product[]> {
    this.loading.set(true);
    return of(this.mockProducts).pipe(
      delay(800) // Simular latencia
      // tap(() => this.loading.set(false)) // Se maneja en el componente
    );
  }

  /**
   * Obtiene un producto por ID
   */
  getProductById(id: number): Observable<Product | undefined> {
    return of(this.mockProducts.find((p) => p.id === id)).pipe(delay(500));
  }
}
