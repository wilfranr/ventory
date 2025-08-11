/**
 * Servicio que maneja la lógica relacionada con usuarios.
 */
import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { Prisma } from "@prisma/client";
import { AuthUser } from "./interfaces/auth-user.interface";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import * as bcrypt from "bcrypt";
import { BadRequestException } from "@nestjs/common";

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  /**
   * Crea un nuevo usuario para la compañía indicada.
   */
  async create(createUserDto: CreateUserDto, companyId: string) {
    const { name, email, password } = createUserDto;

    const hashedPassword = await bcrypt.hash(password, 10);

    return this.prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        companyId,
      },
    });
  }

  /**
   * Busca un usuario por su correo electrónico.
   */
  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      include: {
        role: {
          include: {
            permissions: true,
          },
        },
        company: {
          select: {
            id: true,
            name: true,
            logo: true,
          },
        },
      },
    });
  }

  /**
   * Obtiene usuarios visibles dependiendo de la empresa y rol.
   */
  async findAll(companyId: string) {
    if (!companyId) {
      // Si no hay companyId (ej. superadmin sin seleccionar empresa), no devolver nada.
      return [];
    }

    return this.prisma.user.findMany({
      where: { companyId: companyId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  /**
   * Actualiza la información de un usuario existente.
   */
  async updateUser(id: string, data: UpdateUserDto) {
    const updateData: Prisma.UserUpdateInput = {
      name: data.name,
      email: data.email,
      status: data.status,
    };

    if (data.role) {
      const role = await this.prisma.role.findUnique({
        where: { id: data.role }, // Buscar por ID
      });

      if (!role) {
        throw new BadRequestException("El rol proporcionado no existe.");
      }

      updateData.role = {
        connect: { id: role.id },
      };
    }

    return this.prisma.user.update({
      where: { id: id }, // Usar el ID directamente
      data: updateData,
    });
  }

  /**
   * Guarda el refresh token hasheado para el usuario.
   */
  async updateRefreshToken(userId: string, refreshToken: string) {
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: hashedRefreshToken },
    });
  }
}
