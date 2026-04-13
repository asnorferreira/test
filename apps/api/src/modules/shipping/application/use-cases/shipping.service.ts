import { Injectable } from "@nestjs/common";
import { ViaCepPort } from "../../domain/viacep.port";

export interface ShippingQuoteOption {
  id: string;
  carrier: string;
  service: string;
  priceCents: number;
  estimatedDays: number;
}

export interface ShippingQuoteResult {
  zipCode: string;
  address: {
    street: string;
    neighborhood: string;
    city: string;
    state: string;
  };
  options: ShippingQuoteOption[];
}

@Injectable()
export class ShippingService {
  constructor(private readonly viaCep: ViaCepPort) {}

  async quote(zipCode: string): Promise<ShippingQuoteResult> {
    const address = await this.viaCep.lookup(zipCode);

    // Tabela regional simples por UF. Pode ser substituído por Correios/Melhor Envio futuramente.
    const options = this.buildOptionsForState(address.state);

    return {
      zipCode: address.zipCode,
      address: {
        street: address.street,
        neighborhood: address.neighborhood,
        city: address.city,
        state: address.state,
      },
      options,
    };
  }

  private buildOptionsForState(state: string): ShippingQuoteOption[] {
    const southeast = ["SP", "RJ", "MG", "ES"];
    const south = ["PR", "SC", "RS"];
    const midwest = ["GO", "MT", "MS", "DF"];

    let base = 4990; // fallback Norte/Nordeste
    let expressExtra = 2500;
    let daysStandard = 8;
    let daysExpress = 4;

    if (southeast.includes(state)) {
      base = 1990;
      expressExtra = 1500;
      daysStandard = 4;
      daysExpress = 2;
    } else if (south.includes(state)) {
      base = 2990;
      expressExtra = 1800;
      daysStandard = 5;
      daysExpress = 3;
    } else if (midwest.includes(state)) {
      base = 3490;
      expressExtra = 2000;
      daysStandard = 6;
      daysExpress = 3;
    }

    return [
      {
        id: "standard",
        carrier: "Correios",
        service: "PAC",
        priceCents: base,
        estimatedDays: daysStandard,
      },
      {
        id: "express",
        carrier: "Correios",
        service: "SEDEX",
        priceCents: base + expressExtra,
        estimatedDays: daysExpress,
      },
    ];
  }
}
