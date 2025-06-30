/**
 * Controlador para administrar los permisos del sistema.
 */
import { Controller, Get, Post, Body, Param } from "@nestjs/common";
import { PermissionsService } from "./permissions.service";

@Controller("permissions")
  /**
   * Endpoints CRUD para permisos.
   */
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  /**
   * Devuelve todos los permisos registrados.
   */
  @Get()
  getAll() {
    return this.permissionsService.getAll();
  }

  /**
   * Obtiene un permiso por su identificador.
   */
  @Get(":id")
  getById(@Param("id") id: string) {
    return this.permissionsService.getById(id);
  }

  /**
   * Crea un nuevo permiso en el sistema.
   */
  @Post()
  create(@Body("name") name: string) {
    return this.permissionsService.create(name);
  }
}
