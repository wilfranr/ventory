import { TestBed } from '@angular/core/testing';
import { HttpRequest, HttpHandlerFn } from '@angular/common/http';
import { companyIdInterceptor } from './company-id.interceptor';
import { CompanyContextService } from '../services/company-context.service';
import { SessionService } from '../services/session.service';

describe('CompanyIdInterceptor', () => {
  let companyContextService: jasmine.SpyObj<CompanyContextService>;
  let sessionService: jasmine.SpyObj<SessionService>;
  let mockRequest: HttpRequest<any>;
  let mockHandler: jasmine.Spy<HttpHandlerFn>;

  beforeEach(() => {
    const companyContextSpy = jasmine.createSpyObj('CompanyContextService', ['getActiveCompanyId']);
    const sessionSpy = jasmine.createSpyObj('SessionService', [], { companyId: 'user-company-1' });

    TestBed.configureTestingModule({
      providers: [
        { provide: CompanyContextService, useValue: companyContextSpy },
        { provide: SessionService, useValue: sessionSpy },
      ],
    });

    companyContextService = TestBed.inject(CompanyContextService) as jasmine.SpyObj<CompanyContextService>;
    sessionService = TestBed.inject(SessionService) as jasmine.SpyObj<SessionService>;
    
    mockRequest = new HttpRequest('GET', '/api/test');
    mockHandler = jasmine.createSpy('HttpHandlerFn').and.returnValue(Promise.resolve());
  });

  // Helper function to run interceptor in injection context
  function runInterceptor() {
    return TestBed.runInInjectionContext(() => {
      return companyIdInterceptor(mockRequest, mockHandler);
    });
  }

  it('should add X-Company-ID header when activeCompanyId is available', () => {
    companyContextService.getActiveCompanyId.and.returnValue('active-company-1');

    runInterceptor();

    expect(mockHandler).toHaveBeenCalled();
    const calledRequest = mockHandler.calls.mostRecent().args[0];
    expect(calledRequest.headers.get('X-Company-ID')).toBe('active-company-1');
  });

  it('should fallback to user companyId when no activeCompanyId', () => {
    companyContextService.getActiveCompanyId.and.returnValue(null);
    Object.defineProperty(sessionService, 'companyId', {
      get: () => 'user-company-1',
      configurable: true,
    });

    runInterceptor();

    expect(mockHandler).toHaveBeenCalled();
    const calledRequest = mockHandler.calls.mostRecent().args[0];
    expect(calledRequest.headers.get('X-Company-ID')).toBe('user-company-1');
  });

  it('should not add header when no companyId is available', () => {
    companyContextService.getActiveCompanyId.and.returnValue(null);
    Object.defineProperty(sessionService, 'companyId', {
      get: () => '',
      configurable: true,
    });

    runInterceptor();

    expect(mockHandler).toHaveBeenCalled();
    const calledRequest = mockHandler.calls.mostRecent().args[0];
    expect(calledRequest.headers.get('X-Company-ID')).toBeNull();
  });

  it('should prioritize activeCompanyId over user companyId', () => {
    companyContextService.getActiveCompanyId.and.returnValue('active-company-1');
    Object.defineProperty(sessionService, 'companyId', {
      get: () => 'user-company-1',
      configurable: true,
    });

    runInterceptor();

    expect(mockHandler).toHaveBeenCalled();
    const calledRequest = mockHandler.calls.mostRecent().args[0];
    expect(calledRequest.headers.get('X-Company-ID')).toBe('active-company-1');
  });

  it('should handle undefined activeCompanyId', () => {
    companyContextService.getActiveCompanyId.and.returnValue(null);
    Object.defineProperty(sessionService, 'companyId', {
      get: () => 'user-company-1',
      configurable: true,
    });

    runInterceptor();

    expect(mockHandler).toHaveBeenCalled();
    const calledRequest = mockHandler.calls.mostRecent().args[0];
    expect(calledRequest.headers.get('X-Company-ID')).toBe('user-company-1');
  });
});
