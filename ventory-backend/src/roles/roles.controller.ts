/**
 * Controlador de roles de usuario.
 */
import { Controller, Get, Post, Param, Body, Patch, Delete, UseGuards } from "@nestjs/common";
import { RolesService } from "./roles.service";
import { Roles } from "src/auth/roles.decorator";
import { RolesGuard } from "src/auth/roles.guard";

@Controller("roles")
  /**
   * Endpoints para administración de roles.
   */
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  /**
   * Lista todos los roles disponibles.
   */
  @UseGuards(RolesGuard)
  @Roles("admin", "superadmin", "propietario")
  @Get()
  getRoles() {
    return this.rolesService.getAllRoles();
  }

  /**
   * Crea un nuevo rol.
   */
  @UseGuards(RolesGuard)
  @Roles("admin", "superadmin", "propietario")
  @Post()
  createRole(@Body("name") name: string) {
    return this.rolesService.createRole(name);
  }

  /**
   * Obtiene un rol por su identificador.
   */
  @UseGuards(RolesGuard)
  @Roles("admin", "superadmin", "propietario")
  @Get(":id")
  getRoleById(@Param("id") id: string) {
    return this.rolesService.getRoleById(id);
  }

  /**
   * Asigna un rol existente a un usuario.
   */
  @UseGuards(RolesGuard)
  @Roles("admin", "superadmin", "propietario")
  @Post(":userId/assign/:roleId")
  assignRole(@Param("userId") userId: string, @Param("roleId") roleId: string) {
    return this.rolesService.assignRoleToUser(userId, roleId);
  }

  /**
   * Asigna permisos a un rol existente.
   */
  @UseGuards(RolesGuard)
  @Roles("admin", "superadmin", "propietario")
  @Patch(":roleId/permissions")
  updatePermissions(
    @Param("roleId") roleId: string,
    @Body("permissionIds") permissionIds: string[],
  ) {
    return this.rolesService.assignPermissionsToRole(roleId, permissionIds);
  }

  /**
   * Elimina un rol por su identificador.
   */
  @UseGuards(RolesGuard)
  @Roles("admin", "superadmin", "propietario")
  @Delete(":id")
  deleteRole(@Param("id") id: string) {
    return this.rolesService.deleteRole(id);
  }
}
