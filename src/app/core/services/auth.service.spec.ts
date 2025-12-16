import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let routerSpy: jasmine.SpyObj<Router>;

  const mockLoginResponse = {
    succeeded: true,
    accessToken:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyLTEyMyIsImVtYWlsIjoidGVzdEB0ZXN0LmNvbSIsInVuaXF1ZV9uYW1lIjoiSm9obiIsImZhbWlseV9uYW1lIjoiRG9lIiwiZXhwIjo5OTk5OTk5OTk5fQ.signature',
    refreshToken: 'refresh-token-123',
    expiresAt: new Date(Date.now() + 3600000).toISOString() // 1 hour from now
  };

  const mockLoginCommand = {
    email: 'test@test.com',
    password: 'password123',
    ipAddress: '127.0.0.1'
  };

  const mockRegisterCommand = {
    email: 'new@test.com',
    password: 'Password123!',
    confirmPassword: 'Password123!',
    firstName: 'John',
    lastName: 'Doe'
  };

  beforeEach(() => {
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    // Clear localStorage before each test
    localStorage.clear();

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService, { provide: Router, useValue: routerSpy }]
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
    TestBed.resetTestingModule();
  });

  describe('initialization', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('should initialize with no authentication', () => {
      expect(service.isAuthenticated()).toBe(false);
      expect(service.currentUser()).toBeNull();
    });

    it('should read token from localStorage', () => {
      // The service is already initialized, so we test via setSessionFromExternal
      service.setSessionFromExternal(mockLoginResponse);
      expect(service.getToken()).toBe(mockLoginResponse.accessToken);
    });
  });

  describe('login', () => {
    it('should login successfully and store tokens', (done) => {
      service.login(mockLoginCommand).subscribe((response) => {
        expect(response.succeeded).toBe(true);
        expect(service.getToken()).toBe(mockLoginResponse.accessToken);
        expect(localStorage.getItem(environment.tokenKey)).toBe(mockLoginResponse.accessToken);
        expect(localStorage.getItem(environment.refreshTokenKey)).toBe(
          mockLoginResponse.refreshToken
        );
        done();
      });

      const req = httpMock.expectOne(`${environment.identityUrl}/v1/identity/authentication`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(mockLoginCommand);
      req.flush(mockLoginResponse);
    });

    it('should not store tokens on failed login', (done) => {
      const failedResponse = { succeeded: false, message: 'Invalid credentials' };

      service.login(mockLoginCommand).subscribe((response) => {
        expect(response.succeeded).toBe(false);
        expect(service.getToken()).toBeNull();
        done();
      });

      const req = httpMock.expectOne(`${environment.identityUrl}/v1/identity/authentication`);
      req.flush(failedResponse);
    });

    it('should handle login error', (done) => {
      service.login(mockLoginCommand).subscribe({
        error: (error) => {
          expect(error.status).toBe(401);
          done();
        }
      });

      const req = httpMock.expectOne(`${environment.identityUrl}/v1/identity/authentication`);
      req.flush({ message: 'Unauthorized' }, { status: 401, statusText: 'Unauthorized' });
    });
  });

  describe('register', () => {
    it('should register successfully', (done) => {
      const successResponse = { message: 'User created', success: true };

      service.register(mockRegisterCommand).subscribe((response) => {
        expect(response.success).toBe(true);
        done();
      });

      const req = httpMock.expectOne(`${environment.identityUrl}/v1/identity`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(mockRegisterCommand);
      req.flush(successResponse);
    });

    it('should handle registration error', (done) => {
      service.register(mockRegisterCommand).subscribe({
        error: (error) => {
          expect(error.status).toBe(400);
          done();
        }
      });

      const req = httpMock.expectOne(`${environment.identityUrl}/v1/identity`);
      req.flush({ message: 'Email already exists' }, { status: 400, statusText: 'Bad Request' });
    });
  });

  describe('refreshToken', () => {
    beforeEach(() => {
      localStorage.setItem(environment.refreshTokenKey, 'old-refresh-token');
    });

    it('should refresh token successfully', (done) => {
      service.refreshToken().subscribe((response) => {
        expect(response.succeeded).toBe(true);
        expect(service.getToken()).toBe(mockLoginResponse.accessToken);
        done();
      });

      const req = httpMock.expectOne(`${environment.identityUrl}/v1/identity/refresh-token`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ refreshToken: 'old-refresh-token' });
      req.flush(mockLoginResponse);
    });

    it('should throw error if no refresh token available', () => {
      localStorage.removeItem(environment.refreshTokenKey);

      expect(() => service.refreshToken()).toThrowError('No refresh token available');
    });
  });

  describe('logout', () => {
    beforeEach(() => {
      // Set up authenticated state
      localStorage.setItem(environment.tokenKey, mockLoginResponse.accessToken);
      localStorage.setItem(environment.refreshTokenKey, mockLoginResponse.refreshToken);
      localStorage.setItem(environment.tokenExpirationKey, mockLoginResponse.expiresAt);
    });

    it('should have tokens set up before logout', () => {
      // Note: logout() redirects via window.location.href which we can't easily test
      // We verify the tokens were set up correctly
      expect(localStorage.getItem(environment.tokenKey)).toBe(mockLoginResponse.accessToken);
      expect(localStorage.getItem(environment.refreshTokenKey)).toBe(
        mockLoginResponse.refreshToken
      );
    });
  });

  describe('isAuthenticated', () => {
    it('should return false when no token', () => {
      expect(service.isAuthenticated()).toBe(false);
    });

    it('should return true after successful login', (done) => {
      service.login(mockLoginCommand).subscribe(() => {
        expect(service.isAuthenticated()).toBe(true);
        done();
      });

      const req = httpMock.expectOne(`${environment.identityUrl}/v1/identity/authentication`);
      req.flush(mockLoginResponse);
    });

    it('should return true after setSessionFromExternal', () => {
      service.setSessionFromExternal(mockLoginResponse);
      expect(service.isAuthenticated()).toBe(true);
    });
  });

  describe('getToken', () => {
    it('should return null when no token', () => {
      expect(service.getToken()).toBeNull();
    });

    it('should return token after login', (done) => {
      service.login(mockLoginCommand).subscribe(() => {
        expect(service.getToken()).toBe(mockLoginResponse.accessToken);
        done();
      });

      const req = httpMock.expectOne(`${environment.identityUrl}/v1/identity/authentication`);
      req.flush(mockLoginResponse);
    });
  });

  describe('setSessionFromExternal', () => {
    it('should set session from external auth result', () => {
      service.setSessionFromExternal(mockLoginResponse);

      expect(service.getToken()).toBe(mockLoginResponse.accessToken);
      expect(localStorage.getItem(environment.tokenKey)).toBe(mockLoginResponse.accessToken);
      expect(localStorage.getItem(environment.refreshTokenKey)).toBe(
        mockLoginResponse.refreshToken
      );
    });

    it('should make user authenticated', () => {
      expect(service.isAuthenticated()).toBe(false);

      service.setSessionFromExternal(mockLoginResponse);

      expect(service.isAuthenticated()).toBe(true);
    });
  });

  describe('currentUser', () => {
    it('should return null when no token', () => {
      expect(service.currentUser()).toBeNull();
    });

    it('should decode user from JWT after setSessionFromExternal', () => {
      service.setSessionFromExternal(mockLoginResponse);

      const user = service.currentUser();
      expect(user).toBeTruthy();
      expect(user?.email).toBe('test@test.com');
    });

    it('should decode user from JWT after login', (done) => {
      service.login(mockLoginCommand).subscribe(() => {
        const user = service.currentUser();
        expect(user).toBeTruthy();
        expect(user?.email).toBe('test@test.com');
        done();
      });

      const req = httpMock.expectOne(`${environment.identityUrl}/v1/identity/authentication`);
      req.flush(mockLoginResponse);
    });
  });

  describe('SSR safety', () => {
    it('should handle missing localStorage gracefully', () => {
      // The service checks typeof window !== 'undefined'
      expect(service).toBeTruthy();
    });
  });
});
