import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { TranslateModule } from '@ngx-translate/core';
import { ApiConfigService } from '../../core/services/api-config.service';

@Component({
  selector: 'app-help',
  standalone: true,
  imports: [RouterLink, MatIconModule, MatButtonModule, TranslateModule],
  templateUrl: './help.html',
  styleUrl: './help.scss'
})
export class HelpComponent {
  readonly apiConfig = inject(ApiConfigService);

  get profileUrl(): string {
    return `${this.apiConfig.loginServiceUrl}/profile`;
  }
}
