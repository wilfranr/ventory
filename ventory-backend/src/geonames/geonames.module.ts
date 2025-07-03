import { Module } from '@nestjs/common';
import { GeonamesService } from './geonames.service';
import { GeonamesController } from './geonames.controller';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [HttpModule, ConfigModule],
  providers: [GeonamesService],
  controllers: [GeonamesController],
  exports: [GeonamesService]
})
export class GeonamesModule {}