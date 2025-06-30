/**
 * Controlador principal de la aplicación encargado de exponer
 * rutas de comprobación básicas.
 */
import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  /**
   * Retorna un mensaje de saludo para comprobar que la API esta activa.
   */
  getHello(): string {
    return this.appService.getHello();
  }
}
