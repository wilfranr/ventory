import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private apiUrl = 'http://localhost:3001/auth/login';

    constructor(
        private http: HttpClient,
        private router: Router
    ) {}

    login(credentials: { email: string; password: string }) {
        return this.http.post<{ access_token: string }>(this.apiUrl, credentials).pipe(
            tap((res) => {
                localStorage.setItem('access_token', res.access_token);
                this.router.navigate(['/']);
            })
        );
    }

    logout() {
        localStorage.removeItem('token');
        this.router.navigate(['/login']);
    }

    isAuthenticated(): boolean {
        return !!localStorage.getItem('token');
    }
}
