import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CompanySettings {
    name: string;
    nit: string;
    email: string;
    address: string;
    phones: string;
    website: string;
    currency: string;
    vatPercent: number;
    logo: string;
}

@Injectable({ providedIn: 'root' })
export class CompanyService {
    private baseUrl = '/api/companies';

    private http = inject(HttpClient);

    getSettings(companyId: string): Observable<CompanySettings> {
        return this.http.get<CompanySettings>(`${this.baseUrl}/${companyId}/settings`);
    }

    updateSettings(companyId: string, data: CompanySettings): Observable<CompanySettings> {
        return this.http.put<CompanySettings>(`${this.baseUrl}/${companyId}/settings`, data);
    }
}
