import { IAffiliateRepository } from '../../infrastructure/repositories/AffiliateRepository';

export class IncrementAffiliateClick {
  constructor(private affiliates: IAffiliateRepository) {}
  async execute(code: string, ip?: string, userAgent?: string) {
    const aff = await this.affiliates.findByCode(code);
    if (!aff) throw new Error('Código inválido');
    await this.affiliates.incrementClick(aff.id, ip, userAgent);
    return aff;
  }
}
