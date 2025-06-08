import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateListTypeDto } from "./dto/create-list-type.dto";
import { UpdateListTypeDto } from "./dto/update-list-type.dto";

@Injectable()
export class ListTypeService {
  constructor(private readonly prisma: PrismaService) {}
  create(data: CreateListTypeDto) {
    return this.prisma.listType.create({ data });
  }

  findAll() {
    return this.prisma.listType.findMany({
      include: { items: true },
      orderBy: { name: "asc" },
    });
  }

  findOne(id: number) {
    return this.prisma.listType.findUnique({
      where: { id },
      include: { items: true },
    })
  }

  update(id: number, data: UpdateListTypeDto) {
    return this.prisma.listType.update({
      where: { id },
      data
    })
  }

  remove(id: number) {
    return this.prisma.listType.delete({
      where: { id },
    })
  }
}
