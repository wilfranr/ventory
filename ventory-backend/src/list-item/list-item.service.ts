import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateListItemDto } from "./dto/create-list-item.dto";
import { UpdateListItemDto } from "./dto/update-list-item.dto";

@Injectable()
export class ListItemService {
  constructor(private prisma: PrismaService) {}

  create(data: CreateListItemDto, companyId: string) {
    return this.prisma.listItem.create({
      data: {
        ...data,
        companyId,
      },
    });
  }

  findAll(companyId: string, active?: boolean, listTypeId?: number) {
    console.log("Buscando con:", { companyId, active, listTypeId });
    return this.prisma.listItem.findMany({
      where: {
        companyId,
        ...(active === true ? { active: true } : {}),
        ...(active === false ? { active: false } : {}),
        ...(listTypeId !== undefined ? { listTypeId } : {}),
      },
      include: { listType: true },
    });
  }

  findByTypeId(listTypeId: number) {
    return this.prisma.listItem.findMany({
      where: { listTypeId, active: true },
      orderBy: { name: "asc" },
      include: { listType: true },
    });
  }

  findOne(id: number) {
    return this.prisma.listItem.findUnique({ where: { id } });
  }

  update(id: number, data: UpdateListItemDto) {
    return this.prisma.listItem.update({
      where: { id },
      data,
    });
  }

  remove(id: number) {
    return this.prisma.listItem.update({
      where: { id },
      data: { active: false },
    });
  }
}
