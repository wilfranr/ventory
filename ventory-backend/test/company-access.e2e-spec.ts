import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { PrismaService } from '../src/prisma/prisma.service';
import { AppModule } from '../src/app.module';
import * as request from 'supertest';
import * as bcrypt from 'bcrypt';

describe('Company Access Integration (e2e)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  let company1Id: string;
  let company2Id: string;
  let user1Token: string;
  let user2Token: string;
  let superadminToken: string;

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

    // Create roles for each company
    const role1 = await prismaService.role.create({
      data: {
        name: 'admin',
        companyId: company1Id,
      },
    });

    const role2 = await prismaService.role.create({
      data: {
        name: 'admin',
        companyId: company2Id,
      },
    });

    // Create superadmin role for company1
    const superadminRole = await prismaService.role.create({
      data: {
        name: 'superadmin',
        companyId: company1Id,
      },
    });

    // Create users
    const hashedPassword = await bcrypt.hash('password123', 10);

    const user1 = await prismaService.user.create({
      data: {
        name: 'User 1',
        email: 'user1@test.com',
        password: hashedPassword,
        companyId: company1Id,
        roleId: role1.id,
        status: 'activo',
      },
    });

    const user2 = await prismaService.user.create({
      data: {
        name: 'User 2',
        email: 'user2@test.com',
        password: hashedPassword,
        companyId: company2Id,
        roleId: role2.id,
        status: 'activo',
      },
    });

    const superadmin = await prismaService.user.create({
      data: {
        name: 'Superadmin',
        email: 'superadmin@test.com',
        password: hashedPassword,
        companyId: company1Id,
        roleId: superadminRole.id,
        status: 'activo',
      },
    });

    // Get tokens
    user1Token = await getAuthToken('user1@test.com', 'password123');
    user2Token = await getAuthToken('user2@test.com', 'password123');
    superadminToken = await getAuthToken('superadmin@test.com', 'password123');
  }

  async function getAuthToken(email: string, password: string): Promise<string> {
    const response = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email, password });
    
    return response.body.access_token;
  }

  async function cleanupTestData() {
    await prismaService.user.deleteMany({
      where: {
        email: {
          in: ['user1@test.com', 'user2@test.com', 'superadmin@test.com'],
        },
      },
    });

    await prismaService.role.deleteMany({
      where: {
        companyId: {
          in: [company1Id, company2Id],
        },
      },
    });

    await prismaService.company.deleteMany({
      where: {
        id: {
          in: [company1Id, company2Id],
        },
      },
    });
  }

  describe('List Items - Company Isolation', () => {
    let listItem1Id: string;
    let listItem2Id: string;

    beforeAll(async () => {
      // Create list types for each company
      const listType1 = await prismaService.listType.create({
        data: {
          name: 'Type 1',
          companyId: company1Id,
        },
      });

      const listType2 = await prismaService.listType.create({
        data: {
          name: 'Type 2',
          companyId: company2Id,
        },
      });

      // Create list items for each company
      const listItem1 = await prismaService.listItem.create({
        data: {
          name: 'Item 1',
          listTypeId: listType1.id,
          companyId: company1Id,
        },
      });
      listItem1Id = listItem1.id;

      const listItem2 = await prismaService.listItem.create({
        data: {
          name: 'Item 2',
          listTypeId: listType2.id,
          companyId: company2Id,
        },
      });
      listItem2Id = listItem2.id;
    });

    afterAll(async () => {
      await prismaService.listItem.deleteMany({
        where: {
          id: {
            in: [listItem1Id, listItem2Id],
          },
        },
      });

      await prismaService.listType.deleteMany({
        where: {
          companyId: {
            in: [company1Id, company2Id],
          },
        },
      });
    });

    it('should only return items from user company', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/list-items')
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0].name).toBe('Item 1');
      expect(response.body[0].companyId).toBe(company1Id);
    });

    it('should not allow access to other company items', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/list-items/${listItem2Id}`)
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(404);

      expect(response.body.message).toContain('no encontrado');
    });

    it('should allow superadmin to access any company with header', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/list-items')
        .set('Authorization', `Bearer ${superadminToken}`)
        .set('X-Company-ID', company2Id)
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0].name).toBe('Item 2');
    });
  });

  describe('Users - Company Isolation', () => {
    it('should only return users from same company', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/users')
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0].email).toBe('user1@test.com');
    });

    it('should not allow updating users from other company', async () => {
      const user2 = await prismaService.user.findFirst({
        where: { email: 'user2@test.com' },
      });

      await request(app.getHttpServer())
        .put(`/api/users/${user2.id}`)
        .set('Authorization', `Bearer ${user1Token}`)
        .send({ name: 'Hacked User' })
        .expect(403);
    });
  });

  describe('Company Settings Access', () => {
    it('should allow access to own company settings', async () => {
      await request(app.getHttpServer())
        .get(`/api/companies/${company1Id}/settings`)
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(200);
    });

    it('should not allow access to other company settings', async () => {
      await request(app.getHttpServer())
        .get(`/api/companies/${company2Id}/settings`)
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(403);
    });

    it('should allow superadmin to access any company settings', async () => {
      await request(app.getHttpServer())
        .get(`/api/companies/${company2Id}/settings`)
        .set('Authorization', `Bearer ${superadminToken}`)
        .expect(200);
    });
  });
});
