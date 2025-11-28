import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { PaymentErrorComponent } from './payment-error';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('PaymentErrorComponent', () => {
  let component: PaymentErrorComponent;
  let fixture: ComponentFixture<PaymentErrorComponent>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    const routerSpy = jasmine.createSpyObj('Router', ['navigate', 'getCurrentNavigation']);
    routerSpy.getCurrentNavigation.and.returnValue(null);

    await TestBed.configureTestingModule({
      imports: [PaymentErrorComponent, NoopAnimationsModule],
      providers: [{ provide: Router, useValue: routerSpy }]
    }).compileComponents();

    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    fixture = TestBed.createComponent(PaymentErrorComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should redirect to home if no state data', () => {
    fixture.detectChanges();
    expect(router.navigate).toHaveBeenCalledWith(['/']);
  });

  it('should set payment error data from navigation state', () => {
    const mockState = {
      orderNumber: '#ORD-2025-112601',
      attemptDate: '26/11/2025 14:32',
      amount: 'AR$ 2.843.920,00',
      paymentMethod: 'Visa terminada en 4242',
      failureReason: 'Fondos insuficientes',
      orderId: 123
    };

    Object.defineProperty(window, 'history', {
      value: { state: mockState },
      writable: true
    });

    fixture.detectChanges();

    expect(component.orderNumber).toBe(mockState.orderNumber);
    expect(component.amount).toBe(mockState.amount);
    expect(component.paymentMethod).toBe(mockState.paymentMethod);
    expect(component.failureReason).toBe(mockState.failureReason);
    expect(component.orderId).toBe(mockState.orderId);
  });

  it('should navigate to checkout on retry payment', () => {
    component.orderId = 123;
    component.retryPayment();

    expect(router.navigate).toHaveBeenCalledWith(['/checkout'], {
      state: {
        orderId: 123,
        retry: true
      }
    });
  });

  it('should navigate to order detail on view order', () => {
    component.orderId = 123;
    component.viewOrder();

    expect(router.navigate).toHaveBeenCalledWith(['/orders', 123]);
  });

  it('should navigate to orders list if no orderId', () => {
    component.orderId = undefined;
    component.viewOrder();

    expect(router.navigate).toHaveBeenCalledWith(['/orders']);
  });
});
