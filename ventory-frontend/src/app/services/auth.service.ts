import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private baseUrl = 'http://localhost:3001/auth';

    constructor(
        private http: HttpClient,
        private router: Router
    ) {}

    login(credentials: { email: string; password: string }) {
        return this.http.post<{ access_token: string; user: { name: string } }>(`${this.baseUrl}/login`, credentials).pipe(
            tap((res) => {
                localStorage.setItem('access_token', res.access_token);
                localStorage.setItem('userName', res.user?.name); // si la respuesta lo trae
                localStorage.setItem('Bienvenido', 'true'); // activar toast
                this.router.navigate(['/']);
            })
        );
    }

    logout() {
        localStorage.removeItem('access_token');
        this.router.navigate(['/auth/login']);
    }

    isAuthenticated(): boolean {
        return !!localStorage.getItem('access_token');
    }

    register(formData: FormData) {
        return this.http.post(`${this.baseUrl}/register`, formData);
    }
}
