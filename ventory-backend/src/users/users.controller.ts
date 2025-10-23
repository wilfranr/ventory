/**
 * Controlador para la administración de usuarios.
 */
import { Controller, Get, Put, Param, Body } from "@nestjs/common";
import { Permissions } from "src/permissions/permissions.decorator";
import { UsersService } from "./users.service";
import { UpdateUserDto } from "./dto/update-user.dto";
import { CurrentUser } from "src/auth/current-user.decorator";
import { AuthUser } from "./interfaces/auth-user.interface";
import { ApiTags, ApiBearerAuth, ApiOperation } from "@nestjs/swagger";
import { ActiveCompanyId } from "src/common/decorators/active-company-id.decorator";
import { ActiveCompany } from "../common/decorators/active-company.decorator";
import { CompanyAccessGuard } from "../common/guards/company-access.guard";
import { UseGuards } from "@nestjs/common";

@ApiTags("Usuarios")
@ApiBearerAuth()
@UseGuards(CompanyAccessGuard)
@Controller("users")
  /**
   * Endpoints relacionados con los usuarios.
   */
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({ summary: "Obtener todos los usuarios" })
  @Permissions("ver_usuarios")
  /**
   * Obtiene la lista de usuarios visibles para el solicitante.
   */
  @Get()
  async findAll(@ActiveCompanyId() companyId: string) {
    console.log('[UsersController] findAll - companyId:', companyId);
    try {
      const users = await this.usersService.findAll(companyId);
      console.log('[UsersController] Usuarios encontrados:', users.length);
      return users;
    } catch (error) {
      console.error('[UsersController] Error en findAll:', error);
      throw error;
    }
  }

  @Permissions("editar_usuario")
  /**
   * Actualiza los datos de un usuario.
   */
  @Put(":id")
  update(
    @Param("id") id: string, 
    @Body() updateUserDto: UpdateUserDto,
    @ActiveCompany() companyId: string,
  ) {
    return this.usersService.updateUser(id, updateUserDto, companyId);
  }

  @Permissions("ver_usuarios") // o un permiso especial si quieres que sea solo para admins
  /**
   * Ruta de prueba solo accesible por administradores.
   */
  @Get("admin-only")
  adminAccess(@CurrentUser() user: AuthUser) {
    return {
      message: "Ruta protegida para admin y superadmin",
      user,
    };
  }
}
