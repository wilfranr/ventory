import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { Prisma, RoleName } from "@prisma/client";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import * as bcrypt from "bcrypt";
import { BadRequestException } from "@nestjs/common";

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

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

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async findAll() {
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
}
