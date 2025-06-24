import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateListTypeDto } from "./dto/create-list-type.dto";
import { UpdateListTypeDto } from "./dto/update-list-type.dto";

@Injectable()
export class ListTypeService {
  constructor(private readonly prisma: PrismaService) {}

  create(data: CreateListTypeDto, companyId: string) {
    return this.prisma.listType.create({
      data: {
        ...data,
        companyId,
      },
    });
  }

  findAll(companyId: string) {
    return this.prisma.listType.findMany({
      where: { companyId },
      // ...otros includes si quieres
    });
  }

  findOne(id: number, companyId: string) {
    return this.prisma.listType.findFirst({
      where: { id, companyId },
    });
  }

  update(id: number, data: UpdateListTypeDto) {
    return this.prisma.listType.update({
      where: { id },
      data,
    });
  }

  remove(id: number) {
    return this.prisma.listType.delete({
      where: { id },
    });
  }
}
