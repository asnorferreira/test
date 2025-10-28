import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from 'libs/prisma/src/prisma.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import * as argon2 from 'argon2';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';

const mockPrismaService = {
  tenant: {
    findUnique: jest.fn(),
  },
  user: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

jest.mock('argon2', () => ({
  hash: jest.fn(),
  verify: jest.fn(),
}));

describe('UsersService', () => {
  let service: UsersService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createUserDto: CreateUserDto = {
      email: 'test@example.com',
      password: 'password123',
      tenantSlug: 'demo',
    };
    const tenantMock = { id: 'tenant-id-123', slug: 'demo', name: 'Demo' };

    it('should create and return a user', async () => {
      mockPrismaService.tenant.findUnique.mockResolvedValue(tenantMock);
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      (argon2.hash as jest.Mock).mockResolvedValue('hashed_password');
      
      const expectedUser = { id: 'user-id-1', email: createUserDto.email };
      mockPrismaService.user.create.mockResolvedValue(expectedUser);

      const result = await service.create(createUserDto);

      expect(prisma.tenant.findUnique).toHaveBeenCalledWith({ where: { slug: 'demo' } });
      expect(argon2.hash).toHaveBeenCalledWith('password123');
      expect(prisma.user.create).toHaveBeenCalled();
      expect(result).toEqual(expectedUser);
    });

    it('should throw BadRequestException if tenant does not exist', async () => {
      mockPrismaService.tenant.findUnique.mockResolvedValue(null);
      await expect(service.create(createUserDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if user already exists', async () => {
      mockPrismaService.tenant.findUnique.mockResolvedValue(tenantMock);
      mockPrismaService.user.findUnique.mockResolvedValue({ id: 'existing-user' });
      await expect(service.create(createUserDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const usersArray = [{ id: '1' }, { id: '2' }];
      mockPrismaService.user.findMany.mockResolvedValue(usersArray);

      const result = await service.findAll();
      expect(result).toEqual(usersArray);
      expect(prisma.user.findMany).toHaveBeenCalledTimes(1);
    });
  });

  describe('findOne', () => {
    it('should find and return a single user', async () => {
      const user = { id: 'user-id-1' };
      mockPrismaService.user.findUnique.mockResolvedValue(user);

      const result = await service.findOne('user-id-1');
      expect(result).toEqual(user);
      expect(prisma.user.findUnique).toHaveBeenCalledWith(expect.objectContaining({ where: { id: 'user-id-1' } }));
    });

    it('should throw NotFoundException if user is not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      await expect(service.findOne('non-existent-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    const userId = 'user-id-1';
    const updateUserDto: UpdateUserDto = { email: 'new@example.com' };

    it('should update and return the user data', async () => {
      const updatedUser = { id: userId, ...updateUserDto };
      mockPrismaService.user.update.mockResolvedValue(updatedUser);

      const result = await service.update(userId, updateUserDto);
      expect(prisma.user.update).toHaveBeenCalledWith(expect.objectContaining({ where: { id: userId }, data: updateUserDto }));
      expect(result).toEqual(updatedUser);
    });

    it('should hash the password if provided', async () => {
      const dtoWithPassword: UpdateUserDto = { password: 'newPassword' };
      (argon2.hash as jest.Mock).mockResolvedValue('new_hashed_password');
      mockPrismaService.user.update.mockResolvedValue({ id: userId });

      await service.update(userId, dtoWithPassword);
      
      expect(argon2.hash).toHaveBeenCalledWith('newPassword');
      expect(prisma.user.update).toHaveBeenCalledWith(expect.objectContaining({
        data: { passwordHash: 'new_hashed_password' },
      }));
    });

    it('should throw NotFoundException if user to update is not found', async () => {
      mockPrismaService.user.update.mockRejectedValue(new Error());
      await expect(service.update('non-existent-id', updateUserDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should successfully delete a user', async () => {
      mockPrismaService.user.delete.mockResolvedValue({ id: 'user-id-1' });
      await expect(service.remove('user-id-1')).resolves.toBeUndefined();
      expect(prisma.user.delete).toHaveBeenCalledWith({ where: { id: 'user-id-1' } });
    });

    it('should throw NotFoundException if user to remove is not found', async () => {
      mockPrismaService.user.delete.mockRejectedValue(new Error());
      await expect(service.remove('non-existent-id')).rejects.toThrow(NotFoundException);
    });
  });
});