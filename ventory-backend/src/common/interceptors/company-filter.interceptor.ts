import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  BadRequestException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * Interceptor que automáticamente valida y filtra datos por empresa.
 * Asegura que los usuarios solo puedan acceder a datos de su empresa.
 */
@Injectable()
export class CompanyFilterInterceptor implements NestInterceptor {
  constructor(private prisma: PrismaService) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Solo aplicar filtrado si hay un usuario autenticado
    if (!user) {
      return next.handle();
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

    // Añadir companyId al request para uso posterior
    request.activeCompanyId = activeCompanyId;

    return next.handle();
  }
}
