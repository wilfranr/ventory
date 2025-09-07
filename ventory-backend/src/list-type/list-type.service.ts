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
   * Valida que pertenezca a la empresa del usuario.
   */
  update(id: string, data: UpdateListTypeDto, companyId: string) {
    return this.prisma.listType.updateMany({
      where: { 
        id, 
        companyId // ✅ Añadido filtro por empresa
      },
      data,
    });
  }

  /**
   * Elimina un tipo de lista de la base de datos.
   * Valida que pertenezca a la empresa del usuario.
   */
  remove(id: string, companyId: string) {
    return this.prisma.listType.deleteMany({
      where: { 
        id, 
        companyId // ✅ Añadido filtro por empresa
      },
    });
  }
}
