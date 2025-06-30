/**
 * Módulo global que provee el cliente de Prisma.
 */
import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
/**
 * Expone el servicio de Prisma para inyección de dependencias.
 */
export class PrismaModule {}
