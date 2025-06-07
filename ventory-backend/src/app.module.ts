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
import { APP_GUARD } from "@nestjs/core";
import { PermissionsGuard } from "./permissions/permissions.guard";
import { JwtAuthGuard } from "./auth/jwt-auth.guard";

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
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: PermissionsGuard,
    },
  ],
})
export class AppModule {}
