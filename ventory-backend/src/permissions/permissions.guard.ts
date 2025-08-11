/**
 * Guard que verifica permisos contra la base de datos.
 */
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { PERMISSIONS_KEY } from "./permissions.decorator";
import { IS_PUBLIC_KEY } from "../auth/public.decorator";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  /**
   * Comprueba si el usuario posee los permisos necesarios.
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Verificar si la ruta está marcada como pública
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    
    if (isPublic) {
      return true;
    }

    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) throw new ForbiddenException("No autenticado");

    const userFromDb = await this.prisma.user.findUnique({
      where: { id: user.id },
      include: {
        role: {
          include: {
            permissions: true,
          },
        },
      },
    });

    if (!userFromDb?.role) throw new ForbiddenException("Sin rol asignado");

    const userPermissions = userFromDb.role.permissions.map((p) => p.name);

    const hasPermission = requiredPermissions.every((p) =>
      userPermissions.includes(p),
    );

    if (!hasPermission)
      throw new ForbiddenException("No tienes permisos suficientes");

    return true;
  }
}
