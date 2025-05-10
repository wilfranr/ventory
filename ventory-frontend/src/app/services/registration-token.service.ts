import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class RegistrationTokenService {
    private apiUrl = 'http://localhost:3001/registration-token';

    constructor(private http: HttpClient) {}

    createToken(data: { role: string }): Observable<{ token: string }> {
        return this.http.post<{ token: string }>(this.apiUrl, data);
    }
}
