import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';

export interface SaveSearchDialogData {
  currentName?: string;
  query: string;
  filterCount: number;
}

export interface SaveSearchDialogResult {
  name: string;
}

@Component({
  selector: 'app-save-search-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    TranslateModule
  ],
  templateUrl: './save-search-dialog.component.html',
  styleUrl: './save-search-dialog.component.scss'
})
export class SaveSearchDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<SaveSearchDialogComponent>);
  readonly data = inject<SaveSearchDialogData>(MAT_DIALOG_DATA);

  searchName = this.data.currentName || '';

  get isValid(): boolean {
    return this.searchName.trim().length >= 3;
  }

  onSave(): void {
    if (this.isValid) {
      this.dialogRef.close({ name: this.searchName.trim() });
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
