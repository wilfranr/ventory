/**
 * Módulo para manejo de tokens de registro.
 */
import { Module } from "@nestjs/common";
import { RegistrationTokenService } from "./registration-token.service";
import { RegistrationTokenController } from "./registration-token.controller";
import { PrismaModule } from "../prisma/prisma.module";

@Module({
  imports: [PrismaModule],
  controllers: [RegistrationTokenController],
  providers: [RegistrationTokenService],
})
/**
 * Define el módulo de tokens de registro.
 */
export class RegistrationTokenModule {}
