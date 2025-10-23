import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseUUIDPipe,
} from "@nestjs/common";
import { AssetsService } from "./assets.service";
import { CreateAssetDto } from "./dto/create-asset.dto";
import { UpdateAssetDto } from "./dto/update-asset.dto";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard } from "../auth/roles.guard";
import { FeatureGuard } from "../auth/guards/feature.guard";
import { User } from "../auth/user.decorator"; // Asumiendo que tienes un decorador para obtener el usuario

@Controller("assets")
@UseGuards(JwtAuthGuard, RolesGuard, FeatureGuard) // <-- ¡Protección a nivel de controlador!
export class AssetsController {
  constructor(private readonly assetsService: AssetsService) {}

  // --- ENDPOINT PARA CREAR UN ACTIVO ---
  // POST /assets
  @Post()
  create(
    @Body() createAssetDto: CreateAssetDto,
    @User("companyId") companyId: string,
  ) {
    return this.assetsService.create(createAssetDto, companyId);
  }

  // --- ENDPOINT PARA OBTENER TODOS LOS ACTIVOS ---
  // GET /assets
  @Get()
  findAll(@User("companyId") companyId: string) {
    return this.assetsService.findAll(companyId);
  }

  // --- ENDPOINT PARA OBTENER UN ACTIVO POR SU ID ---
  // GET /assets/:id
  @Get(":id")
  findOne(
    @Param("id", ParseUUIDPipe) id: string,
    @User("companyId") companyId: string,
  ) {
    return this.assetsService.findOne(id, companyId);
  }

  // --- ENDPOINT PARA ACTUALIZAR UN ACTIVO ---
  // PATCH /assets/:id
  @Patch(":id")
  update(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() updateAssetDto: UpdateAssetDto,
    @User("companyId") companyId: string,
  ) {
    return this.assetsService.update(id, updateAssetDto, companyId);
  }

  // --- ENDPOINT PARA ELIMINAR UN ACTIVO ---
  // DELETE /assets/:id
  @Delete(":id")
  remove(
    @Param("id", ParseUUIDPipe) id: string,
    @User("companyId") companyId: string,
  ) {
    return this.assetsService.remove(id, companyId);
  }
}
