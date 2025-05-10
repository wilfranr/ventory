/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-call */

import { IsEmail, IsNotEmpty, MinLength, IsOptional } from "class-validator";

export class CreateUserDto {
  @IsNotEmpty()
  name: string;

  @IsEmail()
  email: string;

  @MinLength(6)
  password: string;

  // 🏢 Solo cuando se crea empresa (flujo 1)
  @IsOptional()
  companyName?: string;

  @IsOptional()
  nit?: string;

  @IsOptional()
  address?: string;

  @IsOptional()
  phones?: string;

  @IsOptional()
  companyEmail?: string;

  @IsOptional()
  website?: string;

  // 🔐 Solo cuando se usa token (flujo 2)
  @IsOptional()
  token?: string;
}

