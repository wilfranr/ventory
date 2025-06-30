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
export class ListItemController {
  constructor(private readonly listItemService: ListItemService) {}

  @Post()
  create(
    @Body() dto: CreateListItemDto,
    @CurrentUser() user: { companyId: string },
  ) {
    return this.listItemService.create(dto, user.companyId);
  }

  @Get()
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

    console.log("Filtro recibido:", {
      companyId: user.companyId,
      isActive,
      typeId,
    });
    return this.listItemService.findAll(user.companyId, isActive, typeId);
  }

  @Get("type/:listTypeId")
  fuindByType(@Param("listTypeId") listTypeId: number) {
    return this.listItemService.findByTypeId(listTypeId);
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.listItemService.findOne(+id);
  }

  @Patch(":id")
  update(
    @Param("id") id: string,
    @Body() updateListItemDto: UpdateListItemDto,
  ) {
    return this.listItemService.update(+id, updateListItemDto);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.listItemService.remove(+id);
  }
}
