import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../../core/services/auth.service';
import { UserLoginCommand } from '../../../core/models';

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
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  readonly isLoading = signal(false);
  readonly hidePassword = signal(true);
  readonly errorMessage = signal<string | null>(null);

  readonly loginForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    rememberMe: [false]
  });

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
    const command: UserLoginCommand = {
      email,
      password,
      ipAddress: '127.0.0.1' // TODO: Implementar obtención de IP real del cliente
    };

    this.authService.login(command).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        if (response.succeeded) {
          this.router.navigate(['/']);
        } else {
          this.errorMessage.set('Credenciales inválidas. Por favor, intente nuevamente.');
        }
      },
      error: (error) => {
        this.isLoading.set(false);
        console.error('Login error:', error);
        this.errorMessage.set(
          'Error al iniciar sesión. Por favor, verifique su conexión e intente nuevamente.'
        );
      }
    });
  }
}
