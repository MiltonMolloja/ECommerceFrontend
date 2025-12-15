import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-help',
  standalone: true,
  imports: [RouterLink, MatIconModule, MatButtonModule, TranslateModule],
  templateUrl: './help.html',
  styleUrl: './help.scss'
})
export class HelpComponent {}
