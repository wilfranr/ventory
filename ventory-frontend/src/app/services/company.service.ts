import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Company } from '../models/company.model';

export interface CompanySettings {
    name: string;
    nit: string;
    email: string;
    address: string;
    phones: string;
    website: string;
    currency: string;
    vatPercent: number;
    logo?: string;
}

@Injectable({ providedIn: 'root' })
export class CompanyService {
    private baseUrl = '/api/companies';

    private http = inject(HttpClient);

    getCompanies(): Observable<Company[]> {
        return this.http.get<Company[]>(this.baseUrl);
    }

    getSettings(companyId: string): Observable<CompanySettings> {
        return this.http.get<CompanySettings>(`${this.baseUrl}/${companyId}/settings`);
    }

    updateSettings(
        companyId: string,
        data: CompanySettings,
        logoFile: File | null
    ): Observable<{ logoUrl?: string }> {
        const formData = new FormData();
        Object.keys(data).forEach((key) => {
            const value = (data as any)[key];
            if (value !== null && value !== undefined) {
                formData.append(key, value);
            }
        });

        if (logoFile) {
            formData.append('logo', logoFile, logoFile.name);
        }

        return this.http.put<{ logoUrl?: string }>(`${this.baseUrl}/${companyId}/settings`, formData);
    }

    getCountrySettings(countryCode: string): Observable<{ currency: string; vatPercent: number }> {
        return this.http.get<{ currency: string; vatPercent: number }>(`${this.baseUrl}/country-settings/${countryCode}`);
    }
}
