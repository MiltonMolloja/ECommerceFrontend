import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { OfferCard } from '../../models/product.model';

@Component({
  selector: 'app-offer-grid',
  imports: [CommonModule, MatCardModule, MatButtonModule],
  templateUrl: './offer-grid.html',
  styleUrl: './offer-grid.scss'
})
export class OfferGrid {
  @Input({ required: true }) title!: string;
  @Input() offers: OfferCard[] = [];
}
