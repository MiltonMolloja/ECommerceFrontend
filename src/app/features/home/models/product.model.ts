export interface ProductCard {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviews: number;
  image: string;
}

export interface OfferCard {
  id: number;
  title: string;
  discount: string;
  image: string;
  category: string;
}

export interface BannerSlide {
  id: number;
  title: string;
  description: string;
  image: string;
  buttonText: string;
}
