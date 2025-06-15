import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ListItem } from './list-item.model';

@Injectable({
    providedIn: 'root'
})
export class ListItemService {
    private apiUrl = '/api/list-items';

    constructor(private http: HttpClient) {}

    getAll(): Observable<ListItem[]> {
        return this.http.get<ListItem[]>(this.apiUrl);
    }

    getByTypeId(listTypeId: number): Observable<ListItem[]> {
        return this.http.get<ListItem[]>(`${this.apiUrl}/type/${listTypeId}`);
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
