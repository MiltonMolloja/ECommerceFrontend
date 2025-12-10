import { Component, inject, signal, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService, IpService } from '../../../core/services';
import { UserLoginCommand } from '../../../core/models';
import { switchMap } from 'rxjs';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCheckboxModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private ipService = inject(IpService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  readonly isLoading = signal(false);
  readonly hidePassword = signal(true);
  readonly errorMessage = signal<string | null>(null);

  // Capturar returnUrl desde queryParams
  private returnUrl = '/';
  private returnFromLogin = 'false';

  readonly loginForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    rememberMe: [false]
  });

  ngOnInit(): void {
    // Capturar returnUrl desde los query params
    this.route.queryParams.subscribe((params) => {
      this.returnUrl = params['returnUrl'] || '/';
      this.returnFromLogin = params['returnFromLogin'] || 'false';
    });
  }

  get emailControl() {
    return this.loginForm.controls.email;
  }

  get passwordControl() {
    return this.loginForm.controls.password;
  }

  togglePasswordVisibility(): void {
    this.hidePassword.update((value) => !value);
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const { email, password } = this.loginForm.getRawValue();

    // Primero obtenemos la IP del cliente y luego hacemos el login
    this.ipService
      .getClientIp()
      .pipe(
        switchMap((ipAddress) => {
          const command: UserLoginCommand = {
            email,
            password,
            ipAddress
          };
          return this.authService.login(command);
        })
      )
      .subscribe({
        next: (response) => {
          this.isLoading.set(false);
          if (response.succeeded) {
            // Redirigir a returnUrl o home, manteniendo returnFromLogin si aplica
            if (this.returnUrl !== '/' && this.returnFromLogin === 'true') {
              this.router.navigate([this.returnUrl], {
                queryParams: { returnFromLogin: 'true' }
              });
            } else {
              this.router.navigate([this.returnUrl]);
            }
          } else {
            this.errorMessage.set('Credenciales inválidas. Por favor, intente nuevamente.');
          }
        },
        error: (error) => {
          this.isLoading.set(false);

          this.errorMessage.set(
            'Error al iniciar sesión. Por favor, verifique su conexión e intente nuevamente.'
          );
        }
      });
  }
}
