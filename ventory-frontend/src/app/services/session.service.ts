import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class SessionService {
    get companyId(): string {
        const userStr = localStorage.getItem('user');
        if (!userStr) return '';
        try {
            const user = JSON.parse(userStr);
            return user?.company?.id ?? '';
        } catch {
            return '';
        }
    }
}
