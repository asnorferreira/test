import { Injectable } from "@nestjs/common";

export interface PartnerPharmacy {
  id: string;
  name: string;
  cnpj: string;
  city: string;
  state: string;
  distanceKm: number;
  estimatedDeliveryDays: number;
  rating: number;
}

const MOCK_PHARMACIES: PartnerPharmacy[] = [
  {
    id: "farm-001",
    name: "Farmácia Mãe+ Paulista",
    cnpj: "12.345.678/0001-90",
    city: "São Paulo",
    state: "SP",
    distanceKm: 3.2,
    estimatedDeliveryDays: 2,
    rating: 4.9,
  },
  {
    id: "farm-002",
    name: "Drogaria Bem Estar",
    cnpj: "98.765.432/0001-10",
    city: "Rio de Janeiro",
    state: "RJ",
    distanceKm: 8.7,
    estimatedDeliveryDays: 3,
    rating: 4.7,
  },
  {
    id: "farm-003",
    name: "Farma Cuidar Premium",
    cnpj: "45.678.123/0001-22",
    city: "Belo Horizonte",
    state: "MG",
    distanceKm: 12.4,
    estimatedDeliveryDays: 4,
    rating: 4.6,
  },
];

@Injectable()
export class PharmacyService {
  async findNearby(zipCode?: string): Promise<PartnerPharmacy[]> {
    // TODO: substituir por consulta real baseada em geolocalização / parceiros cadastrados.
    // Por enquanto, retorna lista mockada — o CEP é recebido pra manter contrato estável.
    void zipCode;
    return MOCK_PHARMACIES;
  }
}
