import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ListItem } from './list-item.model';
import { SessionService } from '../../services/session.service';

@Injectable({
    providedIn: 'root'
})
/**
 * Servicio responsable de realizar las peticiones HTTP
 * relacionadas con los elementos de las listas.
 */
export class ListItemService {
    private apiUrl = '/api/list-items';

    constructor(
        private http: HttpClient,
        private session: SessionService
    ) {}

    /**
     * Obtiene todos los ítems filtrados por su estado y tipo de lista.
     * @param active indica si se solicitan activos o eliminados
     * @param listTypeId opcional, filtra por un tipo de lista concreto
     */
    getAll(active: string, listTypeId?: number): Observable<ListItem[]> {
        let url = `/api/list-items?active=${active}`;
        if (listTypeId !== undefined && listTypeId !== null) {
            url += `&listTypeId=${listTypeId}`;
        }
        return this.http.get<ListItem[]>(url);
    }

    /**
     * Obtiene los ítems asociados a un tipo de lista.
     * @param listTypeId identificador del tipo de lista
     */
    getByTypeId(listTypeId: number): Observable<ListItem[]> {
        // Este endpoint puede ajustarse para filtrar por companyId si es necesario
        const companyId = this.session.companyId;
        return this.http.get<ListItem[]>(`${this.apiUrl}/type/${listTypeId}?companyId=${companyId}`);
    }

    /**
     * Obtiene un ítem por su identificador.
     */
    getById(id: number): Observable<ListItem> {
        return this.http.get<ListItem>(`${this.apiUrl}/${id}`);
    }

    /**
     * Crea un nuevo ítem de lista.
     */
    create(listItem: ListItem): Observable<ListItem> {
        return this.http.post<ListItem>(this.apiUrl, listItem);
    }

    /**
     * Actualiza un ítem existente.
     */
    update(id: number, listItem: ListItem): Observable<ListItem> {
        return this.http.patch<ListItem>(`${this.apiUrl}/${id}`, listItem);
    }

    /**
     * Elimina un ítem por su identificador.
     */
    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }

    /**
     * Restaura un ítem previamente eliminado.
     */
    restore(id: number): Observable<ListItem> {
        return this.http.patch<ListItem>(`${this.apiUrl}/${id}/restore`, {});
    }
}
