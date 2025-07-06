import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { Role } from "@prisma/client";

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
  async createRole(name: string): Promise<Role> {
    const existingRole = await this.prisma.role.findUnique({ where: { name } });
    if (existingRole) {
      throw new BadRequestException(`El rol '${name}' ya existe.`);
    }
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
  async assignPermissionsToRole(roleId: string, permissionIds: string[]) {
    // Verificar que el rol exista
    const role = await this.prisma.role.findUnique({ where: { id: roleId } });
    if (!role) {
      throw new NotFoundException(`Rol con ID ${roleId} no encontrado.`);
    }

    // Verificar que todos los permisos existan
    const existingPermissions = await this.prisma.permission.findMany({
      where: { id: { in: permissionIds } },
    });

    if (existingPermissions.length !== permissionIds.length) {
      throw new BadRequestException("Algunos IDs de permisos no son válidos.");
    }

    return this.prisma.role.update({
      where: { id: roleId },
      data: {
        permissions: {
          set: permissionIds.map((id) => ({ id })),
        },
      },
      include: {
        permissions: true,
      },
    });
  }

  /**
   * Elimina un rol por su identificador.
   */
  async deleteRole(id: string) {
    // Verificar si el rol existe
    const role = await this.prisma.role.findUnique({ where: { id } });
    if (!role) {
      throw new NotFoundException(`Rol con ID ${id} no encontrado.`);
    }

    // Verificar si hay usuarios asignados a este rol
    const usersWithRole = await this.prisma.user.count({
      where: { roleId: id },
    });

    if (usersWithRole > 0) {
      throw new BadRequestException(
        `No se puede eliminar el rol '${role.name}' porque tiene ${usersWithRole} usuarios asignados.`,
      );
    }

    return this.prisma.role.delete({
      where: { id },
    });
  }
}
