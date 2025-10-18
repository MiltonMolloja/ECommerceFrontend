import { Component, computed, inject } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { BreakpointService } from '../../core/services/breakpoint.service';
import { ScrollerItem } from '../../shared/components/horizontal-scroller/horizontal-scroller.component';
import { PromoItem } from '../../shared/components/promo-card/promo-card.component';
import { ProductImage } from '../../shared/components/product-carousel/product-carousel.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  private readonly bp = inject(BreakpointService);

  // Cálculo de columnas para MatGridList según breakpoint
  readonly gridCols = computed(() => {
    if (this.bp.isXSmall()) return 1;
    if (this.bp.isSmall()) return 2;
    if (this.bp.isMedium()) return 2; // 2 columnas en tablets
    return 4; // 4 columnas en desktop
  });

  // Colspan para la tarjeta featured (2 cols solo en desktop con 4 columnas)
  readonly featuredColspan = computed(() => {
    return this.gridCols() === 4 ? 2 : 1;
  });

  // Tarjetas con layout especial (grid y featured)
  readonly refreshYourSpace: {
    title: string;
    layout: 'grid';
    items: PromoItem[];
    linkLabel: string;
  } = {
    title: 'Renueva tu espacio',
    layout: 'grid',
    items: [
      {
        image:
          'https://images.pexels.com/photos/262978/pexels-photo-262978.jpeg?auto=compress&cs=tinysrgb&w=400',
        label: 'Comedor'
      },
      {
        image:
          'https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg?auto=compress&cs=tinysrgb&w=400',
        label: 'Hogar'
      },
      {
        image:
          'https://images.pexels.com/photos/2062426/pexels-photo-2062426.jpeg?auto=compress&cs=tinysrgb&w=400',
        label: 'Cocina'
      },
      {
        image:
          'https://images.pexels.com/photos/4153183/pexels-photo-4153183.jpeg?auto=compress&cs=tinysrgb&w=400',
        label: 'Salud y Belleza'
      }
    ],
    linkLabel: 'Ver más'
  };

  readonly kitchenCategories: {
    title: string;
    layout: 'featured';
    items: PromoItem[];
    linkLabel: string;
  } = {
    title: 'Categorías destacadas en Cocina',
    layout: 'featured',
    items: [
      {
        image:
          'https://images.pexels.com/photos/4226256/pexels-photo-4226256.jpeg?auto=compress&cs=tinysrgb&w=800',
        label: 'Olla Eléctrica'
      },
      {
        image:
          'https://images.pexels.com/photos/312418/pexels-photo-312418.jpeg?auto=compress&cs=tinysrgb&w=400',
        label: 'Café'
      },
      {
        image:
          'https://images.pexels.com/photos/4397928/pexels-photo-4397928.jpeg?auto=compress&cs=tinysrgb&w=400',
        label: 'Ollas y Sartenes'
      },
      {
        image:
          'https://images.pexels.com/photos/4397921/pexels-photo-4397921.jpeg?auto=compress&cs=tinysrgb&w=400',
        label: 'Teteras'
      }
    ],
    linkLabel: 'Explorar todos en Cocina'
  };

  readonly computersGrid: { title: string; layout: 'grid'; items: PromoItem[]; linkLabel: string } =
    {
      title: 'Computadoras y accesorios',
      layout: 'grid',
      items: [
        {
          image:
            'https://images.pexels.com/photos/303383/pexels-photo-303383.jpeg?auto=compress&cs=tinysrgb&w=600',
          label: 'Laptops'
        },
        {
          image:
            'https://images.pexels.com/photos/1229861/pexels-photo-1229861.jpeg?auto=compress&cs=tinysrgb&w=600',
          label: 'Monitores'
        },
        {
          image:
            'https://images.pexels.com/photos/2115256/pexels-photo-2115256.jpeg?auto=compress&cs=tinysrgb&w=600',
          label: 'Teclados'
        },
        {
          image:
            'https://images.pexels.com/photos/2115257/pexels-photo-2115257.jpeg?auto=compress&cs=tinysrgb&w=600',
          label: 'Mouse'
        }
      ],
      linkLabel: 'Ver todo'
    };

  // Tarjetas simples
  readonly promosTop = [
    {
      title: 'Espacio de trabajo',
      image:
        'https://images.pexels.com/photos/4226140/pexels-photo-4226140.jpeg?auto=compress&cs=tinysrgb&w=800',
      link: '/catalog',
      linkLabel: 'Ver ofertas',
      layout: 'simple' as const
    },
    {
      title: 'Computadoras y accesorios',
      image:
        'https://images.pexels.com/photos/18105/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=600',
      link: '/catalog',
      linkLabel: 'Explorar',
      layout: 'simple' as const
    },
    {
      title: 'Audio y entretenimiento',
      image:
        'https://images.pexels.com/photos/845434/pexels-photo-845434.jpeg?auto=compress&cs=tinysrgb&w=600',
      link: '/catalog',
      linkLabel: 'Ver más',
      layout: 'simple' as const
    },
    {
      title: 'Laptops y tablets',
      image:
        'https://images.pexels.com/photos/303383/pexels-photo-303383.jpeg?auto=compress&cs=tinysrgb&w=800',
      link: '/catalog',
      linkLabel: 'Comprar ahora',
      layout: 'simple' as const
    },
    {
      title: 'Tecnología para el trabajo',
      image:
        'https://images.pexels.com/photos/3861958/pexels-photo-3861958.jpeg?auto=compress&cs=tinysrgb&w=800',
      link: '/catalog',
      linkLabel: 'Descubrir',
      layout: 'simple' as const
    }
  ];

  // Tarjetas grid 2x2 para segunda fila
  readonly exploreMoreSports: {
    title: string;
    layout: 'grid';
    items: PromoItem[];
    linkLabel: string;
  } = {
    title: 'Explora más en Deportes',
    layout: 'grid',
    items: [
      {
        image:
          'https://images.pexels.com/photos/100582/pexels-photo-100582.jpeg?auto=compress&cs=tinysrgb&w=600',
        label: 'Ciclismo'
      },
      {
        image:
          'https://images.pexels.com/photos/2526878/pexels-photo-2526878.jpeg?auto=compress&cs=tinysrgb&w=600',
        label: 'Running'
      },
      {
        image:
          'https://images.pexels.com/photos/841130/pexels-photo-841130.jpeg?auto=compress&cs=tinysrgb&w=600',
        label: 'Ejercicio & Fitness'
      },
      {
        image:
          'https://images.pexels.com/photos/54123/pexels-photo-54123.jpeg?auto=compress&cs=tinysrgb&w=600',
        label: 'Golf'
      }
    ],
    linkLabel: 'Explorar más'
  };

  readonly dealsTopCategories: {
    title: string;
    layout: 'grid';
    items: PromoItem[];
    linkLabel: string;
  } = {
    title: 'Ofertas en categorías destacadas',
    layout: 'grid',
    items: [
      {
        image:
          'https://images.pexels.com/photos/1329711/pexels-photo-1329711.jpeg?auto=compress&cs=tinysrgb&w=600',
        label: 'Libros'
      },
      {
        image:
          'https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=600',
        label: 'Moda'
      },
      {
        image:
          'https://images.pexels.com/photos/2399840/pexels-photo-2399840.jpeg?auto=compress&cs=tinysrgb&w=600',
        label: 'PCs'
      },
      {
        image:
          'https://images.pexels.com/photos/3785147/pexels-photo-3785147.jpeg?auto=compress&cs=tinysrgb&w=600',
        label: 'Belleza'
      }
    ],
    linkLabel: 'Descubrir más'
  };

  readonly levelUpGaming: { title: string; layout: 'grid'; items: PromoItem[]; linkLabel: string } =
    {
      title: 'Mejora tu gaming',
      layout: 'grid',
      items: [
        {
          image:
            'https://images.pexels.com/photos/2582928/pexels-photo-2582928.jpeg?auto=compress&cs=tinysrgb&w=600',
          label: 'PC gaming'
        },
        {
          image:
            'https://images.pexels.com/photos/3945683/pexels-photo-3945683.jpeg?auto=compress&cs=tinysrgb&w=600',
          label: 'Xbox'
        },
        {
          image:
            'https://images.pexels.com/photos/371924/pexels-photo-371924.jpeg?auto=compress&cs=tinysrgb&w=600',
          label: 'PlayStation'
        },
        {
          image:
            'https://images.pexels.com/photos/1637438/pexels-photo-1637438.jpeg?auto=compress&cs=tinysrgb&w=600',
          label: 'Nintendo Switch'
        }
      ],
      linkLabel: 'Comprar lo último en gaming'
    };

  readonly topPCsAccessories: {
    title: string;
    layout: 'grid';
    items: PromoItem[];
    linkLabel: string;
  } = {
    title: 'Las mejores PCs y accesorios',
    layout: 'grid',
    items: [
      {
        image:
          'https://images.pexels.com/photos/7974/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=600',
        label: 'Desktops'
      },
      {
        image:
          'https://images.pexels.com/photos/303383/pexels-photo-303383.jpeg?auto=compress&cs=tinysrgb&w=600',
        label: 'Laptops'
      },
      {
        image:
          'https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg?auto=compress&cs=tinysrgb&w=600',
        label: 'Discos Duros'
      },
      {
        image:
          'https://images.pexels.com/photos/2115256/pexels-photo-2115256.jpeg?auto=compress&cs=tinysrgb&w=600',
        label: 'Accesorios PC'
      }
    ],
    linkLabel: 'Ver más'
  };

  readonly scrollerItems: ScrollerItem[] = Array.from({ length: 12 }).map((_, i) => ({
    image: `https://picsum.photos/seed/insp${i + 1}/250/250`,
    alt: `Producto ${i + 1}`,
    link: '/catalog'
  }));

  // Carrusel de productos (ropa y accesorios) - solo imágenes
  readonly clothingProducts: ProductImage[] = [
    {
      image:
        'https://images.pexels.com/photos/1040424/pexels-photo-1040424.jpeg?auto=compress&cs=tinysrgb&w=600',
      link: '/catalog'
    },
    {
      image:
        'https://images.pexels.com/photos/1055691/pexels-photo-1055691.jpeg?auto=compress&cs=tinysrgb&w=600',
      link: '/catalog'
    },
    {
      image:
        'https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg?auto=compress&cs=tinysrgb&w=600',
      link: '/catalog'
    },
    {
      image:
        'https://images.pexels.com/photos/1102778/pexels-photo-1102778.jpeg?auto=compress&cs=tinysrgb&w=600',
      link: '/catalog'
    },
    {
      image:
        'https://images.pexels.com/photos/1163194/pexels-photo-1163194.jpeg?auto=compress&cs=tinysrgb&w=600',
      link: '/catalog'
    },
    {
      image:
        'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=600',
      link: '/catalog'
    },
    {
      image:
        'https://images.pexels.com/photos/1124468/pexels-photo-1124468.jpeg?auto=compress&cs=tinysrgb&w=600',
      link: '/catalog'
    },
    {
      image:
        'https://images.pexels.com/photos/1598507/pexels-photo-1598507.jpeg?auto=compress&cs=tinysrgb&w=600',
      link: '/catalog'
    },
    {
      image:
        'https://images.pexels.com/photos/1895943/pexels-photo-1895943.jpeg?auto=compress&cs=tinysrgb&w=600',
      link: '/catalog'
    },
    {
      image:
        'https://images.pexels.com/photos/1656684/pexels-photo-1656684.jpeg?auto=compress&cs=tinysrgb&w=600',
      link: '/catalog'
    },
    {
      image:
        'https://images.pexels.com/photos/2703202/pexels-photo-2703202.jpeg?auto=compress&cs=tinysrgb&w=600',
      link: '/catalog'
    },
    {
      image:
        'https://images.pexels.com/photos/1566412/pexels-photo-1566412.jpeg?auto=compress&cs=tinysrgb&w=600',
      link: '/catalog'
    }
  ];
}
