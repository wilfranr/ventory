/**
 * Servicio para la gestión de tipos de lista.
 */
import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateListTypeDto } from "./dto/create-list-type.dto";
import { UpdateListTypeDto } from "./dto/update-list-type.dto";

@Injectable()
export class ListTypeService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Crea un nuevo tipo de lista asociado a la compañía.
   */
  create(data: CreateListTypeDto, companyId: string) {
    return this.prisma.listType.create({
      data: {
        ...data,
        companyId,
      },
    });
  }

  /**
   * Obtiene todos los tipos de lista de una compañía.
   */
  findAll(companyId: string) {
    return this.prisma.listType.findMany({
      where: { companyId },
      // ...otros includes si quieres
    });
  }

  /**
   * Busca un tipo de lista por su identificador.
   */
  findOne(id: string, companyId: string) {
    return this.prisma.listType.findFirst({
      where: { id, companyId },
    });
  }

  /**
   * Actualiza la información de un tipo de lista.
   */
  update(id: string, data: UpdateListTypeDto) {
    return this.prisma.listType.update({
      where: { id },
      data,
    });
  }

  /**
   * Elimina un tipo de lista de la base de datos.
   */
  remove(id: string) {
    return this.prisma.listType.delete({
      where: { id },
    });
  }
}
