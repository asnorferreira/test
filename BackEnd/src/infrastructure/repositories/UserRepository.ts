import { User, Role } from '@prisma/client';

export interface IUserRepository {
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  create(data: {
    name: string; email: string; passwordHash: string; role?: Role; referredById?: string | null;
  }): Promise<User>;
  list(): Promise<User[]>;
}
