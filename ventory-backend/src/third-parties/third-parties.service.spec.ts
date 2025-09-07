import { Test, TestingModule } from '@nestjs/testing';
import { ThirdPartiesService } from './third-parties.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateClientDto } from './dto/create-client.dto';
import { CreateProviderDto } from './dto/create-provider.dto';
import { UpdateThirdPartyDto } from './dto/update-third-party.dto';
import { ConflictException, NotFoundException } from '@nestjs/common';

describe('ThirdPartiesService', () => {
  let service: ThirdPartiesService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    $transaction: jest.fn(),
    thirdParty: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    client: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
    provider: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ThirdPartiesService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<ThirdPartiesService>(ThirdPartiesService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createClient', () => {
    it('should create a client successfully', async () => {
      const createClientDto: CreateClientDto = {
        name: 'Test Client',
        nit: '12345678-1',
        address: 'Test Address',
        phones: '123456789',
        email: 'client@test.com',
        website: 'https://test.com',
        creditLimit: 1000,
      };
      const companyId = 'company-1';
      const expectedThirdParty = {
        id: 'third-party-1',
        ...createClientDto,
        companyId,
      };
      const expectedClient = {
        id: 'client-1',
        creditLimit: 1000,
        thirdPartyId: 'third-party-1',
        companyId,
      };
      const expectedResult = {
        ...expectedThirdParty,
        client: expectedClient,
        provider: null,
      };

      // Mock transaction
      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        const tx = {
          thirdParty: {
            findFirst: jest.fn().mockResolvedValue(null), // No existing third party
            create: jest.fn().mockResolvedValue(expectedThirdParty),
            findUnique: jest.fn().mockResolvedValue(expectedResult),
          },
          client: {
            create: jest.fn().mockResolvedValue(expectedClient),
          },
        };
        return callback(tx);
      });

      const result = await service.createClient(createClientDto, companyId);

      expect(mockPrismaService.$transaction).toHaveBeenCalled();
      expect(result).toEqual(expectedResult);
    });

    it('should throw ConflictException when NIT already exists', async () => {
      const createClientDto: CreateClientDto = {
        name: 'Test Client',
        nit: '12345678-1',
        creditLimit: 1000,
      };
      const companyId = 'company-1';

      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        const tx = {
          thirdParty: {
            findFirst: jest.fn().mockResolvedValue({ id: 'existing-id' }), // Existing third party
          },
        };
        return callback(tx);
      });

      await expect(service.createClient(createClientDto, companyId))
        .rejects
        .toThrow(ConflictException);
    });
  });

  describe('createProvider', () => {
    it('should create a provider successfully', async () => {
      const createProviderDto: CreateProviderDto = {
        name: 'Test Provider',
        nit: '87654321-2',
        address: 'Provider Address',
        phones: '987654321',
        email: 'provider@test.com',
        website: 'https://provider.com',
        paymentTerms: 'Net 30',
        bankAccount: '1234567890',
      };
      const companyId = 'company-1';
      const expectedThirdParty = {
        id: 'third-party-2',
        ...createProviderDto,
        companyId,
      };
      const expectedProvider = {
        id: 'provider-1',
        paymentTerms: 'Net 30',
        bankAccount: '1234567890',
        thirdPartyId: 'third-party-2',
        companyId,
      };
      const expectedResult = {
        ...expectedThirdParty,
        client: null,
        provider: expectedProvider,
      };

      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        const tx = {
          thirdParty: {
            findFirst: jest.fn().mockResolvedValue(null),
            create: jest.fn().mockResolvedValue(expectedThirdParty),
            findUnique: jest.fn().mockResolvedValue(expectedResult),
          },
          provider: {
            create: jest.fn().mockResolvedValue(expectedProvider),
          },
        };
        return callback(tx);
      });

      const result = await service.createProvider(createProviderDto, companyId);

      expect(mockPrismaService.$transaction).toHaveBeenCalled();
      expect(result).toEqual(expectedResult);
    });

    it('should throw ConflictException when NIT already exists', async () => {
      const createProviderDto: CreateProviderDto = {
        name: 'Test Provider',
        nit: '87654321-2',
        paymentTerms: 'Net 30',
      };
      const companyId = 'company-1';

      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        const tx = {
          thirdParty: {
            findFirst: jest.fn().mockResolvedValue({ id: 'existing-id' }),
          },
        };
        return callback(tx);
      });

      await expect(service.createProvider(createProviderDto, companyId))
        .rejects
        .toThrow(ConflictException);
    });
  });

  describe('findAll', () => {
    it('should return all third parties for a company', async () => {
      const companyId = 'company-1';
      const expectedResult = [
        {
          id: 'third-party-1',
          name: 'Client 1',
          nit: '12345678-1',
          companyId,
          client: { id: 'client-1', creditLimit: 1000 },
          provider: null,
        },
        {
          id: 'third-party-2',
          name: 'Provider 1',
          nit: '87654321-2',
          companyId,
          client: null,
          provider: { id: 'provider-1', paymentTerms: 'Net 30' },
        },
      ];

      mockPrismaService.thirdParty.findMany.mockResolvedValue(expectedResult);

      const result = await service.findAll(companyId);

      expect(mockPrismaService.thirdParty.findMany).toHaveBeenCalledWith({
        where: { companyId },
        include: {
          client: true,
          provider: true,
        },
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findOne', () => {
    it('should return a third party by ID', async () => {
      const id = 'third-party-1';
      const companyId = 'company-1';
      const expectedResult = {
        id,
        name: 'Test Third Party',
        nit: '12345678-1',
        companyId,
        client: { id: 'client-1', creditLimit: 1000 },
        provider: null,
      };

      mockPrismaService.thirdParty.findFirst.mockResolvedValue(expectedResult);

      const result = await service.findOne(id, companyId);

      expect(mockPrismaService.thirdParty.findFirst).toHaveBeenCalledWith({
        where: { id, companyId },
        include: {
          client: true,
          provider: true,
        },
      });
      expect(result).toEqual(expectedResult);
    });

    it('should throw NotFoundException when third party not found', async () => {
      const id = 'non-existent';
      const companyId = 'company-1';

      mockPrismaService.thirdParty.findFirst.mockResolvedValue(null);

      await expect(service.findOne(id, companyId))
        .rejects
        .toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a third party successfully', async () => {
      const id = 'third-party-1';
      const companyId = 'company-1';
      const updateDto: UpdateThirdPartyDto = {
        name: 'Updated Name',
        address: 'Updated Address',
      };
      const existingThirdParty = {
        id,
        name: 'Original Name',
        nit: '12345678-1',
        companyId,
      };
      const expectedResult = {
        ...existingThirdParty,
        ...updateDto,
        client: { id: 'client-1', creditLimit: 1000 },
        provider: null,
      };

      mockPrismaService.thirdParty.findFirst.mockResolvedValue(existingThirdParty);
      mockPrismaService.thirdParty.update.mockResolvedValue(expectedResult);

      const result = await service.update(id, updateDto, companyId);

      expect(mockPrismaService.thirdParty.findFirst).toHaveBeenCalledWith({
        where: { id, companyId },
      });
      expect(mockPrismaService.thirdParty.update).toHaveBeenCalledWith({
        where: { id },
        data: updateDto,
        include: {
          client: true,
          provider: true,
        },
      });
      expect(result).toEqual(expectedResult);
    });

    it('should throw NotFoundException when third party not found', async () => {
      const id = 'non-existent';
      const companyId = 'company-1';
      const updateDto: UpdateThirdPartyDto = { name: 'Updated Name' };

      mockPrismaService.thirdParty.findFirst.mockResolvedValue(null);

      await expect(service.update(id, updateDto, companyId))
        .rejects
        .toThrow(NotFoundException);
    });

    it('should throw ConflictException when updating NIT to existing one', async () => {
      const id = 'third-party-1';
      const companyId = 'company-1';
      const updateDto: UpdateThirdPartyDto = {
        nit: '87654321-2', // Different NIT
      };
      const existingThirdParty = {
        id,
        name: 'Original Name',
        nit: '12345678-1',
        companyId,
      };

      mockPrismaService.thirdParty.findFirst
        .mockResolvedValueOnce(existingThirdParty) // First call for existence check
        .mockResolvedValueOnce({ id: 'other-third-party' }); // Second call for NIT uniqueness

      await expect(service.update(id, updateDto, companyId))
        .rejects
        .toThrow(ConflictException);
    });
  });

  describe('remove', () => {
    it('should remove a third party successfully', async () => {
      const id = 'third-party-1';
      const companyId = 'company-1';
      const existingThirdParty = {
        id,
        name: 'Test Third Party',
        nit: '12345678-1',
        companyId,
      };
      const expectedResult = { id };

      mockPrismaService.thirdParty.findFirst.mockResolvedValue(existingThirdParty);
      mockPrismaService.thirdParty.delete.mockResolvedValue(expectedResult);

      const result = await service.remove(id, companyId);

      expect(mockPrismaService.thirdParty.findFirst).toHaveBeenCalledWith({
        where: { id, companyId },
      });
      expect(mockPrismaService.thirdParty.delete).toHaveBeenCalledWith({
        where: { id },
      });
      expect(result).toEqual(expectedResult);
    });

    it('should throw NotFoundException when third party not found', async () => {
      const id = 'non-existent';
      const companyId = 'company-1';

      mockPrismaService.thirdParty.findFirst.mockResolvedValue(null);

      await expect(service.remove(id, companyId))
        .rejects
        .toThrow(NotFoundException);
    });
  });

  describe('findClients', () => {
    it('should return all clients for a company', async () => {
      const companyId = 'company-1';
      const expectedResult = [
        {
          id: 'client-1',
          creditLimit: 1000,
          companyId,
          thirdParty: {
            id: 'third-party-1',
            name: 'Client 1',
            nit: '12345678-1',
          },
        },
      ];

      mockPrismaService.client.findMany.mockResolvedValue(expectedResult);

      const result = await service.findClients(companyId);

      expect(mockPrismaService.client.findMany).toHaveBeenCalledWith({
        where: { companyId },
        include: {
          thirdParty: true,
        },
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findProviders', () => {
    it('should return all providers for a company', async () => {
      const companyId = 'company-1';
      const expectedResult = [
        {
          id: 'provider-1',
          paymentTerms: 'Net 30',
          bankAccount: '1234567890',
          companyId,
          thirdParty: {
            id: 'third-party-2',
            name: 'Provider 1',
            nit: '87654321-2',
          },
        },
      ];

      mockPrismaService.provider.findMany.mockResolvedValue(expectedResult);

      const result = await service.findProviders(companyId);

      expect(mockPrismaService.provider.findMany).toHaveBeenCalledWith({
        where: { companyId },
        include: {
          thirdParty: true,
        },
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual(expectedResult);
    });
  });
});

