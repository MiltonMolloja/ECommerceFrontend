import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';

export interface PromoItem {
  image: string;
  label: string;
  link?: string | string[];
}

@Component({
  selector: 'app-promo-card',
  standalone: true,
  imports: [CommonModule, RouterLink, MatCardModule, MatButtonModule],
  templateUrl: './promo-card.component.html',
  styleUrls: ['./promo-card.component.scss']
})
export class PromoCardComponent {
  @Input({ required: true }) title!: string;

  // Simple layout (1 imagen)
  @Input() image?: string;
  @Input() link: string | string[] = '/catalog';
  @Input() linkLabel = 'Ver más';

  // Multi-item layouts
  @Input() layout: 'simple' | 'grid' | 'featured' = 'simple';
  @Input() items: PromoItem[] = [];
}
