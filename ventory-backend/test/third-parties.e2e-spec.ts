import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { PrismaService } from '../src/prisma/prisma.service';
import { AppModule } from '../src/app.module';
import * as request from 'supertest';
import * as bcrypt from 'bcrypt';

describe('Third Parties Integration (e2e)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  let company1Id: string;
  let company2Id: string;
  let adminToken: string;
  let salesToken: string;
  let purchasingToken: string;
  let user2Token: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
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
    // Create companies
    const company1 = await prismaService.company.create({
      data: {
        name: 'Test Company 1',
        slug: 'test-company-1',
        nit: '12345678-1',
        email: 'company1@test.com',
      },
    });
    company1Id = company1.id;

    const company2 = await prismaService.company.create({
      data: {
        name: 'Test Company 2',
        slug: 'test-company-2',
        nit: '87654321-2',
        email: 'company2@test.com',
      },
    });
    company2Id = company2.id;

    // Create roles for company1
    const adminRole = await prismaService.role.create({
      data: {
        name: 'admin',
        companyId: company1Id,
      },
    });

    const salesRole = await prismaService.role.create({
      data: {
        name: 'sales',
        companyId: company1Id,
      },
    });

    const purchasingRole = await prismaService.role.create({
      data: {
        name: 'purchasing',
        companyId: company1Id,
      },
    });

    // Create roles for company2
    const adminRole2 = await prismaService.role.create({
      data: {
        name: 'admin',
        companyId: company2Id,
      },
    });

    // Create users
    const hashedPassword = await bcrypt.hash('password123', 10);

    const admin = await prismaService.user.create({
      data: {
        name: 'Admin User',
        email: 'admin@test.com',
        password: hashedPassword,
        companyId: company1Id,
        roleId: adminRole.id,
        status: 'activo',
      },
    });

    const sales = await prismaService.user.create({
      data: {
        name: 'Sales User',
        email: 'sales@test.com',
        password: hashedPassword,
        companyId: company1Id,
        roleId: salesRole.id,
        status: 'activo',
      },
    });

    const purchasing = await prismaService.user.create({
      data: {
        name: 'Purchasing User',
        email: 'purchasing@test.com',
        password: hashedPassword,
        companyId: company1Id,
        roleId: purchasingRole.id,
        status: 'activo',
      },
    });

    const user2 = await prismaService.user.create({
      data: {
        name: 'User 2',
        email: 'user2@test.com',
        password: hashedPassword,
        companyId: company2Id,
        roleId: adminRole2.id,
        status: 'activo',
      },
    });

    // Get tokens
    adminToken = await getAuthToken('admin@test.com', 'password123');
    salesToken = await getAuthToken('sales@test.com', 'password123');
    purchasingToken = await getAuthToken('purchasing@test.com', 'password123');
    user2Token = await getAuthToken('user2@test.com', 'password123');
  }

  async function getAuthToken(email: string, password: string): Promise<string> {
    const response = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email, password });
    
    return response.body.access_token;
  }

  async function cleanupTestData() {
    // Clean up third parties
    await prismaService.client.deleteMany({
      where: {
        companyId: {
          in: [company1Id, company2Id],
        },
      },
    });

    await prismaService.provider.deleteMany({
      where: {
        companyId: {
          in: [company1Id, company2Id],
        },
      },
    });

    await prismaService.thirdParty.deleteMany({
      where: {
        companyId: {
          in: [company1Id, company2Id],
        },
      },
    });

    // Clean up users
    await prismaService.user.deleteMany({
      where: {
        email: {
          in: ['admin@test.com', 'sales@test.com', 'purchasing@test.com', 'user2@test.com'],
        },
      },
    });

    // Clean up roles
    await prismaService.role.deleteMany({
      where: {
        companyId: {
          in: [company1Id, company2Id],
        },
      },
    });

    // Clean up companies
    await prismaService.company.deleteMany({
      where: {
        id: {
          in: [company1Id, company2Id],
        },
      },
    });
  }

  describe('Client Management', () => {
    let clientId: string | null;

    afterEach(async () => {
      if (clientId) {
        await prismaService.client.deleteMany({
          where: { thirdPartyId: clientId },
        });
        await prismaService.thirdParty.deleteMany({
          where: { id: clientId },
        });
        clientId = null;
      }
    });

    it('should create a client successfully (admin)', async () => {
      const clientData = {
        name: 'Test Client',
        nit: '12345678-1',
        address: 'Test Address',
        phones: '123456789',
        email: 'client@test.com',
        website: 'https://test.com',
        creditLimit: 1000,
      };

      const response = await request(app.getHttpServer())
        .post('/api/third-parties/clients')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(clientData)
        .expect(201);

      expect(response.body).toMatchObject({
        name: clientData.name,
        nit: clientData.nit,
        address: clientData.address,
        phones: clientData.phones,
        email: clientData.email,
        website: clientData.website,
        companyId: company1Id,
        client: {
          creditLimit: clientData.creditLimit,
        },
        provider: null,
      });

      clientId = response.body.id;
    });

    it('should create a client successfully (sales)', async () => {
      const clientData = {
        name: 'Sales Client',
        nit: '12345678-2',
        creditLimit: 500,
      };

      const response = await request(app.getHttpServer())
        .post('/api/third-parties/clients')
        .set('Authorization', `Bearer ${salesToken}`)
        .send(clientData)
        .expect(201);

      expect(response.body).toMatchObject({
        name: clientData.name,
        nit: clientData.nit,
        companyId: company1Id,
        client: {
          creditLimit: clientData.creditLimit,
        },
      });

      clientId = response.body.id;
    });

    it('should not allow purchasing role to create clients', async () => {
      const clientData = {
        name: 'Unauthorized Client',
        nit: '12345678-3',
        creditLimit: 500,
      };

      await request(app.getHttpServer())
        .post('/api/third-parties/clients')
        .set('Authorization', `Bearer ${purchasingToken}`)
        .send(clientData)
        .expect(403);
    });

    it('should not allow creating client with duplicate NIT in same company', async () => {
      const clientData = {
        name: 'Duplicate Client',
        nit: '12345678-1', // Same NIT as first test
        creditLimit: 500,
      };

      await request(app.getHttpServer())
        .post('/api/third-parties/clients')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(clientData)
        .expect(409);
    });
  });

  describe('Provider Management', () => {
    let providerId: string | null;

    afterEach(async () => {
      if (providerId) {
        await prismaService.provider.deleteMany({
          where: { thirdPartyId: providerId },
        });
        await prismaService.thirdParty.deleteMany({
          where: { id: providerId },
        });
        providerId = null;
      }
    });

    it('should create a provider successfully (admin)', async () => {
      const providerData = {
        name: 'Test Provider',
        nit: '87654321-1',
        address: 'Provider Address',
        phones: '987654321',
        email: 'provider@test.com',
        website: 'https://provider.com',
        paymentTerms: 'Net 30',
        bankAccount: '1234567890',
      };

      const response = await request(app.getHttpServer())
        .post('/api/third-parties/providers')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(providerData)
        .expect(201);

      expect(response.body).toMatchObject({
        name: providerData.name,
        nit: providerData.nit,
        address: providerData.address,
        phones: providerData.phones,
        email: providerData.email,
        website: providerData.website,
        companyId: company1Id,
        client: null,
        provider: {
          paymentTerms: providerData.paymentTerms,
          bankAccount: providerData.bankAccount,
        },
      });

      providerId = response.body.id;
    });

    it('should create a provider successfully (purchasing)', async () => {
      const providerData = {
        name: 'Purchasing Provider',
        nit: '87654321-2',
        paymentTerms: 'Net 60',
      };

      const response = await request(app.getHttpServer())
        .post('/api/third-parties/providers')
        .set('Authorization', `Bearer ${purchasingToken}`)
        .send(providerData)
        .expect(201);

      expect(response.body).toMatchObject({
        name: providerData.name,
        nit: providerData.nit,
        companyId: company1Id,
        provider: {
          paymentTerms: providerData.paymentTerms,
        },
      });

      providerId = response.body.id;
    });

    it('should not allow sales role to create providers', async () => {
      const providerData = {
        name: 'Unauthorized Provider',
        nit: '87654321-3',
        paymentTerms: 'Net 30',
      };

      await request(app.getHttpServer())
        .post('/api/third-parties/providers')
        .set('Authorization', `Bearer ${salesToken}`)
        .send(providerData)
        .expect(403);
    });
  });

  describe('Third Parties Listing', () => {
    let testThirdPartyId: string;

    beforeAll(async () => {
      // Create a test third party
      const thirdParty = await prismaService.thirdParty.create({
        data: {
          name: 'Test Third Party',
          nit: '11111111-1',
          companyId: company1Id,
        },
      });
      testThirdPartyId = thirdParty.id;
    });

    afterAll(async () => {
      if (testThirdPartyId) {
        await prismaService.thirdParty.delete({
          where: { id: testThirdPartyId },
        });
      }
    });

    it('should return all third parties for the user company', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/third-parties')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty('companyId', company1Id);
    });

    it('should return only clients for the user company', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/third-parties/clients')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      response.body.forEach(client => {
        expect(client).toHaveProperty('companyId', company1Id);
        expect(client).toHaveProperty('thirdParty');
      });
    });

    it('should return only providers for the user company', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/third-parties/providers')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      response.body.forEach(provider => {
        expect(provider).toHaveProperty('companyId', company1Id);
        expect(provider).toHaveProperty('thirdParty');
      });
    });

    it('should return a specific third party by ID', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/third-parties/${testThirdPartyId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toMatchObject({
        id: testThirdPartyId,
        name: 'Test Third Party',
        nit: '11111111-1',
        companyId: company1Id,
      });
    });

    it('should not return third parties from other companies', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/third-parties')
        .set('Authorization', `Bearer ${user2Token}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      response.body.forEach(thirdParty => {
        expect(thirdParty.companyId).toBe(company2Id);
      });
    });

    it('should return 404 for non-existent third party', async () => {
      await request(app.getHttpServer())
        .get('/api/third-parties/non-existent-id')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });
  });

  describe('Third Party Updates', () => {
    let updateThirdPartyId: string;

    beforeAll(async () => {
      const thirdParty = await prismaService.thirdParty.create({
        data: {
          name: 'Update Test Party',
          nit: '22222222-2',
          companyId: company1Id,
        },
      });
      updateThirdPartyId = thirdParty.id;
    });

    afterAll(async () => {
      if (updateThirdPartyId) {
        await prismaService.thirdParty.delete({
          where: { id: updateThirdPartyId },
        });
      }
    });

    it('should update a third party successfully (admin)', async () => {
      const updateData = {
        name: 'Updated Name',
        address: 'Updated Address',
      };

      const response = await request(app.getHttpServer())
        .patch(`/api/third-parties/${updateThirdPartyId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toMatchObject({
        id: updateThirdPartyId,
        name: updateData.name,
        address: updateData.address,
        nit: '22222222-2', // Should remain unchanged
        companyId: company1Id,
      });
    });

    it('should update a third party successfully (sales)', async () => {
      const updateData = {
        phones: '999999999',
      };

      const response = await request(app.getHttpServer())
        .patch(`/api/third-parties/${updateThirdPartyId}`)
        .set('Authorization', `Bearer ${salesToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.phones).toBe(updateData.phones);
    });

    it('should not allow updating third party from other company', async () => {
      const updateData = {
        name: 'Hacked Name',
      };

      await request(app.getHttpServer())
        .patch(`/api/third-parties/${updateThirdPartyId}`)
        .set('Authorization', `Bearer ${user2Token}`)
        .send(updateData)
        .expect(404);
    });
  });

  describe('Third Party Deletion', () => {
    let deleteThirdPartyId: string;

    beforeEach(async () => {
      const thirdParty = await prismaService.thirdParty.create({
        data: {
          name: 'Delete Test Party',
          nit: '33333333-3',
          companyId: company1Id,
        },
      });
      deleteThirdPartyId = thirdParty.id;
    });

    it('should delete a third party successfully (admin only)', async () => {
      await request(app.getHttpServer())
        .delete(`/api/third-parties/${deleteThirdPartyId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      // Verify it's deleted
      await request(app.getHttpServer())
        .get(`/api/third-parties/${deleteThirdPartyId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });

    it('should not allow sales role to delete third parties', async () => {
      await request(app.getHttpServer())
        .delete(`/api/third-parties/${deleteThirdPartyId}`)
        .set('Authorization', `Bearer ${salesToken}`)
        .expect(403);
    });

    it('should not allow deleting third party from other company', async () => {
      await request(app.getHttpServer())
        .delete(`/api/third-parties/${deleteThirdPartyId}`)
        .set('Authorization', `Bearer ${user2Token}`)
        .expect(404);
    });
  });

  describe('Authentication and Authorization', () => {
    it('should require authentication for all endpoints', async () => {
      await request(app.getHttpServer())
        .get('/api/third-parties')
        .expect(401);

      await request(app.getHttpServer())
        .post('/api/third-parties/clients')
        .send({ name: 'Test', nit: '12345678-1' })
        .expect(401);
    });

    it('should validate required fields', async () => {
      await request(app.getHttpServer())
        .post('/api/third-parties/clients')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({}) // Empty body
        .expect(400);
    });

    it('should validate email format', async () => {
      await request(app.getHttpServer())
        .post('/api/third-parties/clients')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Test Client',
          nit: '12345678-1',
          email: 'invalid-email',
        })
        .expect(400);
    });
  });
});