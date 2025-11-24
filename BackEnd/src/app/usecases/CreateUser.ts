import { IUserRepository } from '../../infrastructure/repositories/UserRepository';
import { IAffiliateRepository } from '../../infrastructure/repositories/AffiliateRepository';
import { CreateAffiliate } from './CreateAffiliate';
import { hashPassword } from '../../domain/services/password';
import { generateAffiliateCode } from '../../domain/services/codeGenerator';
import { Role } from '@prisma/client';

type Input = {
  name: string; email: string; password: string; role?: Role; referralCode?: string;
};

export class CreateUser {
  constructor(private users: IUserRepository, private affiliates: IAffiliateRepository, private createAffiliate: CreateAffiliate) { }
  async execute(input: Input) {
    const exists = await this.users.findByEmail(input.email);
    if (exists) throw new Error('Email já cadastrado.');
    const passwordHash = await hashPassword(input.password);

    let referredById: string | undefined;
    if (input.referralCode) {
      const aff = await this.affiliates.findByCode(input.referralCode);
      if (!aff) throw new Error('Código de afiliado inválido.');
      referredById = aff.id;
    }

    const user = await this.users.create({
      name: input.name,
      email: input.email,
      passwordHash,
      role: input.role || 'USER',
      referredById: referredById || null,
    });

    if (referredById) {
      await this.affiliates.incrementSignup(referredById);
    }
    const newAffiliateCode = generateAffiliateCode(user.id);
    await this.createAffiliate.execute(user.id, newAffiliateCode);

    return user;
  }
}
