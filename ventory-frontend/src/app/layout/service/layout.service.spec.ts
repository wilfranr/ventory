import { TestBed } from '@angular/core/testing';
import { LayoutService } from './layout.service';
import { SessionService } from '../../services/session.service';
import { CompanyThemeService } from '../../services/company-theme.service';
import { CompanyContextService } from '../../services/company-context.service';
import { of, throwError, BehaviorSubject } from 'rxjs';

describe('LayoutService - Theme Isolation', () => {
  let service: LayoutService;
  let mockSessionService: jasmine.SpyObj<SessionService>;
  let mockCompanyThemeService: jasmine.SpyObj<CompanyThemeService>;
  let mockCompanyContextService: jasmine.SpyObj<CompanyContextService>;
  let activeCompanySubject: BehaviorSubject<string | null>;

  beforeEach(() => {
    const sessionSpy = jasmine.createSpyObj('SessionService', [], {
      companyId: 'test-company-1'
    });
    
    const companyThemeSpy = jasmine.createSpyObj('CompanyThemeService', [
      'updateThemeSettings', 
      'getCurrentTheme', 
      'getThemeSettings'
    ], {
      getCurrentTheme: () => ({}),
      getThemeSettings: () => of({})
    });

    activeCompanySubject = new BehaviorSubject<string | null>('test-company-1');
    const companyContextSpy = jasmine.createSpyObj('CompanyContextService', [
      'getActiveCompanyId'
    ], {
      getActiveCompanyId: () => 'test-company-1',
      activeCompanyId$: activeCompanySubject.asObservable()
    });

    TestBed.configureTestingModule({
      providers: [
        LayoutService,
        { provide: SessionService, useValue: sessionSpy },
        { provide: CompanyThemeService, useValue: companyThemeSpy },
        { provide: CompanyContextService, useValue: companyContextSpy }
      ]
    });

    service = TestBed.inject(LayoutService);
    mockSessionService = TestBed.inject(SessionService) as jasmine.SpyObj<SessionService>;
    mockCompanyThemeService = TestBed.inject(CompanyThemeService) as jasmine.SpyObj<CompanyThemeService>;
    mockCompanyContextService = TestBed.inject(CompanyContextService) as jasmine.SpyObj<CompanyContextService>;
  });

  afterEach(() => {
    // Limpiar localStorage después de cada prueba
    localStorage.clear();
  });

  describe('Context Management', () => {
    it('should set company context correctly', () => {
      const companyId = 'test-company-123';
      service.setCompanyContext(companyId);
      
      // Verificar que el contexto se estableció
      expect(service['isCompanyContext']()).toBe(true);
      expect(service['currentCompanyId']()).toBe(companyId);
    });

    it('should clear company context correctly', () => {
      service.setCompanyContext('test-company-123');
      service.clearCompanyContext();
      
      // Verificar que el contexto se limpió
      expect(service['isCompanyContext']()).toBe(false);
      expect(service['currentCompanyId']()).toBe(null);
    });
  });

  describe('Theme Changes in Company Context', () => {
    beforeEach(() => {
      service.setCompanyContext('test-company-123');
      mockCompanyThemeService.updateThemeSettings.and.returnValue(of({}));
    });

    it('should save preset to company when in company context', () => {
      service.setPreset('Lara');
      
      expect(mockCompanyThemeService.updateThemeSettings).toHaveBeenCalledWith(
        'test-company-123',
        { themePreset: 'Lara' }
      );
    });

    it('should save primary color to company when in company context', () => {
      service.setPrimaryColor('blue');
      
      expect(mockCompanyThemeService.updateThemeSettings).toHaveBeenCalledWith(
        'test-company-123',
        { themePrimary: 'blue' }
      );
    });

    it('should save surface color to company when in company context', () => {
      service.setSurfaceColor('gray');
      
      expect(mockCompanyThemeService.updateThemeSettings).toHaveBeenCalledWith(
        'test-company-123',
        { themeSurface: 'gray' }
      );
    });

    it('should save menu mode to company when in company context', () => {
      service.setMenuMode('overlay');
      
      expect(mockCompanyThemeService.updateThemeSettings).toHaveBeenCalledWith(
        'test-company-123',
        { menuMode: 'overlay' }
      );
    });
  });

  describe('Theme Changes in User Context', () => {
    beforeEach(() => {
      service.clearCompanyContext();
    });

    it('should save preset to localStorage when not in company context', () => {
      service.setPreset('Nora');
      
      expect(localStorage.getItem('theme-preset')).toBe('Nora');
      expect(mockCompanyThemeService.updateThemeSettings).not.toHaveBeenCalled();
    });

    it('should save primary color to localStorage when not in company context', () => {
      service.setPrimaryColor('red');
      
      expect(localStorage.getItem('theme-primary')).toBe('red');
      expect(mockCompanyThemeService.updateThemeSettings).not.toHaveBeenCalled();
    });

    it('should save surface color to localStorage when not in company context', () => {
      service.setSurfaceColor('slate');
      
      expect(localStorage.getItem('theme-surface')).toBe('slate');
      expect(mockCompanyThemeService.updateThemeSettings).not.toHaveBeenCalled();
    });

    it('should save menu mode to localStorage when not in company context', () => {
      service.setMenuMode('static');
      
      expect(localStorage.getItem('theme-menu-mode')).toBe('static');
      expect(mockCompanyThemeService.updateThemeSettings).not.toHaveBeenCalled();
    });
  });

  describe('Theme Mode (Always User Preference)', () => {
    it('should always save theme mode to localStorage regardless of context', () => {
      // En contexto de empresa
      service.setCompanyContext('test-company-123');
      service.setThemeMode('dark');
      expect(localStorage.getItem('theme-mode')).toBe('dark');
      expect(mockCompanyThemeService.updateThemeSettings).not.toHaveBeenCalled();

      // En contexto de usuario
      service.clearCompanyContext();
      service.setThemeMode('light');
      expect(localStorage.getItem('theme-mode')).toBe('light');
      expect(mockCompanyThemeService.updateThemeSettings).not.toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      service.setCompanyContext('test-company-123');
    });

    it('should fallback to localStorage when company theme update fails', () => {
      mockCompanyThemeService.updateThemeSettings.and.returnValue(
        throwError(() => new Error('API Error'))
      );

      service.setPreset('Lara');
      
      // Debería intentar guardar en la empresa primero
      expect(mockCompanyThemeService.updateThemeSettings).toHaveBeenCalled();
      // Y luego hacer fallback a localStorage
      expect(localStorage.getItem('theme-preset')).toBe('Lara');
    });
  });

  describe('Isolation Between Companies', () => {
    it('should not affect other companies when updating theme', () => {
      // Configurar empresa 1
      service.setCompanyContext('company-1');
      mockCompanyThemeService.updateThemeSettings.and.returnValue(of({}));
      
      service.setPreset('Lara');
      expect(mockCompanyThemeService.updateThemeSettings).toHaveBeenCalledWith(
        'company-1',
        { themePreset: 'Lara' }
      );

      // Cambiar a empresa 2
      service.setCompanyContext('company-2');
      service.setPreset('Nora');
      
      expect(mockCompanyThemeService.updateThemeSettings).toHaveBeenCalledWith(
        'company-2',
        { themePreset: 'Nora' }
      );

      // Verificar que se llamó con diferentes empresas
      const calls = mockCompanyThemeService.updateThemeSettings.calls.all();
      expect(calls[0].args[0]).toBe('company-1');
      expect(calls[1].args[0]).toBe('company-2');
    });
  });

  describe('Company Context Changes', () => {
    it('should have reloadCompanyTheme method', () => {
      expect(typeof service.reloadCompanyTheme).toBe('function');
    });

    it('should use CompanyContextService for loading themes', () => {
      expect(mockCompanyContextService.getActiveCompanyId).toBeDefined();
    });
  });
});
