import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CompanySettings {
    currency: string;
    vatPercent: number;
}

@Injectable({ providedIn: 'root' })
export class CompanyService {
    private baseUrl = '/api/companies';

    constructor(private http: HttpClient) {}

    getSettings(companyId: string): Observable<CompanySettings> {
        return this.http.get<CompanySettings>(`${this.baseUrl}/${companyId}/settings`);
    }

    updateSettings(companyId: string, data: CompanySettings): Observable<CompanySettings> {
        return this.http.put<CompanySettings>(`${this.baseUrl}/${companyId}/settings`, data);
    }
}
