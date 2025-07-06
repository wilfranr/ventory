/**
 * Servicio para generar y almacenar tokens de registro.
 */
import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service"; // Tu servicio Prisma
import { CreateRegistrationTokenDto } from "./dto/create-registration-token.dto";
import { randomBytes } from "crypto"; // Para generar el token

@Injectable()
export class RegistrationTokenService {
  constructor(private readonly prisma: PrismaService) {}
  /**
   * Crea y persiste un token de registro asociado a una empresa.
   */

  async create(
    createRegistrationTokenDto: CreateRegistrationTokenDto,
    companyId: string,
  ) {
    const token = this.generateRandomToken();

    return this.prisma.registrationToken.create({
      data: {
        token,
        role: createRegistrationTokenDto.roleId,
        companyId,
      },
    });
  }
  /**
   * Genera un token aleatorio de seis caracteres.
   */

  private generateRandomToken(): string {
    // 6 caracteres alfanuméricos aleatorios
    return randomBytes(3).toString("hex").toUpperCase();
  }
}
