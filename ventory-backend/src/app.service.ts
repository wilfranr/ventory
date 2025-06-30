/**
 * Servicio de utilidad utilizado para operaciones generales.
 */
import { Injectable } from "@nestjs/common";

@Injectable()
export class AppService {
  /**
   * Devuelve un saludo predeterminado.
   */
  getHello(): string {
    return "Ventory App!";
  }
}
