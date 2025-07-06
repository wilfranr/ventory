import { HttpEvent, HttpHandlerFn, HttpInterceptorFn, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject, catchError, filter, switchMap, take } from 'rxjs';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

let isRefreshing = false;
let refreshTokenSubject = new BehaviorSubject<string | null>(null);

export const tokenInterceptor: HttpInterceptorFn = (req: HttpRequest<any>, next: HttpHandlerFn): Observable<HttpEvent<any>> => {
    const http = inject(HttpClient);
    const router = inject(Router);

    const accessToken = localStorage.getItem('access_token');
    let authReq = req;

    if (accessToken) {
        authReq = req.clone({
            setHeaders: { Authorization: `Bearer ${accessToken}` }
        });
    }

    return next(authReq).pipe(
        catchError((error) => {
            if (error instanceof HttpErrorResponse && error.status === 401 && !req.url.includes('/auth/refresh')) {
                return handle401Error(authReq, next, http, router);
            }
            return throwError(() => error);
        })
    );
};

function handle401Error(req: HttpRequest<any>, next: HttpHandlerFn, http: HttpClient, router: Router) {
    if (!isRefreshing) {
        isRefreshing = true;
        refreshTokenSubject.next(null);

        const refreshToken = localStorage.getItem('refreshToken') || '';
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const userId = Number(user.id);

        console.log('TokenInterceptor: Intentando refrescar token...');
        console.log('TokenInterceptor: refreshToken de localStorage:', refreshToken);
        console.log('TokenInterceptor: userId de localStorage:', userId);

        return http.post<any>('/api/auth/refresh', { userId, refreshToken }).pipe(
            switchMap((res) => {
                isRefreshing = false;
                localStorage.setItem('access_token', res.access_token);
                localStorage.setItem('refreshToken', res.refresh_token);
                refreshTokenSubject.next(res.access_token);
                console.log('TokenInterceptor: Token refrescado exitosamente. Nuevos tokens guardados.');
                console.log('TokenInterceptor: Nuevo access_token:', res.access_token);
                console.log('TokenInterceptor: Nuevo refresh_token:', res.refresh_token);

                return next(
                    req.clone({
                        setHeaders: { Authorization: `Bearer ${res.access_token}` }
                    })
                );
            }),
            catchError((err) => {
                isRefreshing = false;
                console.error('TokenInterceptor: Error al refrescar el token:', err);
                logout(router);
                console.log('TokenInterceptor: Se ha llamado a logout() debido a un error en el refresco.');
                return throwError(() => err);
            })
        );
    } else {
        return refreshTokenSubject.pipe(
            filter((token) => token != null),
            take(1),
            switchMap((token) =>
                next(
                    req.clone({
                        setHeaders: { Authorization: `Bearer ${token}` }
                    })
                )
            )
        );
    }
}

function logout(router: Router) {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    localStorage.removeItem('userName');
    localStorage.removeItem('Bienvenido');
    router.navigate(['/auth/login']);
}
