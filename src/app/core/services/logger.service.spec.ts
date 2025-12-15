import { TestBed } from '@angular/core/testing';
import { LoggerService, LogLevel, ExternalLogger } from './logger.service';

describe('LoggerService', () => {
  let service: LoggerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LoggerService);
    // Reset to DEBUG level for testing
    service.setLogLevel(LogLevel.DEBUG);
  });

  describe('Log Level Configuration', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('should set log level', () => {
      service.setLogLevel(LogLevel.ERROR);
      // After setting to ERROR, debug should not log
      const debugSpy = spyOn(console, 'debug');
      service.debug('test message');
      expect(debugSpy).not.toHaveBeenCalled();
    });

    it('should allow all logs when level is DEBUG', () => {
      service.setLogLevel(LogLevel.DEBUG);
      const debugSpy = spyOn(console, 'debug');
      const infoSpy = spyOn(console, 'info');
      const warnSpy = spyOn(console, 'warn');
      const errorSpy = spyOn(console, 'error');

      service.debug('debug message');
      service.info('info message');
      service.warn('warn message');
      service.error('error message');

      expect(debugSpy).toHaveBeenCalled();
      expect(infoSpy).toHaveBeenCalled();
      expect(warnSpy).toHaveBeenCalled();
      expect(errorSpy).toHaveBeenCalled();
    });

    it('should only allow ERROR logs when level is ERROR', () => {
      service.setLogLevel(LogLevel.ERROR);
      const debugSpy = spyOn(console, 'debug');
      const infoSpy = spyOn(console, 'info');
      const warnSpy = spyOn(console, 'warn');
      const errorSpy = spyOn(console, 'error');

      service.debug('debug message');
      service.info('info message');
      service.warn('warn message');
      service.error('error message');

      expect(debugSpy).not.toHaveBeenCalled();
      expect(infoSpy).not.toHaveBeenCalled();
      expect(warnSpy).not.toHaveBeenCalled();
      expect(errorSpy).toHaveBeenCalled();
    });

    it('should not log anything when level is OFF', () => {
      service.setLogLevel(LogLevel.OFF);
      const debugSpy = spyOn(console, 'debug');
      const infoSpy = spyOn(console, 'info');
      const warnSpy = spyOn(console, 'warn');
      const errorSpy = spyOn(console, 'error');

      service.debug('debug message');
      service.info('info message');
      service.warn('warn message');
      service.error('error message');

      expect(debugSpy).not.toHaveBeenCalled();
      expect(infoSpy).not.toHaveBeenCalled();
      expect(warnSpy).not.toHaveBeenCalled();
      expect(errorSpy).not.toHaveBeenCalled();
    });
  });

  describe('Debug Logging', () => {
    it('should log debug messages with prefix', () => {
      const spy = spyOn(console, 'debug');
      service.debug('test message');
      expect(spy).toHaveBeenCalledWith('[DEBUG] test message');
    });

    it('should log debug messages with additional args', () => {
      const spy = spyOn(console, 'debug');
      service.debug('test message', { key: 'value' }, 123);
      expect(spy).toHaveBeenCalledWith('[DEBUG] test message', { key: 'value' }, 123);
    });
  });

  describe('Info Logging', () => {
    it('should log info messages with prefix', () => {
      const spy = spyOn(console, 'info');
      service.info('test message');
      expect(spy).toHaveBeenCalledWith('[INFO] test message');
    });

    it('should log info messages with additional args', () => {
      const spy = spyOn(console, 'info');
      service.info('test message', { data: 'test' });
      expect(spy).toHaveBeenCalledWith('[INFO] test message', { data: 'test' });
    });
  });

  describe('Warn Logging', () => {
    it('should log warn messages with prefix', () => {
      const spy = spyOn(console, 'warn');
      service.warn('test warning');
      expect(spy).toHaveBeenCalledWith('[WARN] test warning', undefined);
    });

    it('should log warn messages with context', () => {
      const spy = spyOn(console, 'warn');
      const context = { userId: '123', action: 'test' };
      service.warn('test warning', context);
      expect(spy).toHaveBeenCalledWith('[WARN] test warning', context);
    });
  });

  describe('Error Logging', () => {
    it('should log error messages with prefix', () => {
      const spy = spyOn(console, 'error');
      service.error('test error');
      expect(spy).toHaveBeenCalledWith('[ERROR] test error', undefined, undefined);
    });

    it('should log error messages with Error object', () => {
      const spy = spyOn(console, 'error');
      const error = new Error('Something went wrong');
      service.error('test error', error);
      expect(spy).toHaveBeenCalledWith('[ERROR] test error', error, undefined);
    });

    it('should log error messages with context', () => {
      const spy = spyOn(console, 'error');
      const context = { requestId: 'abc123' };
      service.error('test error', undefined, context);
      expect(spy).toHaveBeenCalledWith('[ERROR] test error', undefined, context);
    });
  });

  describe('HTTP Error Logging', () => {
    it('should log HTTP errors with method, url, and status', () => {
      const spy = spyOn(console, 'error');
      service.httpError('GET', '/api/users', 404);
      expect(spy).toHaveBeenCalledWith(
        '[ERROR] HTTP GET /api/users failed with status 404',
        undefined,
        { method: 'GET', url: '/api/users', status: 404 }
      );
    });

    it('should log HTTP errors with additional context', () => {
      const spy = spyOn(console, 'error');
      service.httpError('POST', '/api/orders', 500, undefined, { orderId: '123' });
      expect(spy).toHaveBeenCalledWith(
        '[ERROR] HTTP POST /api/orders failed with status 500',
        undefined,
        { method: 'POST', url: '/api/orders', status: 500, orderId: '123' }
      );
    });
  });

  describe('Performance Logging', () => {
    it('should log performance metrics', () => {
      const spy = spyOn(console, 'debug');
      service.performance('API Call', 150);
      expect(spy).toHaveBeenCalledWith('[PERF] API Call: 150ms', undefined);
    });

    it('should log performance metrics with context', () => {
      const spy = spyOn(console, 'debug');
      service.performance('Database Query', 50, { query: 'SELECT *' });
      expect(spy).toHaveBeenCalledWith('[PERF] Database Query: 50ms', { query: 'SELECT *' });
    });

    it('should not log performance when level is higher than DEBUG', () => {
      service.setLogLevel(LogLevel.INFO);
      const spy = spyOn(console, 'debug');
      service.performance('API Call', 150);
      expect(spy).not.toHaveBeenCalled();
    });
  });

  describe('External Logger Integration', () => {
    let mockExternalLogger: jasmine.SpyObj<ExternalLogger>;

    beforeEach(() => {
      mockExternalLogger = jasmine.createSpyObj('ExternalLogger', [
        'captureException',
        'captureMessage'
      ]);
      service.setExternalLogger(mockExternalLogger);
    });

    it('should set external logger', () => {
      // External logger is set in beforeEach
      const error = new Error('Test error');
      service.error('test', error);
      expect(mockExternalLogger.captureException).toHaveBeenCalled();
    });

    it('should send errors to external logger with Error object', () => {
      const error = new Error('Test error');
      const context = { userId: '123' };
      service.error('Something failed', error, context);

      expect(mockExternalLogger.captureException).toHaveBeenCalledWith(error, {
        message: 'Something failed',
        userId: '123'
      });
    });

    it('should send errors to external logger without Error object', () => {
      service.error('Something failed', 'string error', { userId: '123' });

      expect(mockExternalLogger.captureMessage).toHaveBeenCalledWith('Something failed', 'error', {
        error: 'string error',
        userId: '123'
      });
    });
  });

  describe('Console Grouping', () => {
    it('should create console group in dev mode', () => {
      const groupSpy = spyOn(console, 'group');
      service.group('Test Group');
      // Note: This may or may not be called depending on isDevMode()
      // In tests, isDevMode() returns true
      expect(groupSpy).toHaveBeenCalledWith('Test Group');
    });

    it('should end console group in dev mode', () => {
      const groupEndSpy = spyOn(console, 'groupEnd');
      service.groupEnd();
      expect(groupEndSpy).toHaveBeenCalled();
    });

    it('should not create group when log level is higher than DEBUG', () => {
      service.setLogLevel(LogLevel.INFO);
      const groupSpy = spyOn(console, 'group');
      service.group('Test Group');
      expect(groupSpy).not.toHaveBeenCalled();
    });
  });
});
