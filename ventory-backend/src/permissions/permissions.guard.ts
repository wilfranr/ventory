/**
 * Guard que verifica permisos contra la base de datos.
 */
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from "@nestjs/common";
import { Request } from 'express';
import { Reflector } from "@nestjs/core";
import { PERMISSIONS_KEY } from "./permissions.decorator";
import { IS_PUBLIC_KEY } from "../auth/public.decorator";
import { PrismaService } from "../prisma/prisma.service";

interface UserPayload {
  id: string;
  email: string;
  role?: string;
  companyId?: string | null;
  permissions?: string[];
}

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
    const request = context.switchToHttp().getRequest<Request>();
    console.log('\n===== [PermissionsGuard] Iniciando validación de permisos =====');
    console.log(`[PermissionsGuard] Ruta: ${request.method} ${request.url}`);
    
    // Verificar si la ruta está marcada como pública
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    
    console.log('[PermissionsGuard] ¿Ruta pública?', isPublic);
    
    if (isPublic) {
      console.log('[PermissionsGuard] Acceso permitido: ruta pública');
      return true;
    }

    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    console.log('\n[PermissionsGuard] === Validación de permisos ===');
    console.log(`[PermissionsGuard] Ruta: ${request.method} ${request.url}`);
    console.log('[PermissionsGuard] Permisos requeridos para esta ruta:', requiredPermissions);

    // Si no se requieren permisos específicos, permitir el acceso
    if (!requiredPermissions || requiredPermissions.length === 0) {
      console.log('[PermissionsGuard] Acceso permitido: no se requieren permisos específicos');
      return true;
    }

    const user = request.user as UserPayload | undefined;
    
    // Mostrar información detallada del usuario
    if (user) {
      console.log('\n[PermissionsGuard] === Información del Usuario ===');
      console.log(`[PermissionsGuard] ID: ${user.id}`);
      console.log(`[PermissionsGuard] Email: ${user.email}`);
      console.log(`[PermissionsGuard] Rol: ${user.role || 'No definido'}`);
      console.log(`[PermissionsGuard] ID de Compañía: ${user.companyId || 'No definido'}`);
      console.log(`[PermissionsGuard] Permisos en el token: ${user.permissions ? user.permissions.join(', ') : 'Ninguno'}`);
      console.log(`[PermissionsGuard] Headers de la petición:`, request.headers);
    } else {
      console.error('\n[PermissionsGuard] Error: Usuario no autenticado');
      console.error('[PermissionsGuard] No se encontró información de usuario en la solicitud');
      console.error('[PermissionsGuard] Headers de autorización:', request.headers['authorization']);
      throw new ForbiddenException("No autenticado");
    }

    // Verificar si el token JWT tiene los permisos necesarios
    const tokenPermissions = user.permissions || [];
    console.log('\n[PermissionsGuard] === Validando permisos del token JWT ===');
    console.log(`[PermissionsGuard] Permisos requeridos: ${requiredPermissions.join(', ')}`);
    console.log(`[PermissionsGuard] Permisos en el token: ${tokenPermissions.join(', ') || 'Ninguno'}`);
    
    if (Array.isArray(tokenPermissions)) {
      const hasAllPermissions = requiredPermissions.every(requiredPerm => {
        const hasPerm = tokenPermissions.includes(requiredPerm);
        console.log(`[PermissionsGuard] Verificando permiso '${requiredPerm}': ${hasPerm ? '✅ PERMITIDO' : '❌ DENEGADO'}`);
        
        if (!hasPerm) {
          console.warn(`[PermissionsGuard] El permiso '${requiredPerm}' no está en los permisos del token`);
          console.warn(`[PermissionsGuard] Permisos disponibles: ${tokenPermissions.join(', ') || 'Ninguno'}`);
        }
        
        return hasPerm;
      });
      
      if (hasAllPermissions) {
        console.log('[PermissionsGuard] ✅ Acceso permitido: El token JWT tiene todos los permisos requeridos');
        return true;
      } else {
        console.warn('[PermissionsGuard] ⚠️  El token JWT no tiene todos los permisos requeridos');
        console.warn(`[PermissionsGuard] Permisos faltantes: ${
          requiredPermissions.filter(p => !tokenPermissions.includes(p)).join(', ')
        }`);
      }
    } else {
      console.error('[PermissionsGuard] ❌ Error: Los permisos del token JWT no son un array válido');
      console.error('[PermissionsGuard] Tipo de permisos:', typeof tokenPermissions);
      console.error('[PermissionsGuard] Contenido de permisos:', tokenPermissions);
    }

    // Si no hay permisos en el token o no son suficientes, verificar en la base de datos
    console.log('[PermissionsGuard] Consultando permisos en la base de datos para el usuario:', user.id);
    
    try {
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

      console.log('[PermissionsGuard] Datos del usuario desde BD:', userFromDb ? {
        role: userFromDb.role ? {
          id: userFromDb.role.id,
          name: userFromDb.role.name,
          permissionsCount: userFromDb.role.permissions?.length || 0
        } : 'Sin rol',
        hasRole: !!userFromDb.role
      } : 'Usuario no encontrado');

      if (!userFromDb?.role) {
        console.error('[PermissionsGuard] Error: El usuario no tiene un rol asignado');
        throw new ForbiddenException("Sin rol asignado");
      }

      const dbUserPermissions = userFromDb.role.permissions.map((p) => p.name);
      console.log('[PermissionsGuard] Permisos del usuario desde BD:', dbUserPermissions);
      
      console.log('[PermissionsGuard] Permisos requeridos para la ruta:', requiredPermissions);
      console.log('[PermissionsGuard] Permisos del usuario desde BD:', dbUserPermissions);
      
      // Convertir todo a minúsculas para evitar problemas de mayúsculas/minúsculas
      const normalizedDbPermissions = dbUserPermissions.map(p => p.toLowerCase().trim());
      const normalizedRequiredPermissions = requiredPermissions.map(p => p.toLowerCase().trim());
      
      console.log('[PermissionsGuard] Permisos normalizados de BD:', normalizedDbPermissions);
      console.log('[PermissionsGuard] Permisos requeridos normalizados:', normalizedRequiredPermissions);
      
      const hasPermission = normalizedRequiredPermissions.every(p => {
        const hasPerm = normalizedDbPermissions.includes(p);
        console.log(`[PermissionsGuard] Verificando permiso '${p}': ${hasPerm ? 'PERMITIDO' : 'DENEGADO'}`);
        if (!hasPerm) {
          console.log(`[PermissionsGuard] El permiso '${p}' no fue encontrado en los permisos del usuario`);
          console.log(`[PermissionsGuard] Permisos disponibles: ${normalizedDbPermissions.join(', ')}`);
        }
        return hasPerm;
      });

      if (!hasPermission) {
        console.error('[PermissionsGuard] ===== ERROR DE PERMISOS =====');
        console.error(`[PermissionsGuard] Ruta: ${request.url}`);
        console.error(`[PermissionsGuard] Método: ${request.method}`);
        console.error(`[PermissionsGuard] Usuario ID: ${user.id}`);
        console.error(`[PermissionsGuard] Rol: ${user.role}`);
        console.error(`[PermissionsGuard] Permisos requeridos: ${requiredPermissions.join(', ')}`);
        console.error(`[PermissionsGuard] Permisos del usuario: ${dbUserPermissions.join(', ')}`);
        console.error('[PermissionsGuard] ============================');
        throw new ForbiddenException("No tienes permisos suficientes");
      }
      
      console.log('[PermissionsGuard] Acceso permitido: el usuario tiene los permisos requeridos en la base de datos');
    } catch (error) {
      console.error('[PermissionsGuard] Error al verificar permisos en la base de datos:', error);
      throw error;
    }

    return true;
  }
}
