import { IUserRepository } from '../../infrastructure/repositories/UserRepository';
import { verifyPassword } from '../../domain/services/password';
import { signToken } from '../../domain/services/token';

export class AuthenticateUser {
  constructor(private users: IUserRepository) {}
  async execute(email: string, password: string) {
    const user = await this.users.findByEmail(email);
    if (!user) throw new Error('Credenciais inválidas');
    const ok = await verifyPassword(password, user.passwordHash);
    if (!ok) throw new Error('Credenciais inválidas');
    const token = signToken({ sub: user.id, role: user.role });
    return { token, user: { id: user.id, name: user.name, email: user.email, role: user.role } };
  }
}
