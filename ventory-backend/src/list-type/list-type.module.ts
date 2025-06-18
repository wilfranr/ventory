import { Module } from '@nestjs/common';
import { ListTypeService } from './list-type.service';
import { ListTypeController } from './list-type.controller';

@Module({
  controllers: [ListTypeController],
  providers: [ListTypeService],
})
export class ListTypeModule {}
