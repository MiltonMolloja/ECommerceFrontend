import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  UserLoginCommand,
  UserCreateCommand,
  IdentityAccess,
  RefreshTokenCommand,
  User
} from '../models';

/**
 * Servicio de autenticación con JWT y Signals
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  private readonly baseUrl = environment.identityUrl;
  private readonly tokenKey = environment.tokenKey;
  private readonly refreshTokenKey = environment.refreshTokenKey;
  private readonly tokenExpirationKey = environment.tokenExpirationKey;

  // Signals
  private readonly accessTokenSignal = signal<string | null>(this.getStoredToken());
  private readonly currentUserSignal = signal<User | null>(this.getUserFromToken());

  // Computed signals
  readonly isAuthenticated = computed(() => {
    const token = this.accessTokenSignal();
    if (!token) return false;

    // Verificar si el token está expirado
    const expiration = this.getTokenExpiration();
    if (!expiration) return false;

    return new Date() < new Date(expiration);
  });

  readonly currentUser = this.currentUserSignal.asReadonly();

  /**
   * Login de usuario
   */
  login(command: UserLoginCommand): Observable<IdentityAccess> {
    return this.http
      .post<IdentityAccess>(`${this.baseUrl}/v1/identity/authentication`, command)
      .pipe(
        tap((response) => {
          if (response.succeeded) {
            this.setSession(response);
          }
        })
      );
  }

  /**
   * Registro de nuevo usuario
   */
  register(command: UserCreateCommand): Observable<{ message: string; success: boolean }> {
    return this.http.post<{ message: string; success: boolean }>(
      `${this.baseUrl}/v1/identity`,
      command
    );
  }

  /**
   * Refresh token
   */
  refreshToken(): Observable<IdentityAccess> {
    const refreshToken = localStorage.getItem(this.refreshTokenKey);
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const command: RefreshTokenCommand = { refreshToken };
    return this.http
      .post<IdentityAccess>(`${this.baseUrl}/v1/identity/refresh-token`, command)
      .pipe(
        tap((response) => {
          if (response.succeeded) {
            this.setSession(response);
          }
        })
      );
  }

  /**
   * Logout
   */
  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.refreshTokenKey);
    localStorage.removeItem(this.tokenExpirationKey);
    this.accessTokenSignal.set(null);
    this.currentUserSignal.set(null);
    this.router.navigate(['/login']);
  }

  /**
   * Obtener el access token actual
   */
  getToken(): string | null {
    return this.accessTokenSignal();
  }

  /**
   * Guardar sesión
   */
  private setSession(authResult: IdentityAccess): void {
    localStorage.setItem(this.tokenKey, authResult.accessToken);
    localStorage.setItem(this.refreshTokenKey, authResult.refreshToken);

    if (authResult.expiresAt) {
      localStorage.setItem(this.tokenExpirationKey, authResult.expiresAt.toString());
    }

    this.accessTokenSignal.set(authResult.accessToken);
    this.currentUserSignal.set(this.getUserFromToken());
  }

  /**
   * Obtener token almacenado
   */
  private getStoredToken(): string | null {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      return localStorage.getItem(this.tokenKey);
    }
    return null;
  }

  /**
   * Obtener expiración del token
   */
  private getTokenExpiration(): string | null {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      return localStorage.getItem(this.tokenExpirationKey);
    }
    return null;
  }

  /**
   * Decodificar JWT y obtener información del usuario
   */
  private getUserFromToken(): User | null {
    const token = this.getStoredToken();
    if (!token) return null;

    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;

      const payloadPart = parts[1];
      if (!payloadPart) return null;

      const payload = JSON.parse(atob(payloadPart));
      return {
        id: payload.sub || payload.userId || '',
        firstName: payload.given_name || payload.firstName || '',
        lastName: payload.family_name || payload.lastName || '',
        email: payload.email || ''
      };
    } catch (error) {
      console.error('Error parsing token:', error);
      return null;
    }
  }
}
