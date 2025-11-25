import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'libs/prisma/src/prisma.service';
import { UserRole } from '@prisma/client';
import { CreateConnectorDto } from './dtos/create-connector.dto';
import { CryptoService } from 'libs/crypto/crypto.service';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import axios from 'axios';

type CurrentUser = { id: string; tenantId: string; role: UserRole };

@Injectable()
export class ConnectorsService {
  private readonly logger = new Logger(ConnectorsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly cryptoService: CryptoService,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async create(createConnectorDto: CreateConnectorDto, currentUser: CurrentUser) {
    this.logger.log(
      `[${currentUser.tenantId}] criando conector para: ${createConnectorDto.provider}`,
    );

    try {
      await this.validateConnection(createConnectorDto.provider, createConnectorDto.token);
      this.logger.log(
        `[${currentUser.tenantId}] Conexao com ${createConnectorDto.provider} validada com sucesso.`,
      );
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? error.response?.statusText
        : error.message;
      this.logger.warn(
        `[${currentUser.tenantId}] Falha ao validar token: ${message}`,
      );
      throw new BadRequestException(
        `Credencial invalida para ${createConnectorDto.provider}: ${message}`,
      );
    }

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
      throw new NotFoundException('Conector nao encontrado ou sem permissao.');
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
      throw new NotFoundException('Conector nao encontrado.');
    }
    return this.cryptoService.decrypt(connector.encryptedToken);
  }

  private async validateConnection(provider: string, token: string): Promise<void> {
    const normalizedProvider = provider.toLowerCase();
    const isHelenaProvider = ['helena', 'whatsapp', 'ia', 'wts'].some((p) =>
      normalizedProvider.includes(p),
    );
    const isOpenAiProvider = ['openai'].some((p) =>
      normalizedProvider.includes(p),
    );

    if (isHelenaProvider) {
      const helenaApiUrl = this.configService.get<string>('HELENA_API_URL');
      if (!helenaApiUrl) {
        this.logger.error(
          'HELENA_API_URL nao esta configurada no .env do api-gateway.',
        );
        throw new InternalServerErrorException(
          'Configuracao de validacao incompleta.',
        );
      }

      const endpoint = `${helenaApiUrl}/chat/v1/channel`;
      await firstValueFrom(
        this.httpService.get(endpoint, {
          headers: { Authorization: `Basic ${token}` },
          timeout: 5000,
        }),
      );
      return;
    }

    if (isOpenAiProvider) {
      const baseUrl =
        this.configService.get<string>('OPENAI_API_URL') ??
        'https://api.openai.com/v1';
      const endpoint = `${baseUrl.replace(/\/$/, '')}/models`;
      await firstValueFrom(
        this.httpService.get(endpoint, {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 5000,
        }),
      );
      return;
    }

    this.logger.log(`Validacao pulada para o provedor: ${provider}`);
  }
}
