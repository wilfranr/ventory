import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, tap, throwError } from 'rxjs';
import { ListType } from './list-type.model';

@Injectable({
    providedIn: 'root'
})
/**
 * Servicio encargado de gestionar las operaciones
 * CRUD relacionadas con los tipos de lista.
 */
export class ListTypeService {
    private apiUrl = '/api/list-type';

    constructor(private http: HttpClient) {}

    /** Obtiene todos los tipos de lista */
    getAll(): Observable<ListType[]> {
        return this.http.get<ListType[]>(this.apiUrl);
    }

    /** Obtiene un tipo de lista por ID */
    getById(id: string): Observable<ListType> {
        return this.http.get<ListType>(`${this.apiUrl}/${id}`);
    }

    /** Crea un nuevo tipo de lista */
    create(listType: Partial<ListType>): Observable<ListType> {
        return this.http.post<ListType>(this.apiUrl, listType).pipe(
            catchError((error: HttpErrorResponse) => {
                return throwError(() => error);
            })
        );
    }

    /** Actualiza un tipo de lista existente */
    update(id: string, listType: Partial<ListType>): Observable<ListType> {
        return this.http.patch<ListType>(`${this.apiUrl}/${id}`, listType).pipe(
            catchError((error: HttpErrorResponse) => {
                return throwError(() => error);
            })
        );
    }

    /** Elimina un tipo de lista */
    delete(id: string): Observable<any> {
        return this.http.delete(`${this.apiUrl}/${id}`);
    }
}
