import { Routes } from '@angular/router';

/**
 * Definición de rutas para el módulo de listas.
 */

export const listsRoutes: Routes = [
    {
        path: '',
        // Carga lazily el componente principal de listas
        loadComponent: () => import('./list-page.component').then((m) => m.ListPageComponent)
    }
];
