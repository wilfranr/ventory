import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { Permission } from "@prisma/client";

@Injectable()
export class PermissionsService {
  constructor(private prisma: PrismaService) {}

  async getAll(): Promise<Permission[]> {
    return this.prisma.permission.findMany();
  }

  async getById(id: string): Promise<Permission> {
    const permission = await this.prisma.permission.findUnique({
      where: { id },
    });

    if (!permission) {
      throw new NotFoundException("Permiso no encontrado");
    }
    return permission;
  }

  async create(name: string): Promise<Permission> {
    return this.prisma.permission.create({
      data: { name },
    });
  }
}
