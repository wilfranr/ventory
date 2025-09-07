import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface CompanyTheme {
  themePreset?: string;
  themePrimary?: string;
  themeSurface?: string;
  menuMode?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CompanyThemeService {
  private themeSubject = new BehaviorSubject<CompanyTheme>({});
  public theme$ = this.themeSubject.asObservable();

  constructor(private http: HttpClient) {}

  getThemeSettings(companyId: string): Observable<CompanyTheme> {
    return this.http.get<CompanyTheme>(`/api/companies/${companyId}/theme`).pipe(
      tap(theme => {
        this.themeSubject.next(theme);
      })
    );
  }

  updateThemeSettings(companyId: string, theme: CompanyTheme): Observable<CompanyTheme> {
    return this.http.put<CompanyTheme>(`/api/companies/${companyId}/theme`, theme).pipe(
      tap(updatedTheme => {
        this.themeSubject.next(updatedTheme);
      })
    );
  }

  getCurrentTheme(): CompanyTheme {
    return this.themeSubject.value;
  }
}
