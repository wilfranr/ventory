/**
 * Controlador para operaciones sobre elementos de listas.
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
  Query,
} from "@nestjs/common";
import { ListItemService } from "./list-item.service";
import { CreateListItemDto } from "./dto/create-list-item.dto";
import { UpdateListItemDto } from "./dto/update-list-item.dto";
import { CurrentUser } from "src/auth/current-user.decorator";
import { AuthGuard } from "@nestjs/passport";

@UseGuards(AuthGuard("jwt"))
@Controller("list-items")
/**
 * Controlador encargado de exponer las rutas HTTP relacionadas
 * con la gestión de los elementos de las listas.
 */
export class ListItemController {
  constructor(private readonly listItemService: ListItemService) {}

  @Post()
  /**
   * Crea un nuevo elemento de lista asociado a la compañía
   * del usuario autenticado.
   */
  create(
    @Body() dto: CreateListItemDto,
    @CurrentUser() user: { companyId: string },
  ) {
    return this.listItemService.create(dto, user.companyId);
  }

  @Get()
  /**
   * Obtiene todos los elementos de una compañía con la
   * posibilidad de filtrar por estado y tipo de lista.
   */
  findAll(
    @CurrentUser() user: { companyId: string },
    @Query("active") active?: string,
    @Query("listTypeId") listTypeId?: string,
  ) {
    let isActive: boolean | undefined;
    if (active === "true") isActive = true;
    else if (active === "false") isActive = false;
    // Si no viene el param, deja undefined y el servicio trae todo

    const typeId = listTypeId ? Number(listTypeId) : undefined;

    return this.listItemService.findAll(user.companyId, isActive, typeId);
  }

  @Get("type/:listTypeId")
  /**
   * Devuelve los elementos activos pertenecientes a un tipo de lista.
   */
  fuindByType(@Param("listTypeId") listTypeId: number) {
    return this.listItemService.findByTypeId(listTypeId);
  }

  @Get(":id")
  /**
   * Busca un elemento concreto por su identificador.
   */
  findOne(@Param("id") id: string) {
    return this.listItemService.findOne(+id);
  }

  @Patch(":id")
  /**
   * Actualiza un elemento de lista a partir de su identificador.
   */
  update(
    @Param("id") id: string,
    @Body() updateListItemDto: UpdateListItemDto,
  ) {
    return this.listItemService.update(+id, updateListItemDto);
  }

  @Delete(":id")
  /**
   * Marca un elemento de lista como inactivo en lugar de eliminarlo
   * definitivamente de la base de datos.
   */
  remove(@Param("id") id: string) {
    return this.listItemService.remove(+id);
  }

  @Patch(":id/restore")
  /**
   * Restaura un elemento de lista previamente eliminado.
   */
  restore(@Param("id") id: string) {
    return this.listItemService.restore(+id);
  }
}
