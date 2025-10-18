import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatGridListModule } from '@angular/material/grid-list';

import { PromoCardComponent } from './components/promo-card/promo-card.component';
import { HorizontalScrollerComponent } from './components/horizontal-scroller/horizontal-scroller.component';
import { ProductCarouselComponent } from './components/product-carousel/product-carousel.component';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatGridListModule,
    // Standalone components imported into the module for re-export
    PromoCardComponent,
    HorizontalScrollerComponent,
    ProductCarouselComponent
  ],
  exports: [
    // Angular/Material
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatGridListModule,
    // Reusable components
    PromoCardComponent,
    HorizontalScrollerComponent,
    ProductCarouselComponent
  ]
})
export class SharedModule {}
