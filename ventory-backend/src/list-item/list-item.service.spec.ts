import { Test, TestingModule } from '@nestjs/testing';
import { ListItemService } from './list-item.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateListItemDto } from './dto/create-list-item.dto';
import { UpdateListItemDto } from './dto/update-list-item.dto';

describe('ListItemService', () => {
  let service: ListItemService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    listItem: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      updateMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ListItemService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<ListItemService>(ListItemService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a list item with companyId', async () => {
      const createDto: CreateListItemDto = {
        name: 'Test Item',
        description: 'Test Description',
        listTypeId: 'type-1',
      };
      const companyId = 'company-1';
      const expectedResult = { id: 'item-1', ...createDto, companyId };

      mockPrismaService.listItem.create.mockResolvedValue(expectedResult);

      const result = await service.create(createDto, companyId);

      expect(mockPrismaService.listItem.create).toHaveBeenCalledWith({
        data: {
          ...createDto,
          companyId,
        },
      });
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findAll', () => {
    it('should find all items for a company with no filters', async () => {
      const companyId = 'company-1';
      const expectedResult = [
        { id: 'item-1', name: 'Item 1', companyId },
        { id: 'item-2', name: 'Item 2', companyId },
      ];

      mockPrismaService.listItem.findMany.mockResolvedValue(expectedResult);

      const result = await service.findAll(companyId);

      expect(mockPrismaService.listItem.findMany).toHaveBeenCalledWith({
        where: { companyId },
        include: { listType: true },
      });
      expect(result).toEqual(expectedResult);
    });

    it('should find all items for a company with active filter', async () => {
      const companyId = 'company-1';
      const active = true;
      const expectedResult = [{ id: 'item-1', name: 'Active Item', companyId, active: true }];

      mockPrismaService.listItem.findMany.mockResolvedValue(expectedResult);

      const result = await service.findAll(companyId, active);

      expect(mockPrismaService.listItem.findMany).toHaveBeenCalledWith({
        where: { companyId, active: true },
        include: { listType: true },
      });
      expect(result).toEqual(expectedResult);
    });

    it('should find all items for a company with listTypeId filter', async () => {
      const companyId = 'company-1';
      const listTypeId = 'type-1';
      const expectedResult = [{ id: 'item-1', name: 'Item 1', companyId, listTypeId }];

      mockPrismaService.listItem.findMany.mockResolvedValue(expectedResult);

      const result = await service.findAll(companyId, undefined, listTypeId);

      expect(mockPrismaService.listItem.findMany).toHaveBeenCalledWith({
        where: { companyId, listTypeId },
        include: { listType: true },
      });
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findByTypeId', () => {
    it('should find items by type ID with companyId filter', async () => {
      const listTypeId = 'type-1';
      const companyId = 'company-1';
      const expectedResult = [
        { id: 'item-1', name: 'Item 1', listTypeId, companyId, active: true },
      ];

      mockPrismaService.listItem.findMany.mockResolvedValue(expectedResult);

      const result = await service.findByTypeId(listTypeId, companyId);

      expect(mockPrismaService.listItem.findMany).toHaveBeenCalledWith({
        where: { listTypeId, companyId, active: true },
        orderBy: { name: 'asc' },
        include: { listType: true },
      });
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findOne', () => {
    it('should find one item by ID with companyId filter', async () => {
      const id = 'item-1';
      const companyId = 'company-1';
      const expectedResult = { id, name: 'Item 1', companyId };

      mockPrismaService.listItem.findFirst.mockResolvedValue(expectedResult);

      const result = await service.findOne(id, companyId);

      expect(mockPrismaService.listItem.findFirst).toHaveBeenCalledWith({
        where: { id, companyId },
        include: { listType: true },
      });
      expect(result).toEqual(expectedResult);
    });
  });

  describe('update', () => {
    it('should update item with companyId filter', async () => {
      const id = 'item-1';
      const companyId = 'company-1';
      const updateDto: UpdateListItemDto = { name: 'Updated Item' };
      const expectedResult = { count: 1 };

      mockPrismaService.listItem.updateMany.mockResolvedValue(expectedResult);

      const result = await service.update(id, updateDto, companyId);

      expect(mockPrismaService.listItem.updateMany).toHaveBeenCalledWith({
        where: { id, companyId },
        data: updateDto,
      });
      expect(result).toEqual(expectedResult);
    });
  });

  describe('remove', () => {
    it('should remove item with companyId filter', async () => {
      const id = 'item-1';
      const companyId = 'company-1';
      const expectedResult = { count: 1 };

      mockPrismaService.listItem.updateMany.mockResolvedValue(expectedResult);

      const result = await service.remove(id, companyId);

      expect(mockPrismaService.listItem.updateMany).toHaveBeenCalledWith({
        where: { id, companyId },
        data: { active: false },
      });
      expect(result).toEqual(expectedResult);
    });
  });

  describe('restore', () => {
    it('should restore item with companyId filter', async () => {
      const id = 'item-1';
      const companyId = 'company-1';
      const expectedResult = { count: 1 };

      mockPrismaService.listItem.updateMany.mockResolvedValue(expectedResult);

      const result = await service.restore(id, companyId);

      expect(mockPrismaService.listItem.updateMany).toHaveBeenCalledWith({
        where: { id, companyId },
        data: { active: true },
      });
      expect(result).toEqual(expectedResult);
    });
  });
});