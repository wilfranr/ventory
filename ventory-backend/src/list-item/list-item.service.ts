/**
 * Servicio que gestiona la lógica de los elementos de listas.
 */
import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateListItemDto } from "./dto/create-list-item.dto";
import { UpdateListItemDto } from "./dto/update-list-item.dto";

@Injectable()
/**
 * Servicio que encapsula la lógica de acceso a datos para los
 * elementos de lista.
 */
export class ListItemService {
  constructor(private prisma: PrismaService) {}

  /**
   * Crea un nuevo elemento de lista para la compañía indicada.
   */
  create(data: CreateListItemDto, companyId: string) {
    return this.prisma.listItem.create({
      data: {
        ...data,
        companyId,
      },
    });
  }

  /**
   * Obtiene todos los elementos de una compañía filtrando por
   * estado o tipo de lista si se proporcionan.
   */
  findAll(companyId: string, active?: boolean, listTypeId?: string) {
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

  /**
   * Devuelve los elementos activos de un tipo de lista específico.
   * Filtra por empresa para asegurar aislamiento de datos.
   */
  findByTypeId(listTypeId: string, companyId: string) {
    return this.prisma.listItem.findMany({
      where: { 
        listTypeId, 
        companyId, // ✅ Añadido filtro por empresa
        active: true 
      },
      orderBy: { name: "asc" },
      include: { listType: true },
    });
  }

  /**
   * Busca un elemento por su identificador único.
   * Valida que pertenezca a la empresa del usuario.
   */
  findOne(id: string, companyId: string) {
    return this.prisma.listItem.findFirst({ 
      where: { 
        id, 
        companyId // ✅ Añadido filtro por empresa
      },
      include: { listType: true }
    });
  }

  /**
   * Actualiza los datos de un elemento de lista existente.
   * Valida que pertenezca a la empresa del usuario.
   */
  update(id: string, data: UpdateListItemDto, companyId: string) {
    return this.prisma.listItem.updateMany({
      where: { 
        id, 
        companyId // ✅ Añadido filtro por empresa
      },
      data,
    });
  }

  /**
   * Deshabilita lógicamente un elemento, dejándolo inactivo.
   * Valida que pertenezca a la empresa del usuario.
   */
  remove(id: string, companyId: string) {
    return this.prisma.listItem.updateMany({
      where: { 
        id, 
        companyId // ✅ Añadido filtro por empresa
      },
      data: { active: false },
    });
  }

  /**
   * Restaura un elemento previamente desactivado.
   * Valida que pertenezca a la empresa del usuario.
   */
  restore(id: string, companyId: string) {
    return this.prisma.listItem.updateMany({
      where: { 
        id, 
        companyId // ✅ Añadido filtro por empresa
      },
      data: { active: true },
    });
  }
}
