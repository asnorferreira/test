import 'dotenv/config';
import { PrismaClient, Role } from '@prisma/client';
import { env } from '../src/config/env';
import { hashPassword } from '../src/domain/services/Password';

const prisma = new PrismaClient()

async function main() {
  const exists = await prisma.user.findUnique({ where: { email: env.ADMIN_EMAIL } });

  if (exists) {
    console.log('Admin já existe.');
    return;
  }

  const passwordHash = await hashPassword(env.ADMIN_PASSWORD);

  const admin = await prisma.user.create({
    data: {
      name: env.ADMIN_NAME,
      email: env.ADMIN_EMAIL,
      passwordHash,
      role: Role.ADMIN
    }
  });
  console.log('Admin criado:', admin.email);
}

main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
