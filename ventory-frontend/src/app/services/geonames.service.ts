import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class GeonamesService {
    private baseUrl = '/api/geonames';
    private http = inject(HttpClient);

    getCountries(): Observable<any[]> {
        return this.http.get<any[]>(`${this.baseUrl}/countries`);
    }

    getDepartments(countryCode: string): Observable<any[]> {
        return this.http.get<any[]>(`${this.baseUrl}/departments/${countryCode}`);
    }

    getCities(departmentId: string): Observable<any[]> {
        return this.http.get<any[]>(`${this.baseUrl}/cities/${departmentId}`);
    }
}
