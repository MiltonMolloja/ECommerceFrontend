import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ErrorBoundaryComponent } from './shared/components/error-boundary/error-boundary';
import { LoadingSpinnerComponent } from './shared/components/loading-spinner/loading-spinner';
import { FaviconService } from './core/services/favicon.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ErrorBoundaryComponent, LoadingSpinnerComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  private readonly faviconService = inject(FaviconService);
  protected readonly title = signal('ECommerceFrontend');

  ngOnInit(): void {
    this.faviconService.init();
  }
}
