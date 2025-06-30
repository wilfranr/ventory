/**
 * Módulo dedicado a las operaciones sobre usuarios.
 */
import { Module } from "@nestjs/common";
import { UsersController } from "./users.controller";
import { UsersService } from "./users.service";
import { PrismaModule } from "../prisma/prisma.module";

@Module({
  imports: [PrismaModule],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
/**
 * Provee el servicio de usuarios para otros módulos.
 */
export class UsersModule {}
