import { Request, Response } from 'express';
import { PrismaUserRepository } from '../../../infrastructure/repositories/impl/PrismaUserRepository';
import { PrismaAffiliateRepository } from '../../../infrastructure/repositories/impl/PrismaAffiliateRepository';
import { CreateUser } from '../../../app/usecases/CreateUser';

const users = new PrismaUserRepository();
const affiliates = new PrismaAffiliateRepository();

export class AdminController {
  static async createUser(req: Request, res: Response) {
    try {
      const { name, email, password, role } = req.body;
      const uc = new CreateUser(users, affiliates);
      const user = await uc.execute({ name, email, password, role });
      return res.status(201).json({ id: user.id, email: user.email, name: user.name, role: user.role });
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  static async listUsers(_req: Request, res: Response) {
    const list = await users.list();
    return res.json(list.map(u => ({ id: u.id, name: u.name, email: u.email, role: u.role, referredById: u.referredById })));
  }
}
