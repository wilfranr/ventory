import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class CompanyService {
  constructor(private prisma: PrismaService) {}

  async updateGeneralParams(
    companyId: string,
    data: { currency?: string; vatPercentage?: number },
  ) {
    return this.prisma.company.update({
      where: { id: companyId },
      data,
    });
  }
}
