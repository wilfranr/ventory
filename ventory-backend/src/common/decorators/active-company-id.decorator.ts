import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const ActiveCompanyId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string | null => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    // Si es superadmin, el companyId viene del header.
    if (user && user.role && user.role.name === 'superadmin') {
      return request.headers['x-company-id'] || null;
    }

    // Para otros roles, viene del token.
    return user?.companyId || null;
  },
);
