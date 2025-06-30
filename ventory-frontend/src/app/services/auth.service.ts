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
        return this.http.post<{ access_token: string; refresh_token: string; user: any }>(`${this.baseUrl}/login`, credentials).pipe(
            tap((res: any) => {
                localStorage.setItem('access_token', res.access_token);
                localStorage.setItem('refreshToken', res.refresh_token);

                // Guarda el usuario completo (esto ya lo tienes)
                localStorage.setItem('user', JSON.stringify(res.user ?? {}));

                // 💡 GUARDA el id por separado (esto es CLAVE)
                localStorage.setItem('userId', String(res.user.id));

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
        const userId = Number(localStorage.getItem('userId'));
        this.http.post(`${this.baseUrl}/logout`, { userId }).subscribe({
            next: () => {
                // Opcional: mostrar mensaje de "Sesión cerrada correctamente"
                this.limpiarStorageYSalir();
            },
            error: () => {
                // Si falla igual limpias y navegas, para no dejar la sesión activa
                this.limpiarStorageYSalir();
            }
        });
    }

    private limpiarStorageYSalir() {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        localStorage.removeItem('userId');
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

    get currentUser(): any {
        const userStr = localStorage.getItem('user');
        if (!userStr) return null;
        try {
            return JSON.parse(userStr);
        } catch {
            return null;
        }
    }

    get companyId(): string | null {
        return this.currentUser?.companyId || null;
    }
}
