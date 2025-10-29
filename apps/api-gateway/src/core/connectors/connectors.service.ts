import { Injectable, Logger, NotFoundException, ForbiddenException, Inject } from '@nestjs/common';
import { PrismaService } from 'libs/prisma/src/prisma.service';
import { UserRole } from '@prisma/client';
import { CreateConnectorDto } from './dtos/create-connector.dto';
import { CryptoService } from 'libs/crypto/crypto.service';

type CurrentUser = { id: string; tenantId: string; role: UserRole };

@Injectable()
export class ConnectorsService {
  private readonly logger = new Logger(ConnectorsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly cryptoService: CryptoService,
  ) {}

  async create(createConnectorDto: CreateConnectorDto, currentUser: CurrentUser) {
    this.logger.log(`[${currentUser.tenantId}] criando conector para: ${createConnectorDto.provider}`);

    const encryptedToken = this.cryptoService.encrypt(createConnectorDto.token);

    const connector = await this.prisma.connector.create({
      data: {
        provider: createConnectorDto.provider,
        name: createConnectorDto.name,
        tenantId: currentUser.tenantId,
        encryptedToken: encryptedToken,
      },
      select: { id: true, provider: true, name: true },
    });

    return connector;
  }

  async findAll(currentUser: CurrentUser) {
    return this.prisma.connector.findMany({
      where: { tenantId: currentUser.tenantId },
      select: { id: true, provider: true, name: true },
      orderBy: { name: 'asc' },
    });
  }

  async remove(id: string, currentUser: CurrentUser) {
    this.logger.log(`[${currentUser.tenantId}] removendo conector: ${id}`);

    const connector = await this.prisma.connector.findFirst({
      where: { id, tenantId: currentUser.tenantId },
    });

    if (!connector) {
      throw new NotFoundException('Conector não encontrado ou sem permissão.');
    }

    await this.prisma.connector.delete({
      where: { id: connector.id },
    });
  }

  async getDecryptedToken(id: string, tenantId: string): Promise<string> {
    const connector = await this.prisma.connector.findFirst({
      where: { id, tenantId },
    });
    if (!connector) {
      throw new NotFoundException('Conector não encontrado.');
    }
    return this.cryptoService.decrypt(connector.encryptedToken);
  }
}
