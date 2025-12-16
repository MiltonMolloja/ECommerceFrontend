import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { authGuard } from './auth-guard';
import { AuthService } from '../services/auth.service';

describe('authGuard', () => {
  let authService: jasmine.SpyObj<AuthService>;
  let mockRoute: ActivatedRouteSnapshot;
  let mockState: RouterStateSnapshot;

  beforeEach(() => {
    authService = jasmine.createSpyObj('AuthService', ['isAuthenticated']);

    TestBed.configureTestingModule({
      providers: [{ provide: AuthService, useValue: authService }]
    });

    mockRoute = {} as ActivatedRouteSnapshot;
    mockState = { url: '/protected-page' } as RouterStateSnapshot;
  });

  it('should allow access when user is authenticated', () => {
    authService.isAuthenticated.and.returnValue(true);

    const result = TestBed.runInInjectionContext(() => authGuard(mockRoute, mockState));

    expect(result).toBe(true);
    expect(authService.isAuthenticated).toHaveBeenCalled();
  });

  it('should check authentication status', () => {
    authService.isAuthenticated.and.returnValue(true);

    TestBed.runInInjectionContext(() => authGuard(mockRoute, mockState));

    expect(authService.isAuthenticated).toHaveBeenCalledTimes(1);
  });

  // Note: Tests for unauthenticated redirect are skipped because window.location.href
  // causes a full page reload in Karma. Use E2E tests for redirect flow testing.
});
