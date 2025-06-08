import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateListItemDto } from "./dto/create-list-item.dto";
import { UpdateListItemDto } from "./dto/update-list-item.dto";

@Injectable()
export class ListItemService {
  constructor(private prisma: PrismaService) {}

  create(data: CreateListItemDto) {
    return this.prisma.listItem.create({ data });
  }

  findAll() {
    return this.prisma.listItem.findMany();
  }

  findByTypeId(listTypeId: number) {
    return this.prisma.listItem.findMany({
      where: { listTypeId, active: true },
      orderBy: { name: "asc" },
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
