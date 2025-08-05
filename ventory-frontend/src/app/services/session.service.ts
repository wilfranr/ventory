import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SessionService {
    private companyNameSub = new BehaviorSubject<string | null>(null);
    companyName$ = this.companyNameSub.asObservable();

    private logoUrlSub = new BehaviorSubject<string | null>(null);
    logoUrl$ = this.logoUrlSub.asObservable();

    constructor() {
        this.loadInitialData();
    }

    private loadInitialData() {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            try {
                const user = JSON.parse(userStr);
                this.companyNameSub.next(user?.company?.name || null);
                this.logoUrlSub.next(user?.company?.logo || null);
            } catch {}
        }
    }

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

    updateCompany(name: string | null, logoUrl: string | null) {
        this.companyNameSub.next(name);
        this.logoUrlSub.next(logoUrl);

        const userStr = localStorage.getItem('user');
        if (userStr) {
            try {
                const user = JSON.parse(userStr);
                if (user.company) {
                    user.company.name = name;
                    user.company.logo = logoUrl;
                }
                localStorage.setItem('user', JSON.stringify(user));
            } catch {}
        }
    }

    clearSession() {
        this.companyNameSub.next(null);
        this.logoUrlSub.next(null);
    }
}
