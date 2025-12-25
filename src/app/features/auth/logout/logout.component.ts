import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../../core/services/auth.service';

/**
 * LogoutComponent
 *
 * Limpia los tokens locales y redirige a la home.
 * Esta página es llamada cuando:
 * 1. El usuario cierra sesión desde Auth (puerto 4400)
 * 2. Se necesita limpiar tokens del Frontend
 */
@Component({
  selector: 'app-logout',
  standalone: true,
  imports: [CommonModule, MatProgressSpinnerModule],
  template: `
    <div class="logout-container">
      <mat-spinner diameter="50"></mat-spinner>
      <p>Cerrando sesión...</p>
    </div>
  `,
  styles: [
    `
      .logout-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 100vh;
        gap: 1rem;

        p {
          font-size: 1.125rem;
          color: var(--text-secondary, #666);
        }
      }
    `
  ]
})
export class LogoutComponent implements OnInit {
  private authService = inject(AuthService);

  ngOnInit(): void {
    // Limpiar tokens locales
    this.authService.clearSession();

    // Redirigir a la home después de un pequeño delay
    setTimeout(() => {
      window.location.href = '/';
    }, 100);
  }
}
