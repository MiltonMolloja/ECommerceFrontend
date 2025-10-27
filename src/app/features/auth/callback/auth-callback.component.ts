import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../core/services';
import { IdentityAccess } from '../../../core/models';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

/**
 * Componente que maneja el callback del microservicio de login
 * Captura los tokens de la URL y los almacena
 */
@Component({
  selector: 'app-auth-callback',
  standalone: true,
  imports: [CommonModule, MatProgressSpinnerModule],
  template: `
    <div class="callback-container">
      <mat-spinner diameter="50"></mat-spinner>
      <p>{{ message }}</p>
    </div>
  `,
  styles: [
    `
      .callback-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 100vh;
        gap: 20px;

        p {
          font-size: 16px;
          color: rgba(0, 0, 0, 0.6);
        }
      }
    `
  ]
})
export class AuthCallbackComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private authService = inject(AuthService);

  message = 'Procesando autenticación...';

  ngOnInit(): void {
    // Obtener query params de la URL
    this.route.queryParams.subscribe((params) => {
      const accessToken = params['accessToken'];
      const refreshToken = params['refreshToken'];
      const expiresAt = params['expiresAt'];
      const nextUrl = params['next'] || '/'; // Página a la que el usuario quería ir

      console.log('Callback - Tokens recibidos:', {
        accessToken: !!accessToken,
        refreshToken: !!refreshToken
      });

      if (accessToken && refreshToken) {
        // Crear objeto IdentityAccess
        const identityAccess: IdentityAccess = {
          succeeded: true,
          accessToken,
          refreshToken,
          expiresAt
        };

        // Guardar tokens usando AuthService
        this.authService.setSessionFromExternal(identityAccess);

        this.message = 'Autenticación exitosa. Redirigiendo...';

        // Esperar un momento y redirigir a la página original o al home
        setTimeout(() => {
          // Redirigir y limpiar la URL de los tokens
          this.router.navigateByUrl(nextUrl, {
            replaceUrl: true // Reemplaza la entrada en el historial para limpiar los tokens de la URL
          });
        }, 500);
      } else {
        // Error: no se recibieron tokens
        this.message = 'Error en la autenticación. Redirigiendo...';
        console.error('No se recibieron tokens del microservicio de login');

        setTimeout(() => {
          this.router.navigate(['/'], { replaceUrl: true });
        }, 2000);
      }
    });
  }
}
