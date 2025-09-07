import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

// Mock bcrypt
jest.mock('bcrypt');
const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

describe('UsersService', () => {
  let service: UsersService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    user: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    role: {
      findFirst: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a user with hashed password', async () => {
      const createDto: CreateUserDto = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      };
      const companyId = 'company-1';
      const hashedPassword = 'hashed-password';
      const expectedResult = { id: 'user-1', ...createDto, password: hashedPassword, companyId };

      (mockedBcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
      mockPrismaService.user.create.mockResolvedValue(expectedResult);

      const result = await service.create(createDto, companyId);

      expect(mockedBcrypt.hash).toHaveBeenCalledWith('password123', 10);
      expect(mockPrismaService.user.create).toHaveBeenCalledWith({
        data: {
          name: createDto.name,
          email: createDto.email,
          password: hashedPassword,
          companyId,
        },
      });
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findByEmail', () => {
    it('should find user by email with relations', async () => {
      const email = 'test@example.com';
      const expectedResult = {
        id: 'user-1',
        email,
        role: { id: 'role-1', name: 'admin' },
        company: { id: 'company-1', name: 'Test Company', logo: 'logo.png' },
      };

      mockPrismaService.user.findUnique.mockResolvedValue(expectedResult);

      const result = await service.findByEmail(email);

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email },
        include: {
          role: {
            include: {
              permissions: true,
            },
          },
          company: {
            select: {
              id: true,
              name: true,
              logo: true,
            },
          },
        },
      });
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findAll', () => {
    it('should find all users for a company', async () => {
      const companyId = 'company-1';
      const expectedResult = [
        { id: 'user-1', name: 'User 1', email: 'user1@example.com', companyId },
        { id: 'user-2', name: 'User 2', email: 'user2@example.com', companyId },
      ];

      mockPrismaService.user.findMany.mockResolvedValue(expectedResult);

      const result = await service.findAll(companyId);

      expect(mockPrismaService.user.findMany).toHaveBeenCalledWith({
        where: { companyId },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          status: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
      expect(result).toEqual(expectedResult);
    });

    it('should return empty array when no companyId provided', async () => {
      const result = await service.findAll('');

      expect(result).toEqual([]);
      // El método verifica !companyId, así que no llama a findMany
    });
  });

  describe('updateUser', () => {
    it('should update user successfully when user belongs to company', async () => {
      const id = 'user-1';
      const companyId = 'company-1';
      const updateDto: UpdateUserDto = {
        name: 'Updated User',
        email: 'updated@example.com',
        status: 'activo',
      };
      const existingUser = { id, companyId, name: 'Original User' };
      const expectedResult = { id, ...updateDto };

      mockPrismaService.user.findFirst.mockResolvedValue(existingUser);
      mockPrismaService.user.update.mockResolvedValue(expectedResult);

      const result = await service.updateUser(id, updateDto, companyId);

      expect(mockPrismaService.user.findFirst).toHaveBeenCalledWith({
        where: { id, companyId },
      });
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id },
        data: {
          name: updateDto.name,
          email: updateDto.email,
          status: updateDto.status,
        },
      });
      expect(result).toEqual(expectedResult);
    });

    it('should throw BadRequestException when user does not belong to company', async () => {
      const id = 'user-1';
      const companyId = 'company-1';
      const updateDto: UpdateUserDto = { name: 'Updated User' };

      mockPrismaService.user.findFirst.mockResolvedValue(null);

      await expect(service.updateUser(id, updateDto, companyId)).rejects.toThrow(
        BadRequestException
      );
    });

    it('should update user with role when role belongs to same company', async () => {
      const id = 'user-1';
      const companyId = 'company-1';
      const updateDto: UpdateUserDto = {
        name: 'Updated User',
        role: 'role-1',
      };
      const existingUser = { id, companyId };
      const existingRole = { id: 'role-1', companyId };
      const expectedResult = { id, ...updateDto };

      mockPrismaService.user.findFirst.mockResolvedValue(existingUser);
      mockPrismaService.role.findFirst.mockResolvedValue(existingRole);
      mockPrismaService.user.update.mockResolvedValue(expectedResult);

      const result = await service.updateUser(id, updateDto, companyId);

      expect(mockPrismaService.role.findFirst).toHaveBeenCalledWith({
        where: { id: 'role-1', companyId },
      });
      expect(result).toEqual(expectedResult);
    });

    it('should throw BadRequestException when role does not belong to company', async () => {
      const id = 'user-1';
      const companyId = 'company-1';
      const updateDto: UpdateUserDto = {
        name: 'Updated User',
        role: 'role-1',
      };
      const existingUser = { id, companyId };

      mockPrismaService.user.findFirst.mockResolvedValue(existingUser);
      mockPrismaService.role.findFirst.mockResolvedValue(null);

      await expect(service.updateUser(id, updateDto, companyId)).rejects.toThrow(
        BadRequestException
      );
    });
  });

  describe('updateRefreshToken', () => {
    it('should update refresh token with hashed value', async () => {
      const userId = 'user-1';
      const refreshToken = 'refresh-token';
      const hashedToken = 'hashed-refresh-token';

      (mockedBcrypt.hash as jest.Mock).mockResolvedValue(hashedToken);
      mockPrismaService.user.update.mockResolvedValue({ id: userId });

      await service.updateRefreshToken(userId, refreshToken);

      expect(mockedBcrypt.hash).toHaveBeenCalledWith(refreshToken, 10);
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: { refreshToken: hashedToken },
      });
    });
  });
});