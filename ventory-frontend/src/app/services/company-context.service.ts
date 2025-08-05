import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CompanyContextService {
  private activeCompanyId = new BehaviorSubject<string | null>(this.getCompanyIdFromStorage());
  activeCompanyId$ = this.activeCompanyId.asObservable();

  constructor() { }

  private getCompanyIdFromStorage(): string | null {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem('activeCompanyId');
    }
    return null;
  }

  setActiveCompany(companyId: string): void {
    localStorage.setItem('activeCompanyId', companyId);
    this.activeCompanyId.next(companyId);
  }

  getActiveCompanyId(): string | null {
    return this.activeCompanyId.getValue();
  }

  clearActiveCompany(): void {
    localStorage.removeItem('activeCompanyId');
    this.activeCompanyId.next(null);
  }
}
