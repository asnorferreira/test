#!/usr/bin/env node

import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { existsSync, readFileSync } from 'node:fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = dirname(__dirname);

function readPortFromEnvFile(fileName) {
  const filePath = resolve(projectRoot, fileName);
  if (!existsSync(filePath)) {
    return null;
  }

  const content = readFileSync(filePath, 'utf8');
  const lines = content.split(/\r?\n/);
  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) {
      continue;
    }
    const [key, ...rest] = line.split('=');
    if (key.trim() !== 'PORT') {
      continue;
    }
    const value = rest.join('=').trim();
    return value.replace(/^(['"])(.*)\1$/, '$2');
  }
  return null;
}

const envPort = process.env.PORT;
const filePort = envPort ?? readPortFromEnvFile('.env.local') ?? readPortFromEnvFile('.env');
const port = filePort && filePort.length > 0 ? filePort : '3000';

const child = spawn(
  'next',
  ['dev', '--turbo', '--port', port],
  {
    stdio: 'inherit',
    shell: true,
    cwd: projectRoot,
    env: {
      ...process.env,
      PORT: port,
    },
  },
);

child.on('close', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exit(code ?? 0);
});
