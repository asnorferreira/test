import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from 'libs/prisma/src/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import * as argon2 from 'argon2';
import { RegisterDto, LoginDto } from './dtos';

const mockPrismaService = {
  tenant: {
    findUnique: jest.fn(),
  },
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
};

const mockJwtService = {
  sign: jest.fn(),
};

jest.mock('argon2', () => ({
  hash: jest.fn(),
  verify: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;
  let prisma: PrismaService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    const registerDto: RegisterDto = {
      email: 'test@example.com',
      password: 'password123',
      tenantSlug: 'demo',
      displayName: 'Test User',
    };

    const tenantMock = { id: 'tenant-id-123', slug: 'demo', name: 'Demo' };

    it('should successfully register a new user', async () => {
      mockPrismaService.tenant.findUnique.mockResolvedValue(tenantMock);
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      (argon2.hash as jest.Mock).mockResolvedValue('hashed_password');
      
      const createdUser = {
        id: 'user-id-456',
        email: registerDto.email,
        role: UserRole.ATENDENTE,
      };
      mockPrismaService.user.create.mockResolvedValue(createdUser);

      const result = await service.register(registerDto);

      expect(prisma.tenant.findUnique).toHaveBeenCalledWith({ where: { slug: 'demo' } });
      expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { tenantId_email: { tenantId: tenantMock.id, email: registerDto.email } } });
      expect(argon2.hash).toHaveBeenCalledWith(registerDto.password);
      expect(prisma.user.create).toHaveBeenCalled();
      expect(result).toEqual(createdUser);
    });

    it('should throw BadRequestException if tenant is not found', async () => {
      mockPrismaService.tenant.findUnique.mockResolvedValue(null);

      await expect(service.register(registerDto)).rejects.toThrow(
        new BadRequestException('Tenant inválido.'),
      );
    });

    it('should throw BadRequestException if user already exists', async () => {
      mockPrismaService.tenant.findUnique.mockResolvedValue(tenantMock);
      mockPrismaService.user.findUnique.mockResolvedValue({ id: 'existing-user' });

      await expect(service.register(registerDto)).rejects.toThrow(
        new BadRequestException('O e-mail já está em uso neste tenant.'),
      );
    });
  });

  describe('login', () => {
    const loginDto: LoginDto = {
      email: 'test@example.com',
      password: 'password123',
      tenantSlug: 'demo',
    };

    const tenantMock = { id: 'tenant-id-123', slug: 'demo', name: 'Demo' };
    const userMock = {
      id: 'user-id-456',
      email: 'test@example.com',
      passwordHash: 'hashed_password',
      role: UserRole.ATENDENTE,
    };

    it('should successfully log in and return an access token', async () => {
      mockPrismaService.tenant.findUnique.mockResolvedValue(tenantMock);
      mockPrismaService.user.findUnique.mockResolvedValue(userMock);
      (argon2.verify as jest.Mock).mockResolvedValue(true);
      mockJwtService.sign.mockReturnValue('mock_jwt_token');

      const result = await service.login(loginDto);

      expect(prisma.tenant.findUnique).toHaveBeenCalledWith({ where: { slug: 'demo' } });
      expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { tenantId_email: { tenantId: tenantMock.id, email: loginDto.email } } });
      expect(argon2.verify).toHaveBeenCalledWith(userMock.passwordHash, loginDto.password);
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: userMock.id,
        email: userMock.email,
        role: userMock.role,
      });
      expect(result).toEqual({ access_token: 'mock_jwt_token' });
    });

    it('should throw UnauthorizedException if tenant is not found', async () => {
      mockPrismaService.tenant.findUnique.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(
        new UnauthorizedException('Credenciais inválidas.'),
      );
    });

    it('should throw UnauthorizedException if user is not found', async () => {
      mockPrismaService.tenant.findUnique.mockResolvedValue(tenantMock);
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(
        new UnauthorizedException('Credenciais inválidas.'),
      );
    });

    it('should throw UnauthorizedException if password is not valid', async () => {
      mockPrismaService.tenant.findUnique.mockResolvedValue(tenantMock);
      mockPrismaService.user.findUnique.mockResolvedValue(userMock);
      (argon2.verify as jest.Mock).mockResolvedValue(false);

      await expect(service.login(loginDto)).rejects.toThrow(
        new UnauthorizedException('Credenciais inválidas.'),
      );
    });
  });
});