import { Injectable } from '@angular/core';
import { ProductCard, OfferCard, BannerSlide } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class HomeDataService {
  getBannerSlides(): BannerSlide[] {
    return [
      {
        id: 1,
        title: 'Tech Deals of the Season',
        description: 'Save up to 40% on electronics',
        image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=2070',
        buttonText: 'Shop Now'
      },
      {
        id: 2,
        title: 'Latest Gadgets & Devices',
        description: 'Explore cutting-edge technology',
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=2070',
        buttonText: 'Discover More'
      },
      {
        id: 3,
        title: 'Special Offers',
        description: "Limited time deals you don't want to miss",
        image: 'https://images.unsplash.com/photo-1607083206968-13611e3d76db?q=80&w=2070',
        buttonText: 'View Offers'
      }
    ];
  }

  getBestSellers(): ProductCard[] {
    return [
      {
        id: 1,
        name: 'Premium Wireless Headphones - Noise Cancelling, 40H Battery',
        price: 89.99,
        originalPrice: 149.99,
        rating: 4.5,
        reviews: 2847,
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800'
      },
      {
        id: 2,
        name: 'Smart Watch Pro - Fitness Tracker, Heart Rate Monitor',
        price: 199.99,
        originalPrice: 299.99,
        rating: 4.7,
        reviews: 1523,
        image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=800'
      },
      {
        id: 3,
        name: 'Professional DSLR Camera - 24MP, 4K Video Recording',
        price: 799.99,
        originalPrice: 999.99,
        rating: 4.8,
        reviews: 892,
        image: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?q=80&w=800'
      },
      {
        id: 4,
        name: 'Latest Smartphone - 6.7" Display, 128GB Storage',
        price: 699.99,
        originalPrice: 899.99,
        rating: 4.6,
        reviews: 3421,
        image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=800'
      },
      {
        id: 5,
        name: 'Gaming Console - Next Gen, 1TB SSD, 4K Graphics',
        price: 499.99,
        originalPrice: 599.99,
        rating: 4.9,
        reviews: 5632,
        image: 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?q=80&w=800'
      },
      {
        id: 6,
        name: 'Portable Bluetooth Speaker - Waterproof, 20H Playtime',
        price: 59.99,
        originalPrice: 99.99,
        rating: 4.4,
        reviews: 1876,
        image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?q=80&w=800'
      }
    ];
  }

  getTodaysDeals(): ProductCard[] {
    return [
      {
        id: 7,
        name: 'Ultra Slim Laptop - Intel i7, 16GB RAM, 512GB SSD',
        price: 899.99,
        originalPrice: 1299.99,
        rating: 4.7,
        reviews: 2143,
        image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?q=80&w=800'
      },
      {
        id: 8,
        name: 'Tablet Pro - 12.9" Retina Display, Apple Pencil Support',
        price: 749.99,
        originalPrice: 999.99,
        rating: 4.8,
        reviews: 1654,
        image: 'https://images.unsplash.com/photo-1561154464-82e9adf32764?q=80&w=800'
      },
      {
        id: 9,
        name: 'Wireless Charging Pad - Fast Charge, LED Indicator',
        price: 29.99,
        originalPrice: 49.99,
        rating: 4.3,
        reviews: 987,
        image: 'https://images.unsplash.com/photo-1591290619762-2e51b5f1c512?q=80&w=800'
      },
      {
        id: 10,
        name: '4K Action Camera - Waterproof, Image Stabilization',
        price: 249.99,
        originalPrice: 399.99,
        rating: 4.6,
        reviews: 1432,
        image: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?q=80&w=800'
      },
      {
        id: 11,
        name: 'Mechanical Gaming Keyboard - RGB, Cherry MX Switches',
        price: 129.99,
        originalPrice: 179.99,
        rating: 4.7,
        reviews: 2341,
        image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?q=80&w=800'
      },
      {
        id: 12,
        name: 'Noise Cancelling Earbuds - True Wireless, Touch Control',
        price: 79.99,
        originalPrice: 129.99,
        rating: 4.5,
        reviews: 3287,
        image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?q=80&w=800'
      }
    ];
  }

  getOffers(): OfferCard[] {
    return [
      {
        id: 1,
        title: 'Premium Headphones Collection',
        discount: 'Up to 40% off',
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800',
        category: 'Electronics'
      },
      {
        id: 2,
        title: 'Smart Watches & Fitness Trackers',
        discount: 'Save up to 35%',
        image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=800',
        category: 'Wearables'
      },
      {
        id: 3,
        title: 'Gaming Consoles & Accessories',
        discount: 'Limited offer',
        image: 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?q=80&w=800',
        category: 'Gaming'
      },
      {
        id: 4,
        title: 'Fashion & Clothing Deals',
        discount: '50% off',
        image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=800',
        category: 'Fashion'
      },
      {
        id: 5,
        title: 'Professional Cameras & Lenses',
        discount: 'Up to 25% off',
        image: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?q=80&w=800',
        category: 'Photography'
      },
      {
        id: 6,
        title: 'Latest Smartphones',
        discount: 'Trade-in deals',
        image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=800',
        category: 'Mobile'
      },
      {
        id: 7,
        title: 'Bluetooth Speakers',
        discount: '40% off',
        image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?q=80&w=800',
        category: 'Audio'
      },
      {
        id: 8,
        title: 'Laptops & Tablets',
        discount: 'Save big',
        image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?q=80&w=800',
        category: 'Computers'
      }
    ];
  }
}
