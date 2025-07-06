/**
 * DTO para actualizar la información de un usuario.
 */
import { IsOptional, IsEmail, IsIn } from "class-validator";

export class UpdateUserDto {
  @IsOptional()
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  role?: string;

  @IsOptional()
  @IsIn(["activo", "inactivo"])
  status?: string;
}
