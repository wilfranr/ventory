/**
 * Controlador de roles de usuario.
 */
import { Controller, Get, Post, Param, Body, Patch } from "@nestjs/common";
import { RolesService } from "./roles.service";
import { RoleName } from "@prisma/client";

@Controller("roles")
  /**
   * Endpoints para administración de roles.
   */
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  /**
   * Lista todos los roles disponibles.
   */
  @Get()
  getRoles() {
    return this.rolesService.getAllRoles();
  }

  /**
   * Crea un nuevo rol.
   */
  @Post()
  createRole(@Body("name") name: RoleName) {
    return this.rolesService.createRole(name);
  }

  /**
   * Obtiene un rol por su identificador.
   */
  @Get(":id")
  getRoleById(@Param("id") id: string) {
    return this.rolesService.getRoleById(id);
  }

  /**
   * Asigna un rol existente a un usuario.
   */
  @Post(":userId/assign/:roleId")
  assignRole(@Param("userId") userId: string, @Param("roleId") roleId: string) {
    return this.rolesService.assignRoleToUser(userId, roleId);
  }

  /**
   * Asigna permisos a un rol existente.
   */
  @Patch(":roleId/permissions")
  updatePermissions(
    @Param("roleId") roleId: string,
    @Body("permissionIds") permissionIds: string[],
  ) {
    return this.rolesService.assignPermissionsToRole(roleId, permissionIds);
  }
}
