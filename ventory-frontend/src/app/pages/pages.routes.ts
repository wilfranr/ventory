import { Routes } from '@angular/router';
import { Documentation } from './documentation/documentation';
import { Crud } from './crud/crud';
import { Empty } from './empty/empty';
import { UsersComponent } from './users/users.component';

export default [
    { path: 'documentation', component: Documentation },
    { path: 'crud', component: Crud },
    { path: 'empty', component: Empty },
    { path: 'users', component: UsersComponent },
    {
        path: 'listas',
        loadChildren: () => import('./lists/lists.routes').then((m) => m.listsRoutes)
    },
    {
        path: 'terceros',
        loadChildren: () => import('./third-parties/third-parties.routes').then((m) => m.thirdPartiesRoutes)
    }
    //{ path: '**', redirectTo: '/notfound' }
] as Routes;
