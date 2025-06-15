import { Routes } from '@angular/router';
import { Documentation } from './documentation/documentation';
import { Crud } from './crud/crud';
import { Empty } from './empty/empty';
import { UsersComponent } from './users/users.component';
import { AuthGuard } from '../guards/auth.guard';

export default [
    { path: 'documentation', component: Documentation },
    { path: 'crud', component: Crud },
    { path: 'empty', component: Empty },
    { path: 'users', component: UsersComponent },
    {
        path: 'listas',
        loadChildren: () => import('./lists/lists.routes').then((m) => m.listsRoutes)
    }
    //{ path: '**', redirectTo: '/notfound' }
] as Routes;
