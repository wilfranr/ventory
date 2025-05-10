import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { RegistrationTokenService } from "./registration-token.service";
import { CreateRegistrationTokenDto } from "./dto/create-registration-token.dto";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { CurrentUser } from "src/auth/curent-user.decorator";
import { User } from "@prisma/client";

@Controller("registration-token")
export class RegistrationTokenController {
  constructor(
    private readonly registrationTokenService: RegistrationTokenService,
  ) {}

  @UseGuards(JwtAuthGuard)
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
