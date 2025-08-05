import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "src/prisma/prisma.service";
import { UpdateCompanySettingsDto } from "../dto/update-company-settings.dto";
import * as path from "path";
import * as fs from "fs";

@Injectable()
export class CompanyService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.company.findMany({
      select: {
        id: true,
        name: true,
        nit: true,
        logo: true,
        users: {
          where: {
            role: {
              name: 'propietario',
            },
          },
          select: {
            name: true,
            email: true,
          },
          take: 1,
        },
      },
    });
  }

  async getGeneralParams(companyId: string) {
    return this.prisma.company.findUnique({
      where: { id: companyId },
      select: {
        name: true,
        nit: true,
        email: true,
        address: true,
        phones: true,
        website: true,
        currency: true,
        vatPercent: true,
        logo: true,
      },
    });
  }

  async updateGeneralParams(
    companyId: string,
    dto: UpdateCompanySettingsDto,
    logoFile: Express.Multer.File,
  ) {
    let logoUrl: string | undefined = undefined;

    if (logoFile) {
      const uploadPath = path.join(
        __dirname,
        "..",
        "..",
        "..",
        "uploads",
        "logos",
      );
      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
      }
      const fileName = `${companyId}-${Date.now()}${path.extname(logoFile.originalname)}`;
      const filePath = path.join(uploadPath, fileName);

      fs.writeFileSync(filePath, logoFile.buffer);
      logoUrl = `/uploads/logos/${fileName}`;
      console.log(`Logo saved at: ${filePath}`);
    }

    const data: Prisma.CompanyUpdateInput = {
      ...(dto.name !== undefined ? { name: dto.name } : {}),
      ...(dto.nit !== undefined ? { nit: dto.nit } : {}),
      ...(dto.email !== undefined ? { email: dto.email } : {}),
      ...(dto.address !== undefined ? { address: dto.address } : {}),
      ...(dto.phones !== undefined ? { phones: dto.phones } : {}),
      ...(dto.website !== undefined ? { website: dto.website } : {}),
      ...(dto.currency !== undefined ? { currency: dto.currency } : {}),
      ...(dto.vatPercent !== undefined
        ? { vatPercent: Number(dto.vatPercent) }
        : {}),
      ...(logoUrl !== undefined ? { logo: logoUrl } : {}),
    };

    await this.prisma.company.update({
      where: { id: companyId },
      data,
    });

    return { logoUrl };
  }

  async getCountrySettings(countryCode: string) {
    switch (countryCode) {
      case "CO":
        return { currency: "COP", vatPercent: 19 };
      case "US":
        return { currency: "USD", vatPercent: 0 };
      default:
        return { currency: "USD", vatPercent: 0 };
    }
  }
}
