import { Affiliate } from '@prisma/client';

export interface IAffiliateRepository {
  findByCode(code: string): Promise<Affiliate | null>;
  findByUserId(userId: string): Promise<Affiliate | null>;
  createForUser(userId: string, code: string): Promise<Affiliate>;
  incrementClick(affiliateId: string, ip?: string, userAgent?: string): Promise<void>;
  incrementSignup(affiliateId: string): Promise<void>;
}
