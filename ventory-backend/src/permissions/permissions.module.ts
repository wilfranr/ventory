/**
 * Módulo encargado de los permisos de la aplicación.
 */
import { Module } from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { PermissionsController } from './permissions.controller';

@Module({
  providers: [PermissionsService],
  controllers: [PermissionsController]
})
/**
 * Define el módulo que expone servicios y controladores de permisos.
 */
export class PermissionsModule {}
