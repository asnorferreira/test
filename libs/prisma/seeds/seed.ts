import { PrismaClient, UserRole } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando o script de seed...');

  const tenant = await prisma.tenant.upsert({
    where: { slug: 'demo' },
    update: {},
    create: {
      slug: 'demo',
      name: 'Demonstração',
    },
  });
  console.log(`Tenant "${tenant.name}" criado/atualizado.`);
  console.log(`Tenant "demo" garantido.`);

  const adminPasswordHash = await argon2.hash('admin123');
  const admin = await prisma.user.upsert({
    where: {
      tenantId_email: {
        tenantId: tenant.id,
        email: 'admin@demo.local',
      },
    },
    update: {},
    create: {
      tenantId: tenant.id,
      email: 'admin@demo.local',
      role: UserRole.ADMIN,
      passwordHash: adminPasswordHash,
      displayName: 'Admin',
      status: 'ACTIVE',
    },
  });
  console.log(`Usuário "${admin.email}" criado/atualizado.`);
  console.log('Seed finalizado com sucesso!');
}

main()
  .catch((e) => {
    console.error('Erro durante o processo de seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });