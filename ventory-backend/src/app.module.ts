import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { AuthModule } from "./auth/auth.module";
import { UsersModule } from "./users/users.module";
import { PrismaModule } from "./prisma/prisma.module";
import { RegistrationTokenModule } from "./registration-token/registration-token.module";
import { RolesController } from "./roles/roles.controller";
import { RolesModule } from "./roles/roles.module";
import { PermissionsModule } from "./permissions/permissions.module";

@Module({
  imports: [
    AuthModule,
    RolesModule,
    UsersModule,
    PrismaModule,
    RegistrationTokenModule,
    PermissionsModule,
  ],
  controllers: [AppController, RolesController],
  providers: [AppService],
})
export class AppModule {}
