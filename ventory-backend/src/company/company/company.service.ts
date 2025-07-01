import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "src/prisma/prisma.service";
import { UpdateCompanySettingsDto } from "../dto/update-company-settings.dto";

@Injectable()
export class CompanyService {
  constructor(private prisma: PrismaService) {}

  async updateGeneralParams(
    companyId: string,
    dto: UpdateCompanySettingsDto,
  ) {
    const data: Prisma.CompanyUpdateInput = {
      ...(dto.name !== undefined ? { name: dto.name } : {}),
      ...(dto.nit !== undefined ? { nit: dto.nit } : {}),
      ...(dto.email !== undefined ? { email: dto.email } : {}),
      ...(dto.address !== undefined ? { address: dto.address } : {}),
      ...(dto.phones !== undefined ? { phones: dto.phones } : {}),
      ...(dto.website !== undefined ? { website: dto.website } : {}),
      ...(dto.currency !== undefined ? { currency: dto.currency } : {}),
      ...(dto.vatPercent !== undefined ? { vatPercent: dto.vatPercent } : {}),
      ...(dto.logo !== undefined ? { logo: dto.logo } : {}),
    };

    return this.prisma.company.update({
      where: { id: companyId },
      data,
    });
  }
}
