import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createBuild, createPreview, createServer } from '@cogita/core';
import { program } from 'commander';

// Helper to find the package.json
function findPackageJson(startDir: string) {
  let dir = startDir;
  while (dir !== path.parse(dir).root) {
    const pkgPath = path.join(dir, 'package.json');
    if (fs.existsSync(pkgPath)) {
      return JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
    }
    dir = path.dirname(dir);
  }
  return null;
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pkg = findPackageJson(__dirname);
const CWD = process.cwd();

if (pkg) {
  program.version(pkg.version);
}

program
  .command('dev')
  .description('Start the development server')
  .action(async () => {
    // const config = await loadCogitaConfig(CWD);
    await createServer(CWD);
  });

program
  .command('build')
  .description('Build the site for production')
  .action(async () => {
    // const config = await loadConfig(CWD);
    await createBuild(CWD);
  });

program
  .command('preview')
  .description('Preview the production build')
  .option('-p, --port <port>', 'port number', '3030')
  .action(async (options: { port: string }) => {
    const port = Number.parseInt(options.port, 10);
    console.log(`Starting preview server on port ${port}...`);
    await createPreview(CWD, port);
  });

program.parse(process.argv);
