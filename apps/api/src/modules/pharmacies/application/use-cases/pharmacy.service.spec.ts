import { PharmacyService } from "./pharmacy.service";

describe("PharmacyService", () => {
  const service = new PharmacyService();

  it("retorna lista mockada com pelo menos uma farmácia", async () => {
    const result = await service.findNearby();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
    expect(result[0]).toHaveProperty("id");
    expect(result[0]).toHaveProperty("name");
    expect(result[0]).toHaveProperty("rating");
  });

  it("aceita CEP opcional sem quebrar (mock estável)", async () => {
    const result = await service.findNearby("01310100");
    expect(result.length).toBeGreaterThan(0);
  });
});
