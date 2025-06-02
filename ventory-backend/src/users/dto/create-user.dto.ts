import { IsEmail, IsNotEmpty, MinLength, IsOptional } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateUserDto {
  @ApiProperty({
    example: "Juan Pérez",
    description: "Nombre completo del usuario",
  })
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: "juan.perez@email.com",
    description: "Correo electrónico del usuario",
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: "123456",
    minLength: 6,
    description: "Contraseña de mínimo 6 caracteres",
  })
  @MinLength(6)
  password: string;

  // 🏢 Solo cuando se crea empresa (flujo 1)
  @ApiPropertyOptional({
    example: "Mi Empresa S.A.S.",
    description: "Razón social de la empresa (solo para registro de empresa)",
  })
  @IsOptional()
  companyName?: string;

  @ApiPropertyOptional({
    example: "900123456-7",
    description: "NIT de la empresa (solo para registro de empresa)",
  })
  @IsOptional()
  nit?: string;

  @ApiPropertyOptional({
    example: "Calle 100 #10-20, Bogotá",
    description: "Dirección de la empresa (solo para registro de empresa)",
  })
  @IsOptional()
  address?: string;

  @ApiPropertyOptional({
    example: "3001234567",
    description: "Teléfonos de la empresa (solo para registro de empresa)",
  })
  @IsOptional()
  phones?: string;

  @ApiPropertyOptional({
    example: "empresa@email.com",
    description: "Email de la empresa (solo para registro de empresa)",
  })
  @IsOptional()
  companyEmail?: string;

  @ApiPropertyOptional({
    example: "https://miempresa.com",
    description: "Sitio web de la empresa (solo para registro de empresa)",
  })
  @IsOptional()
  website?: string;

  // 🔐 Solo cuando se usa token (flujo 2)
  @ApiPropertyOptional({
    example: "ABC123",
    description: "Token de invitación (solo para registro por token)",
  })
  @IsOptional()
  token?: string;
}
