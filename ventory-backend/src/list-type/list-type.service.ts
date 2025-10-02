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
    console.log('ListTypeService.create - CompanyId:', companyId, 'Data:', data);
    
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
  async update(id: string, data: UpdateListTypeDto, companyId: string) {
    console.log('ListTypeService.update - ID:', id, 'CompanyId:', companyId, 'Data:', data);
    
    // Primero verificar que el registro existe y pertenece a la empresa
    const existingRecord = await this.prisma.listType.findFirst({
      where: { 
        id, 
        companyId
      },
    });

    if (!existingRecord) {
      throw new Error(`Tipo de lista con ID ${id} no encontrado o no pertenece a la empresa ${companyId}`);
    }

    console.log('ListTypeService.update - Record found:', existingRecord);
    
    return this.prisma.listType.update({
      where: { 
        id
      },
      data,
    });
  }

  /**
   * Elimina un tipo de lista de la base de datos.
   * Valida que pertenezca a la empresa del usuario.
   */
  async remove(id: string, companyId: string) {
    console.log('ListTypeService.remove - ID:', id, 'CompanyId:', companyId);
    
    // Primero verificar que el registro existe y pertenece a la empresa
    const existingRecord = await this.prisma.listType.findFirst({
      where: { 
        id, 
        companyId
      },
    });

    if (!existingRecord) {
      throw new Error(`Tipo de lista con ID ${id} no encontrado o no pertenece a la empresa ${companyId}`);
    }

    console.log('ListTypeService.remove - Record found:', existingRecord);
    
    return this.prisma.listType.delete({
      where: { 
        id
      },
    });
  }
}
