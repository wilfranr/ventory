import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Decorador que extrae el companyId activo del request.
 * Funciona tanto para usuarios normales como para superadmin.
 */
export const ActiveCompany = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest();
    
    // Si el interceptor ya procesó el companyId, usarlo
    if (request.activeCompanyId) {
      return request.activeCompanyId;
    }

    // Fallback al comportamiento original
    const user = request.user;
    if (user?.role === 'superadmin') {
      return request.headers['x-company-id'] || user.companyId;
    }
    
    return user?.companyId;
  },
);
