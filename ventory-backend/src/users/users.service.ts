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
  async findAll(currentUser: AuthUser) {
    const VENTORY_COMPANY_ID = "cma05z0m90000c6juketn1hgr";
    if (
      currentUser.role?.name === "superadmin" ||
      currentUser.companyId === VENTORY_COMPANY_ID
    ) {
      return this.prisma.user.findMany({
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

    // Si es de otra empresa, solo ve usuarios de su empresa
    return this.prisma.user.findMany({
      where: { companyId: currentUser.companyId },
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
  async updateUser(id: number, data: UpdateUserDto) {
    const updateData: Prisma.UserUpdateInput = {
      name: data.name,
      email: data.email,
      status: data.status,
    };

    if (data.role) {
      const role = await this.prisma.role.findUnique({
        where: { name: data.role },
      });

      if (!role) {
        throw new BadRequestException("El rol proporcionado no existe.");
      }

      updateData.role = {
        connect: { id: role.id },
      };
    }

    return this.prisma.user.update({
      where: { id: Number(id) },
      data: updateData,
    });
  }

  /**
   * Guarda el refresh token hasheado para el usuario.
   */
  async updateRefreshToken(userId: number, refreshToken: string) {
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: hashedRefreshToken },
    });
  }
}
