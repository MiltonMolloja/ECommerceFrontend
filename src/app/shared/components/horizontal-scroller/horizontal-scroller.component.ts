import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';

export interface ScrollerItem {
  image: string;
  alt?: string;
  link?: string | string[];
}

@Component({
  selector: 'app-horizontal-scroller',
  standalone: true,
  imports: [CommonModule, RouterLink, MatCardModule],
  templateUrl: './horizontal-scroller.component.html',
  styleUrls: ['./horizontal-scroller.component.scss']
})
export class HorizontalScrollerComponent {
  @Input({ required: true }) title!: string;
  @Input() items: ScrollerItem[] = [];
}
