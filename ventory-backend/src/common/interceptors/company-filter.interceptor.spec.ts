import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, CallHandler } from '@nestjs/common';
import { of } from 'rxjs';
import { CompanyFilterInterceptor } from './company-filter.interceptor';
import { PrismaService } from '../../prisma/prisma.service';
import { BadRequestException } from '@nestjs/common';

describe('CompanyFilterInterceptor', () => {
  let interceptor: CompanyFilterInterceptor;
  let prismaService: PrismaService;
  let mockExecutionContext: ExecutionContext;
  let mockCallHandler: CallHandler;

  const mockPrismaService = {
    company: {
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CompanyFilterInterceptor,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    interceptor = module.get<CompanyFilterInterceptor>(CompanyFilterInterceptor);
    prismaService = module.get<PrismaService>(PrismaService);

    mockCallHandler = {
      handle: jest.fn().mockReturnValue(of('test result')),
    };
  });

  beforeEach(() => {
    mockExecutionContext = {
      switchToHttp: () => ({
        getRequest: () => ({
          user: {
            id: 'user-1',
            companyId: 'company-1',
            role: 'admin',
          },
          headers: {},
        }),
      }),
    } as ExecutionContext;
  });

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  it('should pass through when no user is authenticated', async () => {
    const requestWithoutUser = {
      switchToHttp: () => ({
        getRequest: () => ({
          user: null,
          headers: {},
        }),
      }),
    } as ExecutionContext;

    const result = await interceptor.intercept(requestWithoutUser, mockCallHandler);
    
    expect(mockCallHandler.handle).toHaveBeenCalled();
    expect(result).toBeDefined();
  });

  it('should throw BadRequestException when user has no companyId', async () => {
    const requestWithoutCompany = {
      switchToHttp: () => ({
        getRequest: () => ({
          user: {
            id: 'user-1',
            companyId: null,
            role: 'admin',
          },
          headers: {},
        }),
      }),
    } as ExecutionContext;

    await expect(
      interceptor.intercept(requestWithoutCompany, mockCallHandler)
    ).rejects.toThrow(BadRequestException);
  });

  it('should set activeCompanyId from user companyId for normal users', async () => {
    const mockRequest: any = {
      user: {
        id: 'user-1',
        companyId: 'company-1',
        role: 'admin',
      },
      headers: {},
    };

    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
      }),
    } as ExecutionContext;

    await interceptor.intercept(mockContext, mockCallHandler);

    expect(mockRequest.activeCompanyId).toBe('company-1');
    expect(mockCallHandler.handle).toHaveBeenCalled();
  });

  it('should use header companyId for superadmin when provided', async () => {
    mockPrismaService.company.findUnique.mockResolvedValue({ id: 'company-2' });

    const mockRequest: any = {
      user: {
        id: 'user-1',
        companyId: 'company-1',
        role: 'superadmin',
      },
      headers: {
        'x-company-id': 'company-2',
      },
    };

    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
      }),
    } as ExecutionContext;

    await interceptor.intercept(mockContext, mockCallHandler);

    expect(mockPrismaService.company.findUnique).toHaveBeenCalledWith({
      where: { id: 'company-2' },
    });
    expect(mockRequest.activeCompanyId).toBe('company-2');
  });

  it('should fallback to user companyId for superadmin when no header provided', async () => {
    const mockRequest: any = {
      user: {
        id: 'user-1',
        companyId: 'company-1',
        role: 'superadmin',
      },
      headers: {},
    };

    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
      }),
    } as ExecutionContext;

    await interceptor.intercept(mockContext, mockCallHandler);

    expect(mockRequest.activeCompanyId).toBe('company-1');
  });

  it('should throw BadRequestException when superadmin provides non-existent company', async () => {
    mockPrismaService.company.findUnique.mockResolvedValue(null);

    const mockRequest = {
      user: {
        id: 'user-1',
        companyId: 'company-1',
        role: 'superadmin',
      },
      headers: {
        'x-company-id': 'non-existent-company',
      },
    };

    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
      }),
    } as ExecutionContext;

    await expect(
      interceptor.intercept(mockContext, mockCallHandler)
    ).rejects.toThrow(BadRequestException);
  });
});
