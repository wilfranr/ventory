/**
 * Estrategia Passport para validar tokens JWT.
 */
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { PrismaService } from "../prisma/prisma.service";

interface JwtPayload {
  sub: string;
  email: string;
  role?: string;
  companyId?: string | null;
  permissions?: string[];
}

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

  async validate(payload: JwtPayload) {
    console.log('[JwtStrategy] Validando token JWT para usuario:', payload.sub);
    
    // Si el payload ya incluye permisos, devolverlo directamente
    if (payload.permissions && payload.permissions.length > 0) {
      console.log('[JwtStrategy] Usando permisos del token JWT:', payload.permissions);
      return {
        id: payload.sub,
        email: payload.email,
        role: payload.role,
        companyId: payload.companyId,
        permissions: payload.permissions,
      };
    }

    console.log('[JwtStrategy] Obteniendo permisos desde la base de datos para el usuario:', payload.sub);
    
    // Si no hay permisos en el payload o está vacío, obtenerlos de la base de datos
    try {
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
        console.error('[JwtStrategy] Usuario no encontrado en la base de datos');
        throw new UnauthorizedException('Usuario no encontrado');
      }

      // Obtener permisos del rol del usuario
      const permissions = user.role?.permissions?.map((p) => p.name) || [];
      
      console.log('[JwtStrategy] Permisos obtenidos de la base de datos:', permissions);
      console.log('[JwtStrategy] Rol del usuario:', user.role?.name);
      console.log('[JwtStrategy] Permisos del rol:', user.role?.permissions);

      if (permissions.length === 0) {
        console.warn('[JwtStrategy] El usuario no tiene permisos asignados');
      }

      return {
        id: user.id,
        email: user.email,
        role: user.role?.name,
        companyId: user.companyId,
        permissions,
      };
    } catch (error) {
      console.error('[JwtStrategy] Error al validar el token:', error);
      throw new UnauthorizedException('Error al validar el token');
    }
  }
}
