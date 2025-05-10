import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { User } from '../models/user.model';
import { AuthService } from './auth.service';
import { Observable } from 'rxjs';

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
    private apiUrl = 'http://localhost:3001/users';

    constructor(
        private http: HttpClient,
        private authService: AuthService
    ) {}

    getUsers() {
        const token = this.authService.getToken();
        const headers = new HttpHeaders({
            Authorization: `Bearer ${token}`
        });
        return this.http.get<User[]>(this.apiUrl, { headers });
    }
    updateUser(id: string, data: UserPayload): Observable<any> {
        return this.http.put(`${this.apiUrl}/${id}`, data);
    }
}
