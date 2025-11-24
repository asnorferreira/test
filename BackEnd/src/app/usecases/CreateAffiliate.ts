import { IAffiliateRepository } from '../../infrastructure/repositories/AffiliateRepository';

export class CreateAffiliate {
  constructor(private affiliates: IAffiliateRepository) {}
  async execute(userId: string, code: string) {
    // code deve ser único; repository já valida via unique index
    return this.affiliates.createForUser(userId, code.toLowerCase());
  }
}
