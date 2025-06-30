/**
 * Módulo para la administración de roles.
 */
import { Module } from "@nestjs/common";
import { RolesService } from "./roles.service";
import { RolesController } from "./roles.controller";
import { PrismaService } from "../prisma/prisma.service";

@Module({
  controllers: [RolesController],
  providers: [RolesService, PrismaService],
  exports: [RolesService],
})
/**
 * Define el módulo que gestiona roles y sus dependencias.
 */
export class RolesModule {}
