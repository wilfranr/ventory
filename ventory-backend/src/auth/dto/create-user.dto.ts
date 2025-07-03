/**
 * DTO para la creación de usuarios.
 */
import { IsEmail, IsOptional, IsString, MinLength } from "class-validator";

export class CreateUserDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @MinLength(6)
  password: string;

  //Campos para creación de empresa
  @IsOptional()
  @IsString()
  companyName: string;

  @IsOptional()
  @IsString()
  nit: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  phones?: string;

  @IsOptional()
  @IsString()
  companyEmail?: string;

  @IsOptional()
  @IsString()
  website?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  department?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  logo?: any;

  //Token, alternativa al tener la empresa creada
  @IsOptional()
  @IsString()
  token?: string;
}
