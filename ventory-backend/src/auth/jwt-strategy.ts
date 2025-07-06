/**
 * Estrategia Passport para validar tokens JWT.
 */
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET as string,
    });
  }
  /**
   * Valida el token JWT y adjunta el usuario a la petición.
   */

  async validate(payload: any) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      include: {
        role: {
          include: {
            permissions: true,
          },
        },
        company: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException("Usuario no encontrado");
    }

    const permissions =
      user.role?.permissions?.map((perm) => ({ name: perm.name })) || [];

    // Crea un nuevo objeto user plano, con role como string:
    const plainUser = {
      ...user,
      role:
        user.role && typeof user.role !== "string" ? user.role.name : user.role,
    };

    return {
      ...plainUser,
      permissions,
    };
  }
}
