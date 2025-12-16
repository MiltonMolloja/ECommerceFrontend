import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ProductService } from './product.service';

describe('ProductService', () => {
  let service: ProductService;
  let httpMock: HttpTestingController;

  const mockBackendResponse = {
    productId: '123',
    name: 'Test Product',
    brand: 'TestBrand',
    imageUrls: ['/images/product1.jpg', '/images/product2.jpg'],
    price: 99.99,
    currency: 'USD'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ProductService]
    });

    service = TestBed.inject(ProductService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('initialization', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });
  });

  describe('getProductBasicInfo', () => {
    it('should fetch product basic info successfully', (done) => {
      service.getProductBasicInfo('123').subscribe((result) => {
        expect(result).toBeTruthy();
        expect(result?.id).toBe('123');
        expect(result?.name).toBe('Test Product');
        expect(result?.brand).toBe('TestBrand');
        expect(result?.price).toBe(99.99);
        done();
      });

      const req = httpMock.expectOne('/api/products/123');
      expect(req.request.method).toBe('GET');
      req.flush(mockBackendResponse);
    });

    it('should handle response with id instead of productId', (done) => {
      const responseWithId = { ...mockBackendResponse, productId: undefined, id: '456' };

      service.getProductBasicInfo('456').subscribe((result) => {
        expect(result?.id).toBe('456');
        done();
      });

      const req = httpMock.expectOne('/api/products/456');
      req.flush(responseWithId);
    });

    it('should handle response with title instead of name', (done) => {
      const responseWithTitle = { ...mockBackendResponse, name: undefined, title: 'Product Title' };

      service.getProductBasicInfo('123').subscribe((result) => {
        expect(result?.name).toBe('Product Title');
        done();
      });

      const req = httpMock.expectOne('/api/products/123');
      req.flush(responseWithTitle);
    });

    it('should handle brand as object', (done) => {
      const responseWithBrandObject = { ...mockBackendResponse, brand: { name: 'BrandName' } };

      service.getProductBasicInfo('123').subscribe((result) => {
        expect(result?.brand).toBe('BrandName');
        done();
      });

      const req = httpMock.expectOne('/api/products/123');
      req.flush(responseWithBrandObject);
    });

    it('should handle brandName field', (done) => {
      const responseWithBrandName = {
        ...mockBackendResponse,
        brand: undefined,
        brandName: 'AnotherBrand'
      };

      service.getProductBasicInfo('123').subscribe((result) => {
        expect(result?.brand).toBe('AnotherBrand');
        done();
      });

      const req = httpMock.expectOne('/api/products/123');
      req.flush(responseWithBrandName);
    });

    it('should use imageUrl if imageUrls not available', (done) => {
      const responseWithImageUrl = {
        ...mockBackendResponse,
        imageUrls: undefined,
        imageUrl: '/single-image.jpg'
      };

      service.getProductBasicInfo('123').subscribe((result) => {
        expect(result?.imageUrl).toBe('/single-image.jpg');
        done();
      });

      const req = httpMock.expectOne('/api/products/123');
      req.flush(responseWithImageUrl);
    });

    it('should use mainImage if other image fields not available', (done) => {
      const responseWithMainImage = {
        ...mockBackendResponse,
        imageUrls: undefined,
        imageUrl: undefined,
        mainImage: '/main-image.jpg'
      };

      service.getProductBasicInfo('123').subscribe((result) => {
        expect(result?.imageUrl).toBe('/main-image.jpg');
        done();
      });

      const req = httpMock.expectOne('/api/products/123');
      req.flush(responseWithMainImage);
    });

    it('should use placeholder if no image available', (done) => {
      const responseNoImage = {
        ...mockBackendResponse,
        imageUrls: undefined,
        imageUrl: undefined,
        mainImage: undefined
      };

      service.getProductBasicInfo('123').subscribe((result) => {
        expect(result?.imageUrl).toBe('/assets/placeholder.png');
        done();
      });

      const req = httpMock.expectOne('/api/products/123');
      req.flush(responseNoImage);
    });

    it('should use currentPrice if price not available', (done) => {
      const responseWithCurrentPrice = {
        ...mockBackendResponse,
        price: undefined,
        currentPrice: 149.99
      };

      service.getProductBasicInfo('123').subscribe((result) => {
        expect(result?.price).toBe(149.99);
        done();
      });

      const req = httpMock.expectOne('/api/products/123');
      req.flush(responseWithCurrentPrice);
    });

    it('should default to USD if currency not specified', (done) => {
      const responseNoCurrency = { ...mockBackendResponse, currency: undefined };

      service.getProductBasicInfo('123').subscribe((result) => {
        expect(result?.currency).toBe('USD');
        done();
      });

      const req = httpMock.expectOne('/api/products/123');
      req.flush(responseNoCurrency);
    });

    it('should return null on HTTP error', (done) => {
      service.getProductBasicInfo('999').subscribe((result) => {
        expect(result).toBeNull();
        done();
      });

      const req = httpMock.expectOne('/api/products/999');
      req.flush('Not found', { status: 404, statusText: 'Not Found' });
    });

    it('should handle missing name gracefully', (done) => {
      const responseNoName = { ...mockBackendResponse, name: undefined, title: undefined };

      service.getProductBasicInfo('123').subscribe((result) => {
        expect(result?.name).toBe('Sin nombre');
        done();
      });

      const req = httpMock.expectOne('/api/products/123');
      req.flush(responseNoName);
    });
  });

  describe('getProductsBasicInfo', () => {
    it('should fetch multiple products', (done) => {
      const productIds = ['123', '456'];

      service.getProductsBasicInfo(productIds).subscribe((result) => {
        expect(result.size).toBe(2);
        expect(result.get('123')).toBeTruthy();
        expect(result.get('456')).toBeTruthy();
        done();
      });

      // Handle both requests
      const req1 = httpMock.expectOne('/api/products/123');
      req1.flush(mockBackendResponse);

      const req2 = httpMock.expectOne('/api/products/456');
      req2.flush({ ...mockBackendResponse, productId: '456', name: 'Product 2' });
    });

    it('should handle partial failures', (done) => {
      const productIds = ['123', '999'];

      service.getProductsBasicInfo(productIds).subscribe((result) => {
        expect(result.size).toBe(1);
        expect(result.get('123')).toBeTruthy();
        expect(result.get('999')).toBeUndefined();
        done();
      });

      const req1 = httpMock.expectOne('/api/products/123');
      req1.flush(mockBackendResponse);

      const req2 = httpMock.expectOne('/api/products/999');
      req2.flush('Not found', { status: 404, statusText: 'Not Found' });
    });

    it('should return empty map for empty input', (done) => {
      service.getProductsBasicInfo([]).subscribe((result) => {
        expect(result.size).toBe(0);
        done();
      });
    });
  });
});
