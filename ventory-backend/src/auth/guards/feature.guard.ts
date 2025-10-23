import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

type JwtPayload = {
  sub: string;
  email: string;
  companyId: string;
};

@Injectable()
export class FeatureGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    // 2. Aplica el tipo a `request.user`
    const user = request.user as JwtPayload;

    if (!user || !user.companyId) {
      throw new ForbiddenException(
        "Acceso denegado. No se encontró información de la empresa.",
      );
    }

    const company = await this.prisma.company.findUnique({
      where: { id: user.companyId },
      select: { hasAssetTrackingModule: true },
    });

    if (!company?.hasAssetTrackingModule) {
      throw new ForbiddenException(
        "Este módulo no está activado para su empresa.",
      );
    }

    return true;
  }
}
