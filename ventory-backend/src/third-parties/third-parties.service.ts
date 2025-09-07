import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateThirdPartyDto } from './dto/create-third-party.dto';
import { CreateClientDto } from './dto/create-client.dto';
import { CreateProviderDto } from './dto/create-provider.dto';
import { UpdateThirdPartyDto } from './dto/update-third-party.dto';

@Injectable()
export class ThirdPartiesService {
  constructor(private prisma: PrismaService) {}

  /**
   * Crea un nuevo tercero con rol de cliente
   */
  async createClient(dto: CreateClientDto, companyId: string) {
    return this.prisma.$transaction(async (tx) => {
      // Verificar que el NIT no exista en la empresa
      const existingThirdParty = await tx.thirdParty.findFirst({
        where: {
          nit: dto.nit,
          companyId: companyId,
        },
      });

      if (existingThirdParty) {
        throw new ConflictException('Ya existe un tercero con este NIT en la empresa');
      }

      // Crear el ThirdParty
      const thirdParty = await tx.thirdParty.create({
        data: {
          name: dto.name,
          nit: dto.nit,
          address: dto.address,
          phones: dto.phones,
          email: dto.email,
          website: dto.website,
          companyId: companyId,
        },
      });

      // Crear el Client
      const client = await tx.client.create({
        data: {
          creditLimit: dto.creditLimit || 0,
          thirdPartyId: thirdParty.id,
          companyId: companyId,
        },
      });

      // Retornar el resultado con las relaciones
      return tx.thirdParty.findUnique({
        where: { id: thirdParty.id },
        include: {
          client: true,
          provider: true,
        },
      });
    });
  }

  /**
   * Crea un nuevo tercero con rol de proveedor
   */
  async createProvider(dto: CreateProviderDto, companyId: string) {
    return this.prisma.$transaction(async (tx) => {
      // Verificar que el NIT no exista en la empresa
      const existingThirdParty = await tx.thirdParty.findFirst({
        where: {
          nit: dto.nit,
          companyId: companyId,
        },
      });

      if (existingThirdParty) {
        throw new ConflictException('Ya existe un tercero con este NIT en la empresa');
      }

      // Crear el ThirdParty
      const thirdParty = await tx.thirdParty.create({
        data: {
          name: dto.name,
          nit: dto.nit,
          address: dto.address,
          phones: dto.phones,
          email: dto.email,
          website: dto.website,
          companyId: companyId,
        },
      });

      // Crear el Provider
      const provider = await tx.provider.create({
        data: {
          paymentTerms: dto.paymentTerms,
          bankAccount: dto.bankAccount,
          thirdPartyId: thirdParty.id,
          companyId: companyId,
        },
      });

      // Retornar el resultado con las relaciones
      return tx.thirdParty.findUnique({
        where: { id: thirdParty.id },
        include: {
          client: true,
          provider: true,
        },
      });
    });
  }

  /**
   * Obtiene todos los terceros de una empresa
   */
  async findAll(companyId: string) {
    return this.prisma.thirdParty.findMany({
      where: { companyId },
      include: {
        client: true,
        provider: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Obtiene un tercero específico por ID
   */
  async findOne(id: string, companyId: string) {
    const thirdParty = await this.prisma.thirdParty.findFirst({
      where: { id, companyId },
      include: {
        client: true,
        provider: true,
      },
    });

    if (!thirdParty) {
      throw new NotFoundException('Tercero no encontrado');
    }

    return thirdParty;
  }

  /**
   * Actualiza un tercero existente
   */
  async update(id: string, dto: UpdateThirdPartyDto, companyId: string) {
    // Verificar que el tercero existe y pertenece a la empresa
    const existingThirdParty = await this.prisma.thirdParty.findFirst({
      where: { id, companyId },
    });

    if (!existingThirdParty) {
      throw new NotFoundException('Tercero no encontrado');
    }

    // Si se está actualizando el NIT, verificar que no exista otro con el mismo NIT
    if (dto.nit && dto.nit !== existingThirdParty.nit) {
      const duplicateThirdParty = await this.prisma.thirdParty.findFirst({
        where: {
          nit: dto.nit,
          companyId: companyId,
          id: { not: id },
        },
      });

      if (duplicateThirdParty) {
        throw new ConflictException('Ya existe un tercero con este NIT en la empresa');
      }
    }

    return this.prisma.thirdParty.update({
      where: { id },
      data: dto,
      include: {
        client: true,
        provider: true,
      },
    });
  }

  /**
   * Elimina un tercero
   */
  async remove(id: string, companyId: string) {
    // Verificar que el tercero existe y pertenece a la empresa
    const existingThirdParty = await this.prisma.thirdParty.findFirst({
      where: { id, companyId },
    });

    if (!existingThirdParty) {
      throw new NotFoundException('Tercero no encontrado');
    }

    return this.prisma.thirdParty.delete({
      where: { id },
    });
  }

  /**
   * Obtiene solo los clientes de una empresa
   */
  async findClients(companyId: string) {
    return this.prisma.client.findMany({
      where: { companyId },
      include: {
        thirdParty: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Obtiene solo los proveedores de una empresa
   */
  async findProviders(companyId: string) {
    return this.prisma.provider.findMany({
      where: { companyId },
      include: {
        thirdParty: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}

