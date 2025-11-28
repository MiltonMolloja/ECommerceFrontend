import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Product } from '../../models';
import { PriceFormatPipe } from '../../pipes/price-format.pipe';
import { LazyLoadImageDirective } from '../../directives/lazy-load-image.directive';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    PriceFormatPipe,
    LazyLoadImageDirective,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './product-card.component.html',
  styleUrls: ['./product-card.component.scss']
})
export class ProductCardComponent {
  @Input({ required: true }) product!: Product;
  @Input() searchQuery = '';

  Math = Math;
}
