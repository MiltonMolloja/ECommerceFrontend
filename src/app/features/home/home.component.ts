import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeroBanner } from './components/hero-banner/hero-banner';
import { ProductCarouselComponent } from '../../shared/components/product-carousel/product-carousel.component';
import { OfferGrid } from './components/offer-grid/offer-grid';
import { HomeDataService } from './services/home-data';
import { ProductCard, OfferCard } from './models/product.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, HeroBanner, ProductCarouselComponent, OfferGrid],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  private homeData = inject(HomeDataService);

  // Datos para los carruseles y grids
  bestSellers: ProductCard[] = this.homeData.getBestSellers();
  todaysDeals: ProductCard[] = this.homeData.getTodaysDeals();
  offers: OfferCard[] = this.homeData.getOffers();
}
