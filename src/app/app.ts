import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ErrorBoundaryComponent } from './shared/components/error-boundary/error-boundary';
import { LoadingSpinnerComponent } from './shared/components/loading-spinner/loading-spinner';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ErrorBoundaryComponent, LoadingSpinnerComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('ECommerceFrontend');
}
