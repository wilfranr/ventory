import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { User } from '../models/user.model';
import { AuthService } from './auth.service';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

interface UserPayload {
    id?: string;
    name: string;
    email: string;
    role: string;
    status: string;
}

@Injectable({
    providedIn: 'root'
})
export class UserService {
    private apiUrl = '/api/users';

    constructor(
        private http: HttpClient,
        private authService: AuthService
    ) {}

    getUsers() {
        const token = this.authService.getToken();
        let headers = new HttpHeaders({
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        });
        
        // Si el usuario es superadmin, agregar el companyId del localStorage a los headers
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        console.log('[UserService] Usuario actual:', currentUser);
        
        if (currentUser && currentUser.role === 'superadmin') {
            const companyId = localStorage.getItem('userCompanyId') || localStorage.getItem('activeCompanyId');
            console.log('[UserService] Superadmin - companyId encontrado:', companyId);
            
            if (companyId) {
                headers = headers.set('x-company-id', companyId);
                console.log('[UserService] Header x-company-id establecido:', companyId);
            } else {
                console.warn('[UserService] No se encontró companyId para superadmin');
            }
        }
        
        console.log('[UserService] Realizando petición GET a:', this.apiUrl);
        console.log('[UserService] Headers de la petición:', headers.keys().map(key => `${key}: ${headers.get(key)}`));
        
        return this.http.get<User[]>(this.apiUrl, { 
            headers,
            withCredentials: true
        }).pipe(
            tap(users => {
                console.log('[UserService] Usuarios recibidos:', users);
            }),
            catchError(error => {
                console.error('[UserService] Error al obtener usuarios:', error);
                if (error.status === 403) {
                    console.error('[UserService] Error 403 - Acceso denegado. Verifica los permisos del usuario.');
                    console.error('[UserService] Token actual:', token);
                    console.error('[UserService] Usuario actual:', currentUser);
                }
                return throwError(() => error);
            })
        );
    }
    updateUser(id: string, data: UserPayload): Observable<any> {
        return this.http.put(`${this.apiUrl}/${id}`, data);
    }
}
