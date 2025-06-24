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
import { ListItemService } from "./list-item.service";
import { CreateListItemDto } from "./dto/create-list-item.dto";
import { UpdateListItemDto } from "./dto/update-list-item.dto";
import { Public } from "src/auth/public.decorator";
import { CurrentUser } from "src/auth/current-user.decorator";
import { AuthGuard } from "@nestjs/passport";

@UseGuards(AuthGuard("jwt"))
@Controller("list-items")
export class ListItemController {
  constructor(private readonly listItemService: ListItemService) {}

  @Post()
  create(@Body() dto: CreateListItemDto, @CurrentUser() user: any) {
    return this.listItemService.create(dto, user.companyId);
  }

  @Get()
  findAll(@CurrentUser() user: any) {
    return this.listItemService.findAll(user.companyId);
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
