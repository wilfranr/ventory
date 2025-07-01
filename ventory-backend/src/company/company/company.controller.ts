import { UseGuards, Put, Body, Param, Controller, Get } from "@nestjs/common";
import { JwtAuthGuard } from "src/auth/jwt-auth.guard";
import { Roles } from "src/auth/roles.decorator";
import { RolesGuard } from "src/auth/roles.guard";
import { CompanyService } from "./company.service";
import { UpdateCompanySettingsDto } from "../dto/update-company-settings.dto";

@Controller("companies")
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @Get(":id/settings")
  @UseGuards(JwtAuthGuard)
  async getSettings(@Param("id") id: string) {
    return await this.companyService.getGeneralParams(id);
  }
  @Put(":id/settings")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin", "superadmin")
  async updateSettings(
    @Param("id") id: string,
    @Body() dto: UpdateCompanySettingsDto,
  ) {
    return await this.companyService.updateGeneralParams(id, dto);
  }
}
