import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateAssetDto } from "./dto/create-asset.dto";
import { UpdateAssetDto } from "./dto/update-asset.dto";

@Injectable()
export class AssetsService {
  constructor(private readonly prisma: PrismaService) {}

  // --- MÉTODO PARA CREAR UN ACTIVO ---
  async create(createAssetDto: CreateAssetDto, companyId: string) {
    // 1. Validar que el Tercero (cliente) existe y pertenece a la empresa.
    const thirdParty = await this.prisma.thirdParty.findUnique({
      where: { id: createAssetDto.thirdPartyId, companyId: companyId },
    });
    if (!thirdParty) {
      throw new NotFoundException("El cliente especificado no fue encontrado.");
    }

    // 2. Validar que el ListItem para el TIPO de activo existe, pertenece a la empresa y es del tipo correcto.
    const assetTypeItem = await this.prisma.listItem.findFirst({
      where: {
        id: createAssetDto.assetTypeId,
        companyId: companyId,
        listType: { code: "ASSET_TYPE" }, // Asumimos que el código es 'ASSET_TYPE'
      },
    });
    if (!assetTypeItem) {
      throw new BadRequestException(
        "El tipo de activo especificado no es válido.",
      );
    }

    // 3. Validar que el ListItem para el ESTADO del activo existe y es del tipo correcto.
    const statusItem = await this.prisma.listItem.findFirst({
      where: {
        id: createAssetDto.statusId,
        companyId: companyId,
        listType: { code: "ASSET_STATUS" }, // Asumimos que el código es 'ASSET_STATUS'
      },
    });
    if (!statusItem) {
      throw new BadRequestException(
        "El estado del activo especificado no es válido.",
      );
    }

    // 4. Si todas las validaciones pasan, crear el activo.
    return this.prisma.asset.create({
      data: {
        ...createAssetDto,
        companyId: companyId, // Aseguramos la asignación a la empresa correcta.
      },
    });
  }

  // --- MÉTODO PARA BUSCAR TODOS LOS ACTIVOS DE UNA EMPRESA ---
  findAll(companyId: string) {
    return this.prisma.asset.findMany({
      where: { companyId },
      include: {
        // Incluimos datos relacionados para una respuesta más completa
        thirdParty: { select: { name: true } },
        assetType: { select: { name: true } },
        status: { select: { name: true } },
      },
    });
  }

  // --- MÉTODO PARA BUSCAR UN ACTIVO ESPECÍFICO ---
  async findOne(id: string, companyId: string) {
    const asset = await this.prisma.asset.findUnique({
      where: { id, companyId }, // Buscamos por ID y companyId para seguridad
      include: {
        thirdParty: { select: { name: true, nit: true } },
        assetType: { select: { name: true } },
        status: { select: { name: true } },
      },
    });
    if (!asset) {
      throw new NotFoundException(`El activo con ID #${id} no fue encontrado.`);
    }
    return asset;
  }

  // --- MÉTODO PARA ACTUALIZAR UN ACTIVO ---
  async update(id: string, updateAssetDto: UpdateAssetDto, companyId: string) {
    // Primero, verificamos que el activo exista y pertenezca a la empresa
    await this.findOne(id, companyId);
    return this.prisma.asset.update({
      where: { id },
      data: updateAssetDto,
    });
  }

  // --- MÉTODO PARA ELIMINAR UN ACTIVO ---
  async remove(id: string, companyId: string) {
    await this.findOne(id, companyId);
    return this.prisma.asset.delete({
      where: { id },
    });
  }
}
