import { Routes } from '@angular/router';
import { SearchResultsComponent } from './components/search-results/search-results.component';

export const PRODUCT_SEARCH_ROUTES: Routes = [
  {
    path: '',
    component: SearchResultsComponent,
    title: 'Buscar Productos'
  }
];
