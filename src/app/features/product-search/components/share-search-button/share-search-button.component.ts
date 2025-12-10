import { Component, input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { UrlSyncService, UrlFilters } from '../../services/url-sync.service';

@Component({
  selector: 'app-share-search-button',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatSnackBarModule,
    TranslateModule
  ],
  templateUrl: './share-search-button.component.html',
  styleUrl: './share-search-button.component.scss'
})
export class ShareSearchButtonComponent {
  private readonly urlSyncService = inject(UrlSyncService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly translate = inject(TranslateService);

  readonly filters = input.required<UrlFilters>();
  readonly disabled = input<boolean>(false);

  async onShareClick(): Promise<void> {
    const success = await this.urlSyncService.copyShareableUrl(this.filters());

    if (success) {
      this.snackBar.open(
        this.translate.instant('SHARE_SEARCH.COPIED'),
        this.translate.instant('COMMON.CLOSE'),
        {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'bottom'
        }
      );
    } else {
      this.snackBar.open(
        this.translate.instant('SHARE_SEARCH.ERROR'),
        this.translate.instant('COMMON.CLOSE'),
        {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'bottom',
          panelClass: ['error-snackbar']
        }
      );
    }
  }

  get shareableUrl(): string {
    return this.urlSyncService.getShareableUrl(this.filters());
  }
}
