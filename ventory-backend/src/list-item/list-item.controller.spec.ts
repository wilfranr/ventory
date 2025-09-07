import { Test, TestingModule } from '@nestjs/testing';
import { ListItemController } from './list-item.controller';
import { ListItemService } from './list-item.service';
import { CreateListItemDto } from './dto/create-list-item.dto';
import { UpdateListItemDto } from './dto/update-list-item.dto';

describe('ListItemController', () => {
  let controller: ListItemController;
  let service: ListItemService;

  const mockListItemService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findByTypeId: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    restore: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ListItemController],
      providers: [
        {
          provide: ListItemService,
          useValue: mockListItemService,
        },
      ],
    }).compile();

    controller = module.get<ListItemController>(ListItemController);
    service = module.get<ListItemService>(ListItemService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a list item', async () => {
      const createDto: CreateListItemDto = {
        name: 'Test Item',
        description: 'Test Description',
        listTypeId: 'type-1',
      };
      const user = { companyId: 'company-1' };
      const expectedResult = { id: 'item-1', ...createDto, companyId: 'company-1' };

      mockListItemService.create.mockResolvedValue(expectedResult);

      const result = await controller.create(createDto, user);

      expect(mockListItemService.create).toHaveBeenCalledWith(createDto, 'company-1');
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findAll', () => {
    it('should find all items with no filters', async () => {
      const user = { companyId: 'company-1' };
      const expectedResult = [
        { id: 'item-1', name: 'Item 1', companyId: 'company-1' },
      ];

      mockListItemService.findAll.mockResolvedValue(expectedResult);

      const result = await controller.findAll(user);

      expect(mockListItemService.findAll).toHaveBeenCalledWith('company-1', undefined, undefined);
      expect(result).toEqual(expectedResult);
    });

    it('should find all items with active filter', async () => {
      const user = { companyId: 'company-1' };
      const active = 'true';
      const expectedResult = [
        { id: 'item-1', name: 'Active Item', companyId: 'company-1', active: true },
      ];

      mockListItemService.findAll.mockResolvedValue(expectedResult);

      const result = await controller.findAll(user, active);

      expect(mockListItemService.findAll).toHaveBeenCalledWith('company-1', true, undefined);
      expect(result).toEqual(expectedResult);
    });

    it('should find all items with listTypeId filter', async () => {
      const user = { companyId: 'company-1' };
      const listTypeId = 'type-1';
      const expectedResult = [
        { id: 'item-1', name: 'Item 1', companyId: 'company-1', listTypeId },
      ];

      mockListItemService.findAll.mockResolvedValue(expectedResult);

      const result = await controller.findAll(user, undefined, listTypeId);

      expect(mockListItemService.findAll).toHaveBeenCalledWith('company-1', undefined, listTypeId);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findByType', () => {
    it('should find items by type ID', async () => {
      const listTypeId = 'type-1';
      const companyId = 'company-1';
      const expectedResult = [
        { id: 'item-1', name: 'Item 1', listTypeId, companyId, active: true },
      ];

      mockListItemService.findByTypeId.mockResolvedValue(expectedResult);

      const result = await controller.findByType(listTypeId, companyId);

      expect(mockListItemService.findByTypeId).toHaveBeenCalledWith(listTypeId, companyId);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findOne', () => {
    it('should find one item by ID', async () => {
      const id = 'item-1';
      const companyId = 'company-1';
      const expectedResult = { id, name: 'Item 1', companyId };

      mockListItemService.findOne.mockResolvedValue(expectedResult);

      const result = await controller.findOne(id, companyId);

      expect(mockListItemService.findOne).toHaveBeenCalledWith(id, companyId);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('update', () => {
    it('should update an item', async () => {
      const id = 'item-1';
      const companyId = 'company-1';
      const updateDto: UpdateListItemDto = { name: 'Updated Item' };
      const expectedResult = { count: 1 };

      mockListItemService.update.mockResolvedValue(expectedResult);

      const result = await controller.update(id, updateDto, companyId);

      expect(mockListItemService.update).toHaveBeenCalledWith(id, updateDto, companyId);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('remove', () => {
    it('should remove an item', async () => {
      const id = 'item-1';
      const companyId = 'company-1';
      const expectedResult = { count: 1 };

      mockListItemService.remove.mockResolvedValue(expectedResult);

      const result = await controller.remove(id, companyId);

      expect(mockListItemService.remove).toHaveBeenCalledWith(id, companyId);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('restore', () => {
    it('should restore an item', async () => {
      const id = 'item-1';
      const companyId = 'company-1';
      const expectedResult = { count: 1 };

      mockListItemService.restore.mockResolvedValue(expectedResult);

      const result = await controller.restore(id, companyId);

      expect(mockListItemService.restore).toHaveBeenCalledWith(id, companyId);
      expect(result).toEqual(expectedResult);
    });
  });
});