import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from "@nestjs/common";
import { ListTypeService } from "./list-type.service";
import { CreateListTypeDto } from "./dto/create-list-type.dto";
import { UpdateListTypeDto } from "./dto/update-list-type.dto";
import { Public } from "src/auth/public.decorator";
import { CurrentUser } from "src/auth/current-user.decorator";

@Controller("list-type")
@Public()
export class ListTypeController {
  constructor(private readonly listTypeService: ListTypeService) {}

  @Post()
  create(@Body() dto: CreateListTypeDto, @CurrentUser() user: any) {
    return this.listTypeService.create(dto, user.companyId);
  }

  @Get()
  findAll() {
    return this.listTypeService.findAll();
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.listTypeService.findOne(+id);
  }

  @Patch(":id")
  update(
    @Param("id") id: string,
    @Body() updateListTypeDto: UpdateListTypeDto,
  ) {
    return this.listTypeService.update(+id, updateListTypeDto);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.listTypeService.remove(+id);
  }
}
