/**
 * Servicio de gestión de roles y asignación de permisos.
 */
import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { Role, RoleName } from "@prisma/client";

@Injectable()
export class RolesService {
  constructor(private prisma: PrismaService) {}

  /**
   * Devuelve todos los roles con sus permisos.
   */
  async getAllRoles(): Promise<Role[]> {
    return this.prisma.role.findMany({
      include: { permissions: true },
    });
  }

  /**
   * Obtiene un rol y sus permisos por ID.
   */
  async getRoleById(id: string) {
    return this.prisma.role.findUnique({
      where: { id },
      include: {
        permissions: true, // Incluye los permisos si lo necesitas
      },
    });
  }

  /**
   * Crea un rol con el nombre especificado.
   */
  async createRole(name: RoleName): Promise<Role> {
    return this.prisma.role.create({
      data: { name },
    });
  }

  /**
   * Asocia un rol a un usuario existente.
   */
  async assignRoleToUser(userId: string, roleId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: parseInt(userId) },
    });
    if (!user) throw new NotFoundException("Usuario no encontrado");

    return this.prisma.user.update({
      where: { id: parseInt(userId) },
      data: { roleId },
    });
  }

  /**
   * Asigna un conjunto de permisos a un rol.
   */
  async assignPermissionsToRole(roleId: string, permissionId: string[]) {
    return this.prisma.role.update({
      where: { id: roleId },
      data: {
        permissions: {
          set: permissionId.map((id) => ({ id })),
        },
      },
      include: {
        permissions: true,
      },
    });
  }
}
