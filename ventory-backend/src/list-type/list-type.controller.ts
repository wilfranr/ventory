/**
 * Controlador para la gestión de tipos de listas.
 */
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from "@nestjs/common";
import { ListTypeService } from "./list-type.service";
import { CreateListTypeDto } from "./dto/create-list-type.dto";
import { UpdateListTypeDto } from "./dto/update-list-type.dto";
import { CurrentUser } from "src/auth/current-user.decorator";
import { AuthGuard } from "@nestjs/passport";

@UseGuards(AuthGuard("jwt"))
@Controller("list-type")
  /**
   * Controlador con las operaciones CRUD de tipos de lista.
   */
export class ListTypeController {
  constructor(private readonly listTypeService: ListTypeService) {}

  /**
   * Crea un tipo de lista para la compañía actual.
   */
  @Post()
  create(@Body() dto: CreateListTypeDto, @CurrentUser() user: any) {
    return this.listTypeService.create(dto, user.companyId);
  }

  /**
   * Obtiene todos los tipos de lista de la compañía.
   */
  @Get()
  findAll(@CurrentUser() user: any) {
    return this.listTypeService.findAll(user.companyId);
  }

  /**
   * Devuelve un tipo de lista específico.
   */
  @Get(":id")
  findOne(@Param("id") id: string, @CurrentUser() user: any) {
    return this.listTypeService.findOne(+id, user.companyId);
  }

  /**
   * Actualiza un tipo de lista existente.
   */
  @Patch(":id")
  update(
    @Param("id") id: string,
    @Body() updateListTypeDto: UpdateListTypeDto,
  ) {
    return this.listTypeService.update(+id, updateListTypeDto);
  }

  /**
   * Elimina un tipo de lista.
   */
  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.listTypeService.remove(+id);
  }
}
