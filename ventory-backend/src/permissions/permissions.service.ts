/**
 * Servicio para manipular los permisos almacenados.
 */
import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { Permission } from "@prisma/client";

@Injectable()
export class PermissionsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Obtiene todos los permisos.
   */
  async getAll(): Promise<Permission[]> {
    return this.prisma.permission.findMany();
  }

  /**
   * Busca un permiso por su identificador.
   */
  async getById(id: string): Promise<Permission> {
    const permission = await this.prisma.permission.findUnique({
      where: { id },
    });

    if (!permission) {
      throw new NotFoundException("Permiso no encontrado");
    }
    return permission;
  }

  /**
   * Crea un nuevo permiso con el nombre indicado.
   */
  async create(name: string): Promise<Permission> {
    return this.prisma.permission.create({
      data: { name },
    });
  }
}
