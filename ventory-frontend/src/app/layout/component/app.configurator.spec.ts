import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppConfigurator } from './app.configurator';
import { LayoutService } from '../service/layout.service';
import { CompanyThemeService } from '../../services/company-theme.service';
import { Router } from '@angular/router';
import { PrimeNG } from 'primeng/config';
import { signal } from '@angular/core';

describe('AppConfigurator - Company Context', () => {
  let component: AppConfigurator;
  let fixture: ComponentFixture<AppConfigurator>;
  let mockLayoutService: jasmine.SpyObj<LayoutService>;
  let mockCompanyThemeService: jasmine.SpyObj<CompanyThemeService>;

  beforeEach(async () => {
    const layoutSpy = jasmine.createSpyObj('LayoutService', [
      'setCompanyContext',
      'clearCompanyContext',
      'setPreset',
      'setPrimaryColor',
      'setSurfaceColor',
      'setMenuMode'
    ]);
    
    const companyThemeSpy = jasmine.createSpyObj('CompanyThemeService', ['updateThemeSettings']);

    await TestBed.configureTestingModule({
      imports: [AppConfigurator],
      providers: [
        { provide: LayoutService, useValue: layoutSpy },
        { provide: CompanyThemeService, useValue: companyThemeSpy },
        { provide: Router, useValue: jasmine.createSpyObj('Router', ['navigate']) },
        { provide: PrimeNG, useValue: jasmine.createSpyObj('PrimeNG', ['config']) }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AppConfigurator);
    component = fixture.componentInstance;
    mockLayoutService = TestBed.inject(LayoutService) as jasmine.SpyObj<LayoutService>;
    mockCompanyThemeService = TestBed.inject(CompanyThemeService) as jasmine.SpyObj<CompanyThemeService>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Company Context Management', () => {
    it('should call layoutService methods when theme changes', () => {
      component.onPresetChange('Lara');
      expect(mockLayoutService.setPreset).toHaveBeenCalledWith('Lara');
      
      component.changeTheme('blue');
      expect(mockLayoutService.setPrimaryColor).toHaveBeenCalledWith('blue');
      
      component.changeSurface('gray');
      expect(mockLayoutService.setSurfaceColor).toHaveBeenCalledWith('gray');
      
      component.onMenuModeChange('overlay');
      expect(mockLayoutService.setMenuMode).toHaveBeenCalledWith('overlay');
    });
  });

});
