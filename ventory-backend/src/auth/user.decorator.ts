
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Decorador de parámetro para extraer el usuario de la solicitud (request).
 * Puede devolver el objeto de usuario completo o una propiedad específica del mismo.
 *
 * @example
 * // Devuelve el objeto de usuario completo
 * find(@User() user: User)
 *
 * @example
 * // Devuelve la propiedad 'companyId' del objeto de usuario
 * find(@User('companyId') companyId: string)
 */
export const User = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    // Si se pasa un nombre de propiedad (ej. 'companyId'), devuelve esa propiedad.
    // De lo contrario, devuelve el objeto de usuario completo.
    return data ? user?.[data] : user;
  },
);
