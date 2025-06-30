/**
 * Guard que comprueba los permisos asignados al usuario.
 */
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { PERMISSIONS_KEY } from "src/permissions/permissions.decorator";
import { hasAnyPermission } from "../helpers/permission.helper";

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  /**
   * Valida si el usuario posee alguno de los permisos requeridos.
   */
  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!requiredPermissions || requiredPermissions.length === 0) {
      // si no se definen los permisos la ruta es pública o solo requiere autenticación
      return true;
    }
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException("usuario no autenticado");
    }
    if (!hasAnyPermission(user.permissions, requiredPermissions)) {
      throw new ForbiddenException(
        "No tienes permisos para acceder a este recurso",
      );
    }
    return true;
  }
}
