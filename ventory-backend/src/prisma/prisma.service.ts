/**
 * Servicio que extiende PrismaClient para manejar la conexión a la base de datos.
 */
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient
  implements OnModuleInit, OnModuleDestroy {

  /**
   * Se ejecuta al iniciar el módulo y abre la conexión.
   */
  async onModuleInit() {
    await this.$connect();
  }

  /**
   * Cierra la conexión al finalizar el módulo.
   */
  async onModuleDestroy() {
    await this.$disconnect();
  }
}
