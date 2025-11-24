import { Request, Response } from 'express';

import { RegisterDTO, LoginDTO, LoginInput } from '../../../domain/dtos/auth';
import { PrismaUserRepository } from '../../../infrastructure/repositories/impl/PrismaUserRepository';
import { PrismaAffiliateRepository } from '../../../infrastructure/repositories/impl/PrismaAffiliateRepository';
import { CreateUser } from '../../../app/usecases/CreateUser';
import { AuthenticateUser } from '../../../app/usecases/AuthenticateUser';
import { CreateAffiliate } from '../../../app/usecases/CreateAffiliate';
import { ZodError } from 'zod'; 


const users = new PrismaUserRepository();
const affiliates = new PrismaAffiliateRepository();

const createAffiliateUc = new CreateAffiliate(affiliates);

export class AuthController {
  static async register(req: Request, res: Response) {
    try {

      const data = RegisterDTO.parse(req.body);

      const uc = new CreateUser(users, affiliates, createAffiliateUc);
      const user = await uc.execute(data);


      return res.status(201).json({ id: user.id, email: user.email, name: user.name, role: user.role });
    } catch (err: any) {

      if (err instanceof ZodError) {
        return res.status(400).json({
          error: 'Erro de Validação',
          details: err.errors.map(e => ({
            path: e.path.join('.'),
            message: e.message
          }))
        });
      }

      return res.status(400).json({ error: err.message || 'Erro ao registrar' });
    }
  }

  static async login(req: Request, res: Response) {
    try {

      const data: LoginInput = LoginDTO.parse(req.body);


      const uc = new AuthenticateUser(users);


      const result = await uc.execute(data.email, data.password);


      return res.json(result);
    } catch (err: any) {

      if (err instanceof ZodError) {
        return res.status(400).json({
          error: 'Erro de Validação',
          details: err.errors.map(e => ({
            path: e.path.join('.'),
            message: e.message
          }))
        });
      }

      return res.status(400).json({ error: err.message || 'Erro ao autenticar' });
    }
  }
}