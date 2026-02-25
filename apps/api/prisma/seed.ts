import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log(
    "Iniciando o seed do banco de dados (Produção/Desenvolvimento)...",
  );

  const adminEmail = "admin@maemais.com";
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash("Maem4is#$249!", 10);
    await prisma.user.create({
      data: {
        name: "Administrador Master",
        email: adminEmail,
        passwordHash,
        role: "ADMIN",
      },
    });
    console.log(`Usuário Admin criado: ${adminEmail}`);
  } else {
    console.log(`Usuário Admin já existe.`);
  }

  const productSlug = "formula-maemais-padrao";
  const existingProduct = await prisma.product.findUnique({
    where: { slug: productSlug },
  });

  if (!existingProduct) {
    await prisma.product.create({
      data: {
        name: "Fórmula MãeMais - Venda Direta",
        slug: productSlug,
        description:
          "Fórmula homeopática artesanal desenvolvida sob medida para a mãe.",
        basePrice: 189.9,
        isActive: true,
      },
    });
    console.log(`Produto criado: Fórmula MãeMais - Venda Direta`);
  } else {
    console.log(`Produto já existe.`);
  }

  console.log("Seed finalizado com sucesso!");
}

main()
  .catch((e) => {
    console.error("Erro no seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
