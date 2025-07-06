import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Role {
    id: string;
    name: string;
    permissions?: Permission[];
}

export interface Permission {
    id: string;
    name: string;
}

@Injectable({
    providedIn: 'root'
})
export class RolesService {
    private baseUrl = '/api/roles';

    constructor(private http: HttpClient) {}

    getAllRoles(): Observable<Role[]> {
        return this.http.get<Role[]>(this.baseUrl);
    }

    createRole(name: string): Observable<Role> {
        return this.http.post<Role>(this.baseUrl, { name });
    }

    deleteRole(id: string): Observable<any> {
        return this.http.delete(`${this.baseUrl}/${id}`);
    }

    assignPermissionsToRole(roleId: string, permissionIds: string[]): Observable<Role> {
        return this.http.patch<Role>(`${this.baseUrl}/${roleId}/permissions`, { permissionIds });
    }
}
