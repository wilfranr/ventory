import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, ForbiddenException, BadRequestException } from '@nestjs/common';
import { CompanyAccessGuard } from './company-access.guard';
import { PrismaService } from '../../prisma/prisma.service';

describe('CompanyAccessGuard', () => {
  let guard: CompanyAccessGuard;
  let prismaService: PrismaService;

  const mockPrismaService = {
    user: {
      findFirst: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CompanyAccessGuard,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    guard = module.get<CompanyAccessGuard>(CompanyAccessGuard);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should throw ForbiddenException when user is not authenticated', async () => {
    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => ({
          user: null,
          activeCompanyId: 'company-1',
        }),
      }),
    } as ExecutionContext;

    await expect(guard.canActivate(mockContext)).rejects.toThrow(ForbiddenException);
  });

  it('should throw BadRequestException when activeCompanyId is not set', async () => {
    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => ({
          user: {
            id: 'user-1',
            companyId: 'company-1',
            role: 'admin',
          },
          activeCompanyId: null,
        }),
      }),
    } as ExecutionContext;

    await expect(guard.canActivate(mockContext)).rejects.toThrow(BadRequestException);
  });

  it('should allow access for superadmin regardless of company', async () => {
    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => ({
          user: {
            id: 'user-1',
            companyId: 'company-1',
            role: 'superadmin',
          },
          activeCompanyId: 'company-2',
        }),
      }),
    } as ExecutionContext;

    const result = await guard.canActivate(mockContext);
    expect(result).toBe(true);
  });

  it('should allow access when user belongs to active company', async () => {
    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => ({
          user: {
            id: 'user-1',
            companyId: 'company-1',
            role: 'admin',
          },
          activeCompanyId: 'company-1',
        }),
      }),
    } as ExecutionContext;

    const result = await guard.canActivate(mockContext);
    expect(result).toBe(true);
  });

  it('should throw ForbiddenException when user does not belong to active company', async () => {
    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => ({
          user: {
            id: 'user-1',
            companyId: 'company-1',
            role: 'admin',
          },
          activeCompanyId: 'company-2',
        }),
      }),
    } as ExecutionContext;

    await expect(guard.canActivate(mockContext)).rejects.toThrow(ForbiddenException);
  });

  it('should handle undefined activeCompanyId', async () => {
    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => ({
          user: {
            id: 'user-1',
            companyId: 'company-1',
            role: 'admin',
          },
          activeCompanyId: undefined,
        }),
      }),
    } as ExecutionContext;

    await expect(guard.canActivate(mockContext)).rejects.toThrow(BadRequestException);
  });
});
