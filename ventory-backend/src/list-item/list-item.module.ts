import { Module } from '@nestjs/common';
import { ListItemService } from './list-item.service';
import { ListItemController } from './list-item.controller';

/**
 * Módulo que agrupa y expone los componentes necesarios
 * para la administración de los elementos de las listas.
 */

@Module({
  controllers: [ListItemController],
  providers: [ListItemService],
})

/**
 * Clase que define el módulo de elementos de lista.
 */
export class ListItemModule {}
