import { Test, TestingModule } from '@nestjs/testing';
import { ThirdPartiesController } from './third-parties.controller';
import { ThirdPartiesService } from './third-parties.service';
import { CreateClientDto } from './dto/create-client.dto';
import { CreateProviderDto } from './dto/create-provider.dto';
import { UpdateThirdPartyDto } from './dto/update-third-party.dto';

describe('ThirdPartiesController', () => {
  let controller: ThirdPartiesController;
  let service: ThirdPartiesService;

  const mockThirdPartiesService = {
    createClient: jest.fn(),
    createProvider: jest.fn(),
    findAll: jest.fn(),
    findClients: jest.fn(),
    findProviders: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const mockUser = {
    id: 'user-1',
    name: 'Test User',
    email: 'user@test.com',
    companyId: 'company-1',
    role: 'admin',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ThirdPartiesController],
      providers: [
        {
          provide: ThirdPartiesService,
          useValue: mockThirdPartiesService,
        },
      ],
    }).compile();

    controller = module.get<ThirdPartiesController>(ThirdPartiesController);
    service = module.get<ThirdPartiesService>(ThirdPartiesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
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
      const expectedResult = {
        id: 'third-party-1',
        ...createClientDto,
        companyId: 'company-1',
        client: {
          id: 'client-1',
          creditLimit: 1000,
          thirdPartyId: 'third-party-1',
          companyId: 'company-1',
        },
        provider: null,
      };

      mockThirdPartiesService.createClient.mockResolvedValue(expectedResult);

      const result = await controller.createClient(createClientDto, mockUser);

      expect(service.createClient).toHaveBeenCalledWith(createClientDto, 'company-1');
      expect(result).toEqual(expectedResult);
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
      const expectedResult = {
        id: 'third-party-2',
        ...createProviderDto,
        companyId: 'company-1',
        client: null,
        provider: {
          id: 'provider-1',
          paymentTerms: 'Net 30',
          bankAccount: '1234567890',
          thirdPartyId: 'third-party-2',
          companyId: 'company-1',
        },
      };

      mockThirdPartiesService.createProvider.mockResolvedValue(expectedResult);

      const result = await controller.createProvider(createProviderDto, mockUser);

      expect(service.createProvider).toHaveBeenCalledWith(createProviderDto, 'company-1');
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findAll', () => {
    it('should return all third parties for the user company', async () => {
      const expectedResult = [
        {
          id: 'third-party-1',
          name: 'Client 1',
          nit: '12345678-1',
          companyId: 'company-1',
          client: { id: 'client-1', creditLimit: 1000 },
          provider: null,
        },
        {
          id: 'third-party-2',
          name: 'Provider 1',
          nit: '87654321-2',
          companyId: 'company-1',
          client: null,
          provider: { id: 'provider-1', paymentTerms: 'Net 30' },
        },
      ];

      mockThirdPartiesService.findAll.mockResolvedValue(expectedResult);

      const result = await controller.findAll(mockUser);

      expect(service.findAll).toHaveBeenCalledWith('company-1');
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findClients', () => {
    it('should return all clients for the user company', async () => {
      const expectedResult = [
        {
          id: 'client-1',
          creditLimit: 1000,
          companyId: 'company-1',
          thirdParty: {
            id: 'third-party-1',
            name: 'Client 1',
            nit: '12345678-1',
          },
        },
      ];

      mockThirdPartiesService.findClients.mockResolvedValue(expectedResult);

      const result = await controller.findClients(mockUser);

      expect(service.findClients).toHaveBeenCalledWith('company-1');
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findProviders', () => {
    it('should return all providers for the user company', async () => {
      const expectedResult = [
        {
          id: 'provider-1',
          paymentTerms: 'Net 30',
          bankAccount: '1234567890',
          companyId: 'company-1',
          thirdParty: {
            id: 'third-party-2',
            name: 'Provider 1',
            nit: '87654321-2',
          },
        },
      ];

      mockThirdPartiesService.findProviders.mockResolvedValue(expectedResult);

      const result = await controller.findProviders(mockUser);

      expect(service.findProviders).toHaveBeenCalledWith('company-1');
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findOne', () => {
    it('should return a third party by ID', async () => {
      const id = 'third-party-1';
      const expectedResult = {
        id,
        name: 'Test Third Party',
        nit: '12345678-1',
        companyId: 'company-1',
        client: { id: 'client-1', creditLimit: 1000 },
        provider: null,
      };

      mockThirdPartiesService.findOne.mockResolvedValue(expectedResult);

      const result = await controller.findOne(id, mockUser);

      expect(service.findOne).toHaveBeenCalledWith(id, 'company-1');
      expect(result).toEqual(expectedResult);
    });
  });

  describe('update', () => {
    it('should update a third party successfully', async () => {
      const id = 'third-party-1';
      const updateDto: UpdateThirdPartyDto = {
        name: 'Updated Name',
        address: 'Updated Address',
      };
      const expectedResult = {
        id,
        name: 'Updated Name',
        nit: '12345678-1',
        address: 'Updated Address',
        companyId: 'company-1',
        client: { id: 'client-1', creditLimit: 1000 },
        provider: null,
      };

      mockThirdPartiesService.update.mockResolvedValue(expectedResult);

      const result = await controller.update(id, updateDto, mockUser);

      expect(service.update).toHaveBeenCalledWith(id, updateDto, 'company-1');
      expect(result).toEqual(expectedResult);
    });
  });

  describe('remove', () => {
    it('should remove a third party successfully', async () => {
      const id = 'third-party-1';
      const expectedResult = { id };

      mockThirdPartiesService.remove.mockResolvedValue(expectedResult);

      const result = await controller.remove(id, mockUser);

      expect(service.remove).toHaveBeenCalledWith(id, 'company-1');
      expect(result).toEqual(expectedResult);
    });
  });
});

