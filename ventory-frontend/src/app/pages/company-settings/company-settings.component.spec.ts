import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CompanySettingsComponent } from './company-settings.component';
import { LayoutService } from '../../layout/service/layout.service';
import { CompanyThemeService } from '../../services/company-theme.service';
import { CompanyService } from '../../services/company.service';
import { SessionService } from '../../services/session.service';
import { CompanyContextService } from '../../services/company-context.service';
import { of } from 'rxjs';

describe('CompanySettingsComponent - Theme Integration', () => {
  let component: CompanySettingsComponent;
  let fixture: ComponentFixture<CompanySettingsComponent>;
  let mockLayoutService: jasmine.SpyObj<LayoutService>;
  let mockCompanyThemeService: jasmine.SpyObj<CompanyThemeService>;
  let mockCompanyService: jasmine.SpyObj<CompanyService>;
  let mockSessionService: jasmine.SpyObj<SessionService>;
  let mockCompanyContextService: jasmine.SpyObj<CompanyContextService>;

  beforeEach(async () => {
    const layoutSpy = jasmine.createSpyObj('LayoutService', [
      'setCompanyContext',
      'clearCompanyContext'
    ]);
    
    const companyThemeSpy = jasmine.createSpyObj('CompanyThemeService', [
      'getThemeSettings',
      'updateThemeSettings'
    ]);
    
    const companySpy = jasmine.createSpyObj('CompanyService', [
      'getSettings',
      'updateSettings'
    ]);
    
    const sessionSpy = jasmine.createSpyObj('SessionService', [], {
      companyId: 'test-company-123'
    });
    
    // Hacer companyId configurable
    Object.defineProperty(sessionSpy, 'companyId', {
      get: () => sessionSpy._companyId,
      set: (value) => { sessionSpy._companyId = value; },
      configurable: true
    });
    sessionSpy._companyId = 'test-company-123';
    
    const companyContextSpy = jasmine.createSpyObj('CompanyContextService', [
      'getActiveCompanyId'
    ], {
      getActiveCompanyId: 'test-company-123'
    });

    await TestBed.configureTestingModule({
      imports: [CompanySettingsComponent],
      providers: [
        { provide: LayoutService, useValue: layoutSpy },
        { provide: CompanyThemeService, useValue: companyThemeSpy },
        { provide: CompanyService, useValue: companySpy },
        { provide: SessionService, useValue: sessionSpy },
        { provide: CompanyContextService, useValue: companyContextSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CompanySettingsComponent);
    component = fixture.componentInstance;
    mockLayoutService = TestBed.inject(LayoutService) as jasmine.SpyObj<LayoutService>;
    mockCompanyThemeService = TestBed.inject(CompanyThemeService) as jasmine.SpyObj<CompanyThemeService>;
    mockCompanyService = TestBed.inject(CompanyService) as jasmine.SpyObj<CompanyService>;
    mockSessionService = TestBed.inject(SessionService) as jasmine.SpyObj<SessionService>;
    mockCompanyContextService = TestBed.inject(CompanyContextService) as jasmine.SpyObj<CompanyContextService>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Company ID Resolution', () => {
    it('should return active company ID when available', () => {
      mockCompanyContextService.getActiveCompanyId.and.returnValue('active-company-123');
      (mockSessionService as any)._companyId = 'session-company-456';

      const companyId = component.getCurrentCompanyId();
      
      expect(companyId).toBe('active-company-123');
    });

    it('should return session company ID when no active company', () => {
      mockCompanyContextService.getActiveCompanyId.and.returnValue(null);
      (mockSessionService as any)._companyId = 'session-company-456';

      const companyId = component.getCurrentCompanyId();
      
      expect(companyId).toBe('session-company-456');
    });

    it('should return null when no company ID available', () => {
      mockCompanyContextService.getActiveCompanyId.and.returnValue(null);
      (mockSessionService as any)._companyId = null;

      const companyId = component.getCurrentCompanyId();
      
      expect(companyId).toBeNull();
    });
  });

  describe('Theme Loading', () => {
    beforeEach(() => {
      mockCompanyService.getSettings.and.returnValue(of({
        name: 'Test Company',
        nit: '123456789',
        email: 'test@company.com',
        address: 'Test Address',
        phones: '1234567890',
        website: 'https://test.com',
        currency: 'COP',
        vatPercent: 19,
        logo: 'test-logo.png'
      }));
      
      mockCompanyThemeService.getThemeSettings.and.returnValue(of({
        themePreset: 'Lara',
        themePrimary: 'blue',
        themeSurface: 'gray',
        menuMode: 'overlay'
      }));
    });

    it('should load company theme settings on init', () => {
      component.ngOnInit();
      
      expect(mockCompanyThemeService.getThemeSettings).toHaveBeenCalledWith('test-company-123');
    });

    it('should handle theme loading errors gracefully', () => {
      mockCompanyThemeService.getThemeSettings.and.returnValue(
        of(null).pipe(() => { throw new Error('Theme loading failed'); })
      );
      
      spyOn(console, 'warn');
      
      component.ngOnInit();
      
      expect(console.warn).toHaveBeenCalledWith(
        'No se pudieron cargar los estilos de la empresa:',
        jasmine.any(Error)
      );
    });
  });

  describe('AppConfigurator Integration', () => {
    it('should pass company ID to AppConfigurator', () => {
      mockCompanyContextService.getActiveCompanyId.and.returnValue('test-company-123');
      
      fixture.detectChanges();
      
      const appConfigurator = fixture.debugElement.query(
        sel => sel.name === 'app-configurator'
      );
      
      expect(appConfigurator).toBeTruthy();
      expect(appConfigurator.properties['companyId']).toBe('test-company-123');
    });
  });
});
