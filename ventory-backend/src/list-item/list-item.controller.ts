import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from "@nestjs/common";
import { ListItemService } from "./list-item.service";
import { CreateListItemDto } from "./dto/create-list-item.dto";
import { UpdateListItemDto } from "./dto/update-list-item.dto";
import { Public } from "src/auth/public.decorator";

@Controller("list-item")
@Public()
export class ListItemController {
  constructor(private readonly listItemService: ListItemService) {}

  @Post()
  create(@Body() createListItemDto: CreateListItemDto) {
    return this.listItemService.create(createListItemDto);
  }

  @Get()
  findAll() {
    return this.listItemService.findAll();
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
