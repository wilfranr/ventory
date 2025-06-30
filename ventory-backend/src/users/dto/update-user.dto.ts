/**
 * DTO para actualizar la información de un usuario.
 */
import { IsOptional, IsEmail, IsEnum, IsIn } from "class-validator";
import { RoleName } from "@prisma/client"; // 👈 tu enum de Prisma

export class UpdateUserDto {
  @IsOptional()
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsEnum(RoleName)
  role?: RoleName;

  @IsOptional()
  @IsIn(["activo", "inactivo"])
  status?: string;
}
