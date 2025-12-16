import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { authInterceptor } from './auth.interceptor';
import { AuthService } from '../services/auth.service';
import { environment } from '../../../environments/environment';

describe('authInterceptor', () => {
  let httpClient: HttpClient;
  let httpMock: HttpTestingController;
  let authService: jasmine.SpyObj<AuthService>;

  beforeEach(() => {
    authService = jasmine.createSpyObj('AuthService', ['getToken']);

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: authService }
      ]
    });

    httpClient = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('requests to API Gateway', () => {
    it('should add Authorization header when token exists', () => {
      authService.getToken.and.returnValue('test-jwt-token');

      httpClient.get(`${environment.apiGatewayUrl}/api/products`).subscribe();

      const req = httpMock.expectOne(`${environment.apiGatewayUrl}/api/products`);
      expect(req.request.headers.has('Authorization')).toBe(true);
      expect(req.request.headers.get('Authorization')).toBe('Bearer test-jwt-token');
      req.flush({});
    });

    it('should not add Authorization header when no token', () => {
      authService.getToken.and.returnValue(null);

      httpClient.get(`${environment.apiGatewayUrl}/api/products`).subscribe();

      const req = httpMock.expectOne(`${environment.apiGatewayUrl}/api/products`);
      expect(req.request.headers.has('Authorization')).toBe(false);
      req.flush({});
    });

    it('should work with POST requests', () => {
      authService.getToken.and.returnValue('test-jwt-token');

      httpClient.post(`${environment.apiGatewayUrl}/api/orders`, { items: [] }).subscribe();

      const req = httpMock.expectOne(`${environment.apiGatewayUrl}/api/orders`);
      expect(req.request.method).toBe('POST');
      expect(req.request.headers.get('Authorization')).toBe('Bearer test-jwt-token');
      req.flush({});
    });

    it('should work with PUT requests', () => {
      authService.getToken.and.returnValue('test-jwt-token');

      httpClient.put(`${environment.apiGatewayUrl}/api/cart/1`, { quantity: 2 }).subscribe();

      const req = httpMock.expectOne(`${environment.apiGatewayUrl}/api/cart/1`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.headers.get('Authorization')).toBe('Bearer test-jwt-token');
      req.flush({});
    });

    it('should work with DELETE requests', () => {
      authService.getToken.and.returnValue('test-jwt-token');

      httpClient.delete(`${environment.apiGatewayUrl}/api/cart/1`).subscribe();

      const req = httpMock.expectOne(`${environment.apiGatewayUrl}/api/cart/1`);
      expect(req.request.method).toBe('DELETE');
      expect(req.request.headers.get('Authorization')).toBe('Bearer test-jwt-token');
      req.flush({});
    });
  });

  describe('requests to external URLs', () => {
    it('should not add Authorization header for external URLs', () => {
      authService.getToken.and.returnValue('test-jwt-token');

      httpClient.get('https://external-api.com/data').subscribe();

      const req = httpMock.expectOne('https://external-api.com/data');
      expect(req.request.headers.has('Authorization')).toBe(false);
      req.flush({});
    });

    it('should not add Authorization header for relative URLs not starting with gateway', () => {
      authService.getToken.and.returnValue('test-jwt-token');

      httpClient.get('/assets/config.json').subscribe();

      const req = httpMock.expectOne('/assets/config.json');
      expect(req.request.headers.has('Authorization')).toBe(false);
      req.flush({});
    });
  });

  describe('token handling', () => {
    it('should call getToken for each request', () => {
      authService.getToken.and.returnValue('token-1');

      httpClient.get(`${environment.apiGatewayUrl}/api/products`).subscribe();
      httpMock.expectOne(`${environment.apiGatewayUrl}/api/products`).flush({});

      httpClient.get(`${environment.apiGatewayUrl}/api/categories`).subscribe();
      httpMock.expectOne(`${environment.apiGatewayUrl}/api/categories`).flush({});

      expect(authService.getToken).toHaveBeenCalledTimes(2);
    });

    it('should use updated token for subsequent requests', () => {
      authService.getToken.and.returnValue('token-1');

      httpClient.get(`${environment.apiGatewayUrl}/api/products`).subscribe();
      const req1 = httpMock.expectOne(`${environment.apiGatewayUrl}/api/products`);
      expect(req1.request.headers.get('Authorization')).toBe('Bearer token-1');
      req1.flush({});

      // Token changes
      authService.getToken.and.returnValue('token-2');

      httpClient.get(`${environment.apiGatewayUrl}/api/categories`).subscribe();
      const req2 = httpMock.expectOne(`${environment.apiGatewayUrl}/api/categories`);
      expect(req2.request.headers.get('Authorization')).toBe('Bearer token-2');
      req2.flush({});
    });
  });

  describe('request cloning', () => {
    it('should not modify original request', () => {
      authService.getToken.and.returnValue('test-token');

      // Make a request with custom headers
      httpClient
        .get(`${environment.apiGatewayUrl}/api/products`, {
          headers: { 'X-Custom-Header': 'custom-value' }
        })
        .subscribe();

      const req = httpMock.expectOne(`${environment.apiGatewayUrl}/api/products`);

      // Should have both custom header and Authorization
      expect(req.request.headers.get('X-Custom-Header')).toBe('custom-value');
      expect(req.request.headers.get('Authorization')).toBe('Bearer test-token');
      req.flush({});
    });
  });
});
