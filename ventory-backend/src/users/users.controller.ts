import {
  Controller,
  Get,
  UseGuards,
  Put,
  Param,
  Body,
  Delete,
  Post,
} from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { PermissionsGuard } from "src/permissions/permissions.guard";
import { Permissions } from "src/permissions/permissions.decorator";
import { UsersService } from "./users.service";
import { UpdateUserDto } from "./dto/update-user.dto";
import { CreateUserDto } from "./dto/create-user.dto";
import { CurrentUser } from "src/auth/current-user.decorator";

@Controller("users")
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Permissions("ver_usuarios")
  @Get()
  async findAll(@CurrentUser() user: any) {
    return this.usersService.findAll(user);
  }

  @Permissions("editar_usuario")
  @Put(":id")
  update(@Param("id") id: number, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.updateUser(id, updateUserDto);
  }

  @Permissions("ver_usuarios") // o un permiso especial si quieres que sea solo para admins
  @Get("admin-only")
  adminAccess(@CurrentUser() user: any) {
    return {
      message: "Ruta protegida para admin y superadmin",
      user,
    };
  }
}
