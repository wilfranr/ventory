import { Test, TestingModule } from '@nestjs/testing';
import { ListItemService } from './list-item.service';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Tests for ListItemService.
 */
describe('ListItemService', () => {
  let service: ListItemService;
  const prisma = {
    listItem: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
  } as unknown as PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ListItemService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get<ListItemService>(ListItemService);
  });

  it('should create a list item with companyId', async () => {
    const dto = { name: 'Item', listTypeId: 1 } as any;
    const expected = { id: 1, ...dto, companyId: 'c1' };
    (prisma.listItem.create as jest.Mock).mockResolvedValue(expected);

    const result = await service.create(dto, 'c1');

    expect(prisma.listItem.create).toHaveBeenCalledWith({
      data: { ...dto, companyId: 'c1' },
    });
    expect(result).toEqual(expected);
  });

  it('should find items by filters', async () => {
    (prisma.listItem.findMany as jest.Mock).mockResolvedValue([]);

    await service.findAll('c1', true, 2);

    expect(prisma.listItem.findMany).toHaveBeenCalledWith({
      where: {
        companyId: 'c1',
        active: true,
        listTypeId: 2,
      },
      include: { listType: true },
    });
  });
});
