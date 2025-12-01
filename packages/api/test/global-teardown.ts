import { execSync } from 'child_process';
import * as path from 'path';

export default async () => {
  console.log('\n[E2E Teardown] Desligando banco de dados de teste...');

  const composeFile = path.resolve(__dirname, '../../../docker-compose.test.yml');

  try {
    execSync(`docker-compose -f ${composeFile} down -v`);
    console.log('[E2E Teardown] Ambiente de teste desligado e limpo.');
  } catch (error) {
    console.error('Falha no teardown global de E2E:', error);
    process.exit(1);
  }
};