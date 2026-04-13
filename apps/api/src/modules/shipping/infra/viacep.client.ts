import { Injectable, BadRequestException, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Env } from "@/config/env.config";
import { ViaCepAddress, ViaCepPort } from "../domain/viacep.port";

interface ViaCepRawResponse {
  cep?: string;
  logradouro?: string;
  bairro?: string;
  localidade?: string;
  uf?: string;
  erro?: boolean;
}

@Injectable()
export class ViaCepClient implements ViaCepPort {
  private readonly logger = new Logger(ViaCepClient.name);

  constructor(private readonly configService: ConfigService<Env, true>) {}

  async lookup(zipCode: string): Promise<ViaCepAddress> {
    const clean = zipCode.replace(/\D/g, "");
    if (clean.length !== 8) {
      throw new BadRequestException("CEP inválido. Use 8 dígitos.");
    }

    const baseUrl = this.configService.get("VIACEP_API_URL", { infer: true });
    const url = `${baseUrl}/${clean}/json/`;

    try {
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`ViaCEP respondeu ${res.status}`);
      }
      const data = (await res.json()) as ViaCepRawResponse;
      if (data.erro) {
        throw new BadRequestException("CEP não encontrado.");
      }
      return {
        zipCode: clean,
        street: data.logradouro ?? "",
        neighborhood: data.bairro ?? "",
        city: data.localidade ?? "",
        state: data.uf ?? "",
      };
    } catch (err: any) {
      if (err instanceof BadRequestException) throw err;
      this.logger.error(`Falha ao consultar ViaCEP: ${err.message}`);
      throw new BadRequestException(
        "Não foi possível consultar o CEP no momento.",
      );
    }
  }
}
