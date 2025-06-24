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
export class ListTypeController {
  constructor(private readonly listTypeService: ListTypeService) {}

  @Post()
  create(@Body() dto: CreateListTypeDto, @CurrentUser() user: any) {
    return this.listTypeService.create(dto, user.companyId);
  }

  @Get()
  findAll(@CurrentUser() user: any) {
    return this.listTypeService.findAll(user.companyId);
  }

  @Get(":id")
  findOne(@Param("id") id: string, @CurrentUser() user: any) {
    return this.listTypeService.findOne(+id, user.companyId);
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
