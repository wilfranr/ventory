import { TestBed } from '@angular/core/testing';
import { SessionService } from './session.service';

describe('SessionService', () => {
  let service: SessionService;
  let mockLocalStorage: jasmine.SpyObj<Storage>;

  beforeEach(() => {
    const localStorageSpy = jasmine.createSpyObj('localStorage', ['getItem', 'setItem', 'removeItem']);
    
    TestBed.configureTestingModule({
      providers: [SessionService],
    });

    service = TestBed.inject(SessionService);
    
    // Mock localStorage
    mockLocalStorage = localStorageSpy;
    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorage,
      writable: true,
    });
  });

  beforeEach(() => {
    // Reset localStorage mock
    mockLocalStorage.getItem.and.returnValue(null);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('companyId getter', () => {
    it('should return companyId from user data in localStorage', () => {
      const userData = {
        company: {
          id: 'company-123',
          name: 'Test Company',
        },
      };
      mockLocalStorage.getItem.and.returnValue(JSON.stringify(userData));

      const companyId = service.companyId;

      expect(companyId).toBe('company-123');
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('user');
    });

    it('should return empty string when no user data', () => {
      mockLocalStorage.getItem.and.returnValue(null);

      const companyId = service.companyId;

      expect(companyId).toBe('');
    });

    it('should return empty string when user data is invalid JSON', () => {
      mockLocalStorage.getItem.and.returnValue('invalid-json');

      const companyId = service.companyId;

      expect(companyId).toBe('');
    });

    it('should return empty string when user has no company', () => {
      const userData = { name: 'User' };
      mockLocalStorage.getItem.and.returnValue(JSON.stringify(userData));

      const companyId = service.companyId;

      expect(companyId).toBe('');
    });
  });

  describe('updateCompany', () => {
    it('should update company name and logo', () => {
      const userData = {
        company: {
          id: 'company-123',
          name: 'Old Name',
          logo: 'old-logo.png',
        },
      };
      mockLocalStorage.getItem.and.returnValue(JSON.stringify(userData));

      service.updateCompany('New Name', 'new-logo.png');

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'user',
        JSON.stringify({
          ...userData,
          company: {
            id: 'company-123',
            name: 'New Name',
            logo: 'new-logo.png',
          },
        })
      );
    });

    it('should handle null values', () => {
      const userData = {
        company: {
          id: 'company-123',
          name: 'Old Name',
          logo: 'old-logo.png',
        },
      };
      mockLocalStorage.getItem.and.returnValue(JSON.stringify(userData));

      service.updateCompany(null, null);

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'user',
        JSON.stringify({
          ...userData,
          company: {
            id: 'company-123',
            name: null,
            logo: null,
          },
        })
      );
    });

    it('should handle missing company in user data', () => {
      const userData = { name: 'User' };
      mockLocalStorage.getItem.and.returnValue(JSON.stringify(userData));

      service.updateCompany('New Name', 'new-logo.png');

      // Should not call setItem if no company exists
      expect(mockLocalStorage.setItem).not.toHaveBeenCalled();
    });
  });

  describe('clearSession', () => {
    it('should clear company name and logo', () => {
      service.clearSession();

      // The service should emit null values for both observables
      service.companyName$.subscribe(name => expect(name).toBeNull());
      service.logoUrl$.subscribe(logo => expect(logo).toBeNull());
    });
  });

  describe('loadInitialData', () => {
    it('should load company data from localStorage on init', () => {
      const userData = {
        company: {
          id: 'company-123',
          name: 'Test Company',
          logo: 'logo.png',
        },
      };
      mockLocalStorage.getItem.and.returnValue(JSON.stringify(userData));

      // Create new service instance to trigger loadInitialData
      const newService = new SessionService();

      newService.companyName$.subscribe(name => expect(name).toBe('Test Company'));
      newService.logoUrl$.subscribe(logo => expect(logo).toBe('logo.png'));
    });

    it('should handle invalid JSON gracefully', () => {
      mockLocalStorage.getItem.and.returnValue('invalid-json');

      // Should not throw error
      expect(() => new SessionService()).not.toThrow();
    });
  });
});
