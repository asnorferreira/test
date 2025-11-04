import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import {
  ILicenseServerGateway,
  LicenseValidationPayload,
  LicenseValidationResult,
} from '@app/domain';
import { ServicesConfig } from '@infrastructure/config/config.service';
import { firstValueFrom } from 'rxjs';
import { StatusLicenca } from '@prisma/client';

@Injectable()
export class HttpLicenseServerGateway implements ILicenseServerGateway {
  private readonly logger = new Logger(HttpLicenseServerGateway.name);
  private readonly config: ServicesConfig['licenseServer'];

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.config = this.configService.get<ServicesConfig['licenseServer']>(
      'services.licenseServer',
      { infer: true },
    );
  }

  /**
   * Valida (ativa/verifica) uma licença contra o servidor central.
   */
  async validate(
    payload: LicenseValidationPayload,
  ): Promise<LicenseValidationResult> {
    const url = `${this.config.url}/validate`;
    
    try {
      this.logger.log(`Validando licença [${payload.chave}] contra [${url}]`);
      
      const response = await firstValueFrom(
        this.httpService.post(
          url,
          {
            chave: payload.chave,
            boundInfo: payload.boundInfo,
          },
          {
            headers: {
              'X-Api-Key': this.config.apiKey,
            },
          },
        ),
      );

      const data = response.data;

      // Traduz a resposta do servidor externo para o nosso modelo
      return {
        status: data.status, // ATIVA, EXPIRADA, etc.
        modulos: data.modulos, // { "facial": true, "maxDevices": 10 }
        validade: new Date(data.validade),
      };

    } catch (error) {
      this.logger.error(
        `Falha ao validar licença [${payload.chave}]`,
        error.response?.data || error.message,
      );
      // Em caso de falha na comunicação, assume modo de graça (ou bloqueia)
      return {
        status: StatusLicenca.MODO_GRACA, // (Decisão de negócio)
        modulos: {},
        validade: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24h de graça
        message: 'Falha na comunicação com o servidor de licenças',
      };
    }
  }
}