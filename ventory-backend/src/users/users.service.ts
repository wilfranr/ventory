/**
 * Servicio que maneja la lógica relacionada con usuarios.
 */
import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { Prisma } from "@prisma/client";
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
    console.log(`[UsersService] Buscando usuario por email: ${email}`);
    
    type UserWithRoleAndPermissions = Prisma.UserGetPayload<{
      include: {
        role: {
          include: {
            permissions: true;
          };
        };
        company: {
          select: {
            id: true;
            name: true;
            logo: true;
          };
        };
      };
    }>;

    try {
      const user = await this.prisma.user.findUnique({
        where: { email },
        include: {
          role: {
            include: {
              permissions: true
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
      }) as unknown as UserWithRoleAndPermissions | null;

      if (!user) {
        console.warn(`[UsersService] No se encontró usuario con email: ${email}`);
        return null;
      }

      console.log(`[UsersService] Usuario encontrado: ${user.email}`);
      
      if (user.role) {
        console.log(`[UsersService] Rol del usuario: ${user.role.name}`);
        const permissions = user.role.permissions?.map(p => p.name) || [];
        console.log(`[UsersService] Permisos del rol:`, permissions.length > 0 ? permissions.join(', ') : 'Ninguno');
      } else {
        console.warn('[UsersService] El usuario no tiene un rol asignado');
      }

      return user;
    } catch (error) {
      console.error('[UsersService] Error al buscar usuario por email:', error);
      throw error;
    }
  }

  /**
   * Obtiene usuarios visibles dependiendo de la empresa y rol.
   */
  async findAll(companyId: string) {
    console.log('[UsersService] findAll - companyId:', companyId);
    
    if (!companyId) {
      console.warn('[UsersService] No se proporcionó companyId. No se devolverán usuarios.');
      return [];
    }

    try {
      const users = await this.prisma.user.findMany({
        where: { 
          companyId: companyId
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          status: true,
          companyId: true // Incluir para depuración
        },
        orderBy: {
          createdAt: "desc",
        },
      });
      
      console.log(`[UsersService] Se encontraron ${users.length} usuarios para la empresa ${companyId}`);
      if (users.length > 0) {
        console.log('[UsersService] Primer usuario como muestra:', {
          id: users[0].id,
          name: users[0].name,
          companyId: users[0].companyId
        });
      }
      
      return users;
    } catch (error) {
      console.error('[UsersService] Error al buscar usuarios:', error);
      throw error;
    }
  }

  /**
   * Actualiza la información de un usuario existente.
   * Valida que el usuario pertenezca a la empresa del usuario autenticado.
   */
  async updateUser(id: string, data: UpdateUserDto, companyId: string) {
    // Verificar que el usuario pertenece a la empresa
    const user = await this.prisma.user.findFirst({
      where: { id, companyId },
    });

    if (!user) {
      throw new BadRequestException("Usuario no encontrado o no pertenece a tu empresa.");
    }

    const updateData: Prisma.UserUpdateInput = {
      name: data.name,
      email: data.email,
      status: data.status,
    };

    if (data.role) {
      const role = await this.prisma.role.findFirst({
        where: { 
          id: data.role,
          companyId // ✅ Verificar que el rol pertenece a la misma empresa
        },
      });

      if (!role) {
        throw new BadRequestException("El rol proporcionado no existe o no pertenece a tu empresa.");
      }

      updateData.role = {
        connect: { id: role.id },
      };
    }

    return this.prisma.user.update({
      where: { id: id },
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
