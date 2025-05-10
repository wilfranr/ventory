import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { Role, RoleName } from "@prisma/client";

@Injectable()
export class RolesService {
  constructor(private prisma: PrismaService) {}

  async getAllRoles(): Promise<Role[]> {
    return this.prisma.role.findMany({
      include: { permissions: true },
    });
  }

  async createRole(name: RoleName): Promise<Role> {
    return this.prisma.role.create({
      data: { name },
    });
  }

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
//**
// This code defines a RolesService class that interacts with a Prisma database to manage user roles and permissions.
