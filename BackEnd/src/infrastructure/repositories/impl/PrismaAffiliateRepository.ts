import { prisma } from '../../db/prismaClient';
import { IAffiliateRepository } from '../AffiliateRepository';

export class PrismaAffiliateRepository implements IAffiliateRepository {
  findByCode(code: string) { return prisma.affiliate.findUnique({ where: { code } }); }
  findByUserId(userId: string) { return prisma.affiliate.findUnique({ where: { userId } }); }
  createForUser(userId: string, code: string) {
    return prisma.affiliate.create({ data: { userId, code } });
  }
  async incrementClick(affiliateId: string, ip?: string, userAgent?: string) {
    await prisma.$transaction([
      prisma.affiliate.update({ where: { id: affiliateId }, data: { clicks: { increment: 1 } } }),
      prisma.referralVisit.create({ data: { affiliateId, ip, userAgent } }),
    ]);
  }
  incrementSignup(affiliateId: string) {
    return prisma.affiliate.update({ where: { id: affiliateId }, data: { signups: { increment: 1 } } });
  }
}
