import {
  UseGuards,
  Put,
  Body,
  Param,
  Controller,
  Get,
  UseInterceptors,
  UploadedFile,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { JwtAuthGuard } from "src/auth/jwt-auth.guard";
import { Roles } from "src/auth/roles.decorator";
import { RolesGuard } from "src/auth/roles.guard";
import { CompanyService } from "./company.service";
import { UpdateCompanySettingsDto } from "../dto/update-company-settings.dto";
import { Public } from "src/auth/public.decorator";

@Controller("companies")
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("superadmin")
  async findAll() {
    return await this.companyService.findAll();
  }

  @Get(":id/settings")
  @UseGuards(JwtAuthGuard)
  async getSettings(@Param("id") id: string) {
    return await this.companyService.getGeneralParams(id);
  }

  @Get("country-settings/:countryCode")
  @Public()
  async getCountrySettings(@Param("countryCode") countryCode: string) {
    return this.companyService.getCountrySettings(countryCode);
  }

  @Put(":id/settings")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin", "superadmin", "propietario")
  @UseInterceptors(FileInterceptor("logo"))
  async updateSettings(
    @Param("id") id: string,
    @Body() dto: UpdateCompanySettingsDto,
    @UploadedFile() logo: Express.Multer.File,
  ) {
    return await this.companyService.updateGeneralParams(id, dto, logo);
  }
}
