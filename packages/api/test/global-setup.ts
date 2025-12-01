import { execSync } from 'child_process';
import * as path from 'path';

export default async () => {
  console.log('\n\n[E2E Setup] Iniciando banco de dados de teste...');

  const composeFile = path.resolve(__dirname, '../../../docker-compose.test.yml');
  const envFile = path.resolve(__dirname, '../.env.test');

  try {
    execSync(`docker-compose -f ${composeFile} up -d`);
    console.log('[E2E Setup] Container Docker (postgres_test) iniciado.');
    console.log('[E2E Setup] Aguardando 5 segundos para o Postgres inicializar...');
    
    await new Promise(resolve => setTimeout(resolve, 5000));

    console.log('[E2E Setup] Aplicando migrações no banco de teste...');
    execSync(
      `pnpm dotenv -e ${envFile} -- pnpm --filter @jsp/api exec prisma migrate deploy`,
      { stdio: 'inherit' }
    );
    console.log('[E2E Setup] Migrações aplicadas. Ambiente de teste pronto.');

  } catch (error) {
    console.error('Falha no setup global de E2E:', error);
    execSync(`docker-compose -f ${composeFile} down -v`);
    process.exit(1);
  }
};