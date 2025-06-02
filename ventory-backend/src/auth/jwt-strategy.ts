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

  async validate(payload: any) {
    console.log("JwtStrategy: validate llamado", payload);
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

    // Array plano de permisos (necesario para el helper/guard)
    const permissions =
      user.role?.permissions?.map((perm) => ({ name: perm.name })) || [];

    return {
      ...user,
      permissions,
    };
  }
}
