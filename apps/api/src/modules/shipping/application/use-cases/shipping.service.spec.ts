import { Test } from "@nestjs/testing";
import { ShippingService } from "./shipping.service";
import { ViaCepPort } from "../../domain/viacep.port";

describe("ShippingService", () => {
  let service: ShippingService;
  let viaCep: jest.Mocked<ViaCepPort>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        ShippingService,
        { provide: ViaCepPort, useValue: { lookup: jest.fn() } },
      ],
    }).compile();

    service = module.get(ShippingService);
    viaCep = module.get(ViaCepPort);
  });

  it("retorna PAC e SEDEX para CEP do Sudeste com preço mais barato", async () => {
    viaCep.lookup.mockResolvedValue({
      zipCode: "01310100",
      street: "Av Paulista",
      neighborhood: "Bela Vista",
      city: "São Paulo",
      state: "SP",
    });

    const result = await service.quote("01310-100");

    expect(result.address.city).toBe("São Paulo");
    expect(result.options).toHaveLength(2);
    const pac = result.options.find((o) => o.id === "standard");
    const sedex = result.options.find((o) => o.id === "express");
    expect(pac?.priceCents).toBe(1990);
    expect(sedex?.priceCents).toBeGreaterThan(pac!.priceCents);
    expect(pac?.estimatedDays).toBeLessThanOrEqual(5);
  });

  it("usa tarifa maior para estados fora do Sudeste", async () => {
    viaCep.lookup.mockResolvedValue({
      zipCode: "69000000",
      street: "Rua A",
      neighborhood: "Centro",
      city: "Manaus",
      state: "AM",
    });

    const result = await service.quote("69000-000");
    const pac = result.options.find((o) => o.id === "standard")!;
    expect(pac.priceCents).toBeGreaterThanOrEqual(4000);
  });

  it("propaga erro quando CEP inválido é informado pelo ViaCEP", async () => {
    viaCep.lookup.mockRejectedValue(new Error("CEP inválido"));
    await expect(service.quote("00000000")).rejects.toThrow("CEP inválido");
  });
});
