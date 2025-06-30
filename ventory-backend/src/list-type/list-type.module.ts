/**
 * Módulo que agrupa el controlador y servicio de tipos de lista.
 */
import { Module } from '@nestjs/common';
import { ListTypeService } from './list-type.service';
import { ListTypeController } from './list-type.controller';

@Module({
  controllers: [ListTypeController],
  providers: [ListTypeService],
})
/**
 * Define el módulo para el mantenimiento de tipos de lista.
 */
export class ListTypeModule {}
