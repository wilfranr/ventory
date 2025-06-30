/**
 * Controlador para emitir tokens de registro de usuarios.
 */
import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { RegistrationTokenService } from "./registration-token.service";
import { CreateRegistrationTokenDto } from "./dto/create-registration-token.dto";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { CurrentUser } from "src/auth/current-user.decorator";
import { User } from "@prisma/client";

@Controller("registration-token")
  /**
   * Permite crear tokens de invitación para nuevos usuarios.
   */
export class RegistrationTokenController {
  constructor(
    private readonly registrationTokenService: RegistrationTokenService,
  ) {}

  @UseGuards(JwtAuthGuard)
  /**
   * Genera un token para registrar empleados en la compañía.
   */
  @Post()
  create(
    @Body() createRegistrationTokenDto: CreateRegistrationTokenDto,
    @CurrentUser() user: User,
  ) {
    return this.registrationTokenService.create(
      createRegistrationTokenDto,
      user.companyId,
    );
  }
}
