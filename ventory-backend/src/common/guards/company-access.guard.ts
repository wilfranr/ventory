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

    if (!user) {
      throw new ForbiddenException('Usuario no autenticado');
    }

    // Obtener companyId del usuario
    const userCompanyId = user.companyId;
    if (!userCompanyId) {
      throw new BadRequestException('Usuario sin empresa asignada');
    }

    // Para superadmin, permitir acceso a cualquier empresa si se especifica en header
    let activeCompanyId = userCompanyId;
    if (user.role === 'superadmin') {
      const headerCompanyId = request.headers['x-company-id'];
      if (headerCompanyId) {
        // Validar que la empresa existe
        const companyExists = await this.prisma.company.findUnique({
          where: { id: headerCompanyId },
        });
        if (!companyExists) {
          throw new BadRequestException('Empresa especificada no existe');
        }
        activeCompanyId = headerCompanyId;
      }
    }

    // Añadir companyId al request para uso posterior (por si el interceptor no se ejecuta)
    request.activeCompanyId = activeCompanyId;

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
