import { Routes } from '@angular/router';

export const listsRoutes: Routes = [
    {
        path: '',
        loadComponent: () => import('./list-page.component').then((m) => m.ListPageComponent)
    }
];
