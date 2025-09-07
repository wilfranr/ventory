import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { PrismaService } from '../src/prisma/prisma.service';
import { ThirdPartiesModule } from '../src/third-parties/third-parties.module';
import { ThirdPartiesService } from '../src/third-parties/third-parties.service';
import { PrismaModule } from '../src/prisma/prisma.module';
import * as request from 'supertest';
import * as bcrypt from 'bcrypt';

describe('Third Parties Module (e2e)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  let companyId: string;
  let adminToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [ThirdPartiesModule, PrismaModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prismaService = moduleFixture.get<PrismaService>(PrismaService);
    await app.init();

    // Setup test data
    await setupTestData();
  });

  afterAll(async () => {
    await cleanupTestData();
    await app.close();
  });

  async function setupTestData() {
    // Create a test company
    const company = await prismaService.company.create({
      data: {
        name: 'Test Company',
        slug: 'test-company',
        nit: '12345678-1',
        email: 'company@test.com',
      },
    });
    companyId = company.id;

    // Create admin role
    const adminRole = await prismaService.role.create({
      data: {
        name: 'admin',
        companyId: companyId,
      },
    });

    // Create admin user
    const hashedPassword = await bcrypt.hash('password123', 10);
    const admin = await prismaService.user.create({
      data: {
        name: 'Admin User',
        email: 'admin@test.com',
        password: hashedPassword,
        companyId: companyId,
        roleId: adminRole.id,
        status: 'activo',
      },
    });

    // Get auth token (simplified - in real scenario would use auth service)
    adminToken = 'mock-admin-token';
  }

  async function getAuthToken(email: string, password: string): Promise<string> {
    // Mock auth for testing - in real scenario would use actual auth service
    return 'mock-token';
  }

  async function cleanupTestData() {
    // Clean up third parties
    await prismaService.client.deleteMany({
      where: { companyId },
    });

    await prismaService.provider.deleteMany({
      where: { companyId },
    });

    await prismaService.thirdParty.deleteMany({
      where: { companyId },
    });

    // Clean up users
    await prismaService.user.deleteMany({
      where: { email: 'admin@test.com' },
    });

    // Clean up roles
    await prismaService.role.deleteMany({
      where: { companyId },
    });

    // Clean up company
    await prismaService.company.delete({
      where: { id: companyId },
    });
  }

  describe('Third Parties Service Integration', () => {
    it('should create a client successfully', async () => {
      const clientData = {
        name: 'Test Client',
        nit: '12345678-1',
        address: 'Test Address',
        phones: '123456789',
        email: 'client@test.com',
        website: 'https://test.com',
        creditLimit: 1000,
      };

      // Test the service directly
      const thirdPartiesService = app.get(ThirdPartiesService);
      const result = await thirdPartiesService.createClient(clientData, companyId);

      expect(result).toMatchObject({
        name: clientData.name,
        nit: clientData.nit,
        address: clientData.address,
        phones: clientData.phones,
        email: clientData.email,
        website: clientData.website,
        companyId: companyId,
        client: {
          creditLimit: clientData.creditLimit,
        },
        provider: null,
      });

      // Clean up
      if (result) {
        await prismaService.client.deleteMany({
          where: { thirdPartyId: result.id },
        });
        await prismaService.thirdParty.delete({
          where: { id: result.id },
        });
      }
    });

    it('should create a provider successfully', async () => {
      const providerData = {
        name: 'Test Provider',
        nit: '87654321-2',
        address: 'Provider Address',
        phones: '987654321',
        email: 'provider@test.com',
        website: 'https://provider.com',
        paymentTerms: 'Net 30',
        bankAccount: '1234567890',
      };

      // Test the service directly
      const thirdPartiesService = app.get(ThirdPartiesService);
      const result = await thirdPartiesService.createProvider(providerData, companyId);

      expect(result).toMatchObject({
        name: providerData.name,
        nit: providerData.nit,
        address: providerData.address,
        phones: providerData.phones,
        email: providerData.email,
        website: providerData.website,
        companyId: companyId,
        client: null,
        provider: {
          paymentTerms: providerData.paymentTerms,
          bankAccount: providerData.bankAccount,
        },
      });

      // Clean up
      if (result) {
        await prismaService.provider.deleteMany({
          where: { thirdPartyId: result.id },
        });
        await prismaService.thirdParty.delete({
          where: { id: result.id },
        });
      }
    });

    it('should find all third parties for a company', async () => {
      // Create test data
      const thirdParty1 = await prismaService.thirdParty.create({
        data: {
          name: 'Test Party 1',
          nit: '11111111-1',
          companyId: companyId,
        },
      });

      const thirdParty2 = await prismaService.thirdParty.create({
        data: {
          name: 'Test Party 2',
          nit: '22222222-2',
          companyId: companyId,
        },
      });

      // Test the service
      const thirdPartiesService = app.get(ThirdPartiesService);
      const result = await thirdPartiesService.findAll(companyId);

      expect(result).toHaveLength(2);
      expect(result[0]).toMatchObject({
        companyId: companyId,
      });
      expect(result[1]).toMatchObject({
        companyId: companyId,
      });

      // Clean up
      await prismaService.thirdParty.deleteMany({
        where: { id: { in: [thirdParty1.id, thirdParty2.id] } },
      });
    });

    it('should find one third party by ID', async () => {
      // Create test data
      const thirdParty = await prismaService.thirdParty.create({
        data: {
          name: 'Test Party',
          nit: '33333333-3',
          companyId: companyId,
        },
      });

      // Test the service
      const thirdPartiesService = app.get(ThirdPartiesService);
      const result = await thirdPartiesService.findOne(thirdParty.id, companyId);

      expect(result).toMatchObject({
        id: thirdParty.id,
        name: 'Test Party',
        nit: '33333333-3',
        companyId: companyId,
      });

      // Clean up
      await prismaService.thirdParty.delete({
        where: { id: thirdParty.id },
      });
    });

    it('should update a third party', async () => {
      // Create test data
      const thirdParty = await prismaService.thirdParty.create({
        data: {
          name: 'Original Name',
          nit: '44444444-4',
          companyId: companyId,
        },
      });

      // Test the service
      const thirdPartiesService = app.get(ThirdPartiesService);
      const updateData = {
        name: 'Updated Name',
        address: 'Updated Address',
      };
      const result = await thirdPartiesService.update(thirdParty.id, updateData, companyId);

      expect(result).toMatchObject({
        id: thirdParty.id,
        name: 'Updated Name',
        address: 'Updated Address',
        nit: '44444444-4', // Should remain unchanged
        companyId: companyId,
      });

      // Clean up
      await prismaService.thirdParty.delete({
        where: { id: thirdParty.id },
      });
    });

    it('should remove a third party', async () => {
      // Create test data
      const thirdParty = await prismaService.thirdParty.create({
        data: {
          name: 'To Delete',
          nit: '55555555-5',
          companyId: companyId,
        },
      });

      // Test the service
      const thirdPartiesService = app.get(ThirdPartiesService);
      const result = await thirdPartiesService.remove(thirdParty.id, companyId);

      expect(result).toMatchObject({
        id: thirdParty.id,
      });

      // Verify it's deleted
      const deleted = await prismaService.thirdParty.findUnique({
        where: { id: thirdParty.id },
      });
      expect(deleted).toBeNull();
    });

    it('should find clients for a company', async () => {
      // Create test data
      const thirdParty = await prismaService.thirdParty.create({
        data: {
          name: 'Client Party',
          nit: '66666666-6',
          companyId: companyId,
        },
      });

      const client = await prismaService.client.create({
        data: {
          creditLimit: 1000,
          thirdPartyId: thirdParty.id,
          companyId: companyId,
        },
      });

      // Test the service
      const thirdPartiesService = app.get(ThirdPartiesService);
      const result = await thirdPartiesService.findClients(companyId);

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        creditLimit: 1000,
        companyId: companyId,
        thirdParty: {
          name: 'Client Party',
          nit: '66666666-6',
        },
      });

      // Clean up
      await prismaService.client.delete({
        where: { id: client.id },
      });
      await prismaService.thirdParty.delete({
        where: { id: thirdParty.id },
      });
    });

    it('should find providers for a company', async () => {
      // Create test data
      const thirdParty = await prismaService.thirdParty.create({
        data: {
          name: 'Provider Party',
          nit: '77777777-7',
          companyId: companyId,
        },
      });

      const provider = await prismaService.provider.create({
        data: {
          paymentTerms: 'Net 30',
          bankAccount: '1234567890',
          thirdPartyId: thirdParty.id,
          companyId: companyId,
        },
      });

      // Test the service
      const thirdPartiesService = app.get(ThirdPartiesService);
      const result = await thirdPartiesService.findProviders(companyId);

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        paymentTerms: 'Net 30',
        bankAccount: '1234567890',
        companyId: companyId,
        thirdParty: {
          name: 'Provider Party',
          nit: '77777777-7',
        },
      });

      // Clean up
      await prismaService.provider.delete({
        where: { id: provider.id },
      });
      await prismaService.thirdParty.delete({
        where: { id: thirdParty.id },
      });
    });

    it('should throw ConflictException when creating client with duplicate NIT', async () => {
      // Create existing third party
      await prismaService.thirdParty.create({
        data: {
          name: 'Existing Party',
          nit: '88888888-8',
          companyId: companyId,
        },
      });

      const clientData = {
        name: 'Duplicate Client',
        nit: '88888888-8', // Same NIT
        creditLimit: 500,
      };

      // Test the service
      const thirdPartiesService = app.get(ThirdPartiesService);
      await expect(thirdPartiesService.createClient(clientData, companyId))
        .rejects
        .toThrow('Ya existe un tercero con este NIT en la empresa');

      // Clean up
      await prismaService.thirdParty.deleteMany({
        where: { nit: '88888888-8' },
      });
    });

    it('should throw NotFoundException when third party not found', async () => {
      const thirdPartiesService = app.get(ThirdPartiesService);
      
      await expect(thirdPartiesService.findOne('non-existent-id', companyId))
        .rejects
        .toThrow('Tercero no encontrado');
    });
  });
});
