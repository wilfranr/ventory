import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * Guard que valida que un usuario tenga acceso a los datos de una empresa específica.
 * Previene acceso no autorizado a datos de otras empresas.
 */
@Injectable()
export class CompanyAccessGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const activeCompanyId = request.activeCompanyId;

    if (!user) {
      throw new ForbiddenException('Usuario no autenticado');
    }

    if (!activeCompanyId) {
      throw new BadRequestException('No se pudo determinar la empresa activa');
    }

    // Superadmin puede acceder a cualquier empresa
    if (user.role === 'superadmin') {
      return true;
    }

    // Verificar que el usuario pertenece a la empresa activa
    if (user.companyId !== activeCompanyId) {
      throw new ForbiddenException('No tienes acceso a los datos de esta empresa');
    }

    return true;
  }
}
