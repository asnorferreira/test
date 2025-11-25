import { PrismaClient, UserRole, CampaignStatus } from '@prisma/client'; // Adicionar CampaignStatus
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
  console.log(`Tenant "${tenant.name}" [${tenant.id}] criado/atualizado.`);

  const adminPasswordHash = await argon2.hash('admin123');
  const admin = await prisma.user.upsert({
    where: {
      tenantId_email: {
        tenantId: tenant.id,
        email: 'admin@demo.local',
      },
    },
    update: { passwordHash: adminPasswordHash },
    create: {
      tenantId: tenant.id,
      email: 'admin@demo.local',
      role: UserRole.ADMIN,
      passwordHash: adminPasswordHash,
      displayName: 'Admin Demo',
      status: 'ACTIVE',
    },
  });
  console.log(`Usuário "${admin.email}" criado/atualizado.`);

  const campaign = await prisma.campaign.upsert({
    where: {
      tenantId_name: {
        tenantId: tenant.id,
        name: 'Campanha Cobrança Inicial',
      },
    },
    update: {},
    create: {
      tenantId: tenant.id,
      name: 'Campanha Cobrança Inicial',
      channel: 'whatsapp',
      status: CampaignStatus.ACTIVE,
    },
  });
  console.log(`Campanha "${campaign.name}" [${campaign.id}] criada/atualizada.`);

  await prisma.pillar.upsert({
    where: {
      id: `seed-pillar-greeting-${campaign.id}`
    },
    update: {
        name: 'Saudação Inicial',
        description: 'Verifica se o atendente se apresentou corretamente.',
        weight: 2,
    },
    create: {
      id: `seed-pillar-greeting-${campaign.id}`,
      campaignId: campaign.id,
      tenantId: tenant.id,
      name: 'Saudação Inicial',
      description: 'Verifica se o atendente se apresentou corretamente.',
      weight: 2,
    },
  });
  console.log(`Pilar "Saudação Inicial" para Campanha ${campaign.id} criado/atualizado.`);
   await prisma.negotiationRule.deleteMany({ where: { campaignId: campaign.id }});
   await prisma.negotiationRule.create({
     data: {
       campaignId: campaign.id,
       tenantId: tenant.id,
       maxDiscountPercentage: 15,
       maxInstallments: 6,
       minDownPayment: 100,
       forbiddenTerms: ['grátis', 'sem juros'],
     },
   });
   console.log(`Regra de Negociação para Campanha ${campaign.id} criada.`);

  await prisma.script.upsert({
    where: {
      id: `seed-script-opening-${campaign.id}`
    },
    update: {
        category: 'Abertura',
        body: 'Olá [CLIENTE], meu nome é [ATENDENTE] da [EMPRESA]. Como posso ajudar hoje?',
        isActive: true,
    },
    create: {
      id: `seed-script-opening-${campaign.id}`,
      campaignId: campaign.id,
      tenantId: tenant.id,
      category: 'Abertura',
      body: 'Olá [CLIENTE], meu nome é [ATENDENTE] da [EMPRESA]. Como posso ajudar hoje?',
      isActive: true,
      version: 1,
    },
  });
  console.log(`Script de "Abertura" para Campanha ${campaign.id} criado/atualizado.`);


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