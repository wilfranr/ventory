import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpErrorResponse, HttpClient } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, filter, switchMap, take } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class TokenInterceptor implements HttpInterceptor {
    private isRefreshing = false;
    private refreshTokenSubject = new BehaviorSubject<string | null>(null);

    constructor(
        private http: HttpClient,
        private router: Router
    ) {}

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const accessToken = localStorage.getItem('access_token');
        let authReq = req;

        if (accessToken) {
            authReq = req.clone({
                setHeaders: { Authorization: `Bearer ${accessToken}` }
            });
        }

        return next.handle(authReq).pipe(
            catchError((error) => {
                if (error instanceof HttpErrorResponse && error.status === 401 && !req.url.includes('/auth/refresh')) {
                    return this.handle401Error(authReq, next);
                }
                return throwError(() => error);
            })
        );
    }

    private handle401Error(req: HttpRequest<any>, next: HttpHandler) {
        if (!this.isRefreshing) {
            this.isRefreshing = true;
            this.refreshTokenSubject.next(null);

            const refreshToken = localStorage.getItem('refreshToken') || '';
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            const userId = Number(user.id);

            return this.http.post<any>('/api/auth/refresh', { userId, refreshToken }).pipe(
                switchMap((res) => {
                    this.isRefreshing = false;
                    localStorage.setItem('access_token', res.access_token);
                    localStorage.setItem('refreshToken', res.refresh_token);
                    this.refreshTokenSubject.next(res.access_token);

                    return next.handle(
                        req.clone({
                            setHeaders: { Authorization: `Bearer ${res.access_token}` }
                        })
                    );
                }),
                catchError((err) => {
                    this.isRefreshing = false;
                    this.logout();
                    return throwError(() => err);
                })
            );
        } else {
            return this.refreshTokenSubject.pipe(
                filter((token) => token != null),
                take(1),
                switchMap((token) =>
                    next.handle(
                        req.clone({
                            setHeaders: { Authorization: `Bearer ${token}` }
                        })
                    )
                )
            );
        }
    }

    private logout() {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        localStorage.removeItem('userName');
        localStorage.removeItem('Bienvenido');
        this.router.navigate(['/auth/login']);
    }
}
