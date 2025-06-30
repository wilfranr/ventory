import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ListItem } from './list-item.model';
import { SessionService } from '../../services/session.service';

@Injectable({
    providedIn: 'root'
})
export class ListItemService {
    private apiUrl = '/api/list-items';

    constructor(
        private http: HttpClient,
        private session: SessionService
    ) {}

    getAll(active: string, listTypeId?: number): Observable<ListItem[]> {
        let url = `/api/list-items?active=${active}`;
        if (listTypeId !== undefined && listTypeId !== null) {
            url += `&listTypeId=${listTypeId}`;
        }
        return this.http.get<ListItem[]>(url);
    }

    getByTypeId(listTypeId: number): Observable<ListItem[]> {
        // Este endpoint lo puedes ajustar para que también filtre por companyId si es necesario
        const companyId = this.session.companyId;
        return this.http.get<ListItem[]>(`${this.apiUrl}/type/${listTypeId}?companyId=${companyId}`);
    }

    getById(id: number): Observable<ListItem> {
        return this.http.get<ListItem>(`${this.apiUrl}/${id}`);
    }

    create(listItem: ListItem): Observable<ListItem> {
        return this.http.post<ListItem>(this.apiUrl, listItem);
    }

    update(id: number, listItem: ListItem): Observable<ListItem> {
        return this.http.patch<ListItem>(`${this.apiUrl}/${id}`, listItem);
    }

    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}
