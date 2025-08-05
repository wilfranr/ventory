import { inject } from '@angular/core';
import { CanActivateFn, ActivatedRouteSnapshot, Router } from '@angular/router';

export const AuthGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
    const router = inject(Router);
    const token = localStorage.getItem('access_token');

    if (!token) {
        return router.parseUrl('/auth/login');
    }

    // --- Validación de roles (uno o varios) ---
    const requiredRoles = route.data['requiredRole'] ? (Array.isArray(route.data['requiredRole']) ? route.data['requiredRole'] : [route.data['requiredRole']]) : null;

    // --- Validación de permisos (opcional, uno o varios) ---
    const requiredPermissions = route.data['requiredPermission'] ? (Array.isArray(route.data['requiredPermission']) ? route.data['requiredPermission'] : [route.data['requiredPermission']]) : null;

    const userJson = localStorage.getItem('user');
    if (!userJson) {
        return router.parseUrl('/notfound');
    }

    const user = JSON.parse(userJson);

    // Validación de rol
    if (
        requiredRoles &&
        (!user.role ||
            !requiredRoles.includes(
                typeof user.role === 'string' ? user.role : user.role.name // Compara por el campo name ya que desde el backend estoy retornando un objeto
            ))
    ) {
        return router.parseUrl('/auth/access');
    }

    // Validación de permisos (si tienes user.permissions como array de strings)
    if (requiredPermissions && (!user.permissions || !requiredPermissions.every((perm: string) => user.permissions.includes(perm)))) {
        return router.parseUrl('/auth/access');
    }

    return true;
};
