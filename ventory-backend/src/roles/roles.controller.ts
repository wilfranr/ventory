import { Controller, Get, Post, Param, Body, Patch } from "@nestjs/common";
import { RolesService } from "./roles.service";
import { RoleName } from "@prisma/client";

@Controller("roles")
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  getRoles() {
    return this.rolesService.getAllRoles();
  }

  @Post()
  createRole(@Body("name") name: RoleName) {
    return this.rolesService.createRole(name);
  }

  @Post(":userId/assign/:roleId")
  assignRole(@Param("userId") userId: string, @Param("roleId") roleId: string) {
    return this.rolesService.assignRoleToUser(userId, roleId);
  }

  @Patch(":roleId/permissions")
  updatePermissions(
    @Param("roleId") roleId: string,
    @Body("permisssionIds") permisssionIds: string[],
  ) {
    return this.rolesService.assignPermissionsToRole(roleId, permisssionIds);
  }
}
