import { Component, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { TranslateModule } from '@ngx-translate/core';
import { SortOption } from '../../models';

@Component({
  selector: 'app-sort-dropdown',
  standalone: true,
  imports: [CommonModule, MatSelectModule, MatFormFieldModule, TranslateModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './sort-dropdown.component.html',
  styles: [
    `
      .sort-dropdown {
        min-width: 200px;
      }
    `
  ]
})
export class SortDropdownComponent {
  @Output() sortChange = new EventEmitter<SortOption>();

  SortOption = SortOption;

  onSortChange(sortOption: SortOption): void {
    this.sortChange.emit(sortOption);
  }
}
