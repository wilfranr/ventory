import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private baseUrl = '/api/auth';

    constructor(
        private http: HttpClient,
        private router: Router
    ) {}

    login(credentials: { email: string; password: string }) {
        return this.http.post<{ access_token: string; user: any }>(`${this.baseUrl}/login`, credentials).pipe(
            tap((res: any) => {
                const token = res?.access_token ?? '';
                if (typeof token === 'object') {
                    localStorage.setItem('access_token', token.access_token);
                } else {
                    localStorage.setItem('access_token', token);
                }
                // 💡 Guarda el usuario completo
                localStorage.setItem('user', JSON.stringify(res?.user ?? {}));
                localStorage.setItem('userName', res?.user?.name ?? '');
                localStorage.setItem('Bienvenido', 'true');
                this.router.navigate(['/']);
            }),
            catchError((error) => {
                let msg = 'Ocurrió un error inesperado. Intenta de nuevo';
                if (error.status === 0) {
                    msg = 'No se pudo conectar al servidor. Verifica tu conexión a internet.';
                } else if (error.status === 401) {
                    msg = 'Correo o contraseña incorrectos';
                } else if (error.status === 403) {
                    msg = 'No tienes permiso para acceder a esta sección';
                }
                return throwError(() => new Error(msg));
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

    getToken(): string | null {
        return localStorage.getItem('access_token');
    }
}
