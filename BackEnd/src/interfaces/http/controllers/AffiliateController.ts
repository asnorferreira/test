import { Request, Response } from 'express';
import { PrismaAffiliateRepository } from '../../../infrastructure/repositories/impl/PrismaAffiliateRepository';
import { CreateAffiliate } from '../../../app/usecases/CreateAffiliate';
import { IncrementAffiliateClick } from '../../../app/usecases/IncrementAffiliateClick';
import { env } from '../../../config/env';

const affiliates = new PrismaAffiliateRepository();

export class AffiliateController {
  static async create(req: Request, res: Response) {
    try {
      const { code } = req.body; // exemplo: "meu-codigo"
      const userId = (req as any).user.sub as string;
      const uc = new CreateAffiliate(affiliates);
      const aff = await uc.execute(userId, code);
      return res.status(201).json({
        id: aff.id,
        code: aff.code,
        link: `${env.APP_BASE_URL}/r/${aff.code}`
      });
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  // endpoint público para redirecionar e contar clique
  static async redirect(req: Request, res: Response) {
    try {
      const code = req.params.code;
      const inc = new IncrementAffiliateClick(affiliates);
      await inc.execute(code, req.ip, req.headers['user-agent']);
      const url = new URL(env.SIGNUP_URL);
      url.searchParams.set('ref', code);
      return res.redirect(302, url.toString());
    } catch {
      return res.status(404).send('Código de afiliado inválido');
    }
  }
}
