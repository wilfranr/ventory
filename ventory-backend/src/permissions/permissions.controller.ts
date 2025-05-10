import { Controller, Get, Post, Body, Param } from "@nestjs/common";
import { PermissionsService } from "./permissions.service";

@Controller("permissions")
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Get()
  getAll() {
    return this.permissionsService.getAll();
  }

  @Get(":id")
  getById(@Param("id") id: string) {
    return this.permissionsService.getById(id);
  }

  @Post()
  create(@Body("name") name: string) {
    return this.permissionsService.create(name);
  }
}
