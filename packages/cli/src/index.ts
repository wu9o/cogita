import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createBuild, createPreview, createServer } from '@cogita/core';
import { program } from 'commander';
import { createProject, getSupportedTemplates } from './create';

function findPackageJsonPath(startDir: string): string | null {
  let dir = startDir;
  while (dir !== path.parse(dir).root) {
    const pkgPath = path.join(dir, 'package.json');
    if (fs.existsSync(pkgPath)) {
      return pkgPath;
    }
    dir = path.dirname(dir);
  }
  return null;
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const packageJsonPath = findPackageJsonPath(__dirname);
const pkg = packageJsonPath
  ? (JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8')) as {
      version?: string;
    })
  : null;
const packageRoot = packageJsonPath
  ? path.dirname(packageJsonPath)
  : path.resolve(__dirname, '../..');
const CWD = process.cwd();

if (pkg?.version) {
  program.version(pkg.version);
}

function readPackageVersion(relativePath: string, fallback: string): string {
  try {
    const packageJson = JSON.parse(
      fs.readFileSync(path.resolve(packageRoot, relativePath), 'utf8')
    ) as {
      version?: unknown;
    };
    return typeof packageJson.version === 'string' ? packageJson.version : fallback;
  } catch {
    return fallback;
  }
}

program
  .command('create [name]')
  .description('Create a new Cogita blog or documentation site')
  .option(
    '-t, --template <template>',
    `template name (${getSupportedTemplates().join('|')})`,
    'blog'
  )
  .option('-p, --package-manager <manager>', 'package manager (pnpm|npm|yarn)', 'pnpm')
  .option('--no-install', 'skip dependency installation')
  .option('--no-git', 'skip Git initialization')
  .option('-f, --force', 'allow writing into a non-empty directory')
  .action(
    async (
      name: string | undefined,
      options: {
        template: string;
        packageManager: string;
        install: boolean;
        git: boolean;
        force: boolean;
      }
    ) => {
      if (!name) {
        throw new Error('请提供项目目录名，例如：cogita create my-blog。');
      }

      const created = await createProject({
        name,
        template: options.template,
        packageManager: options.packageManager,
        install: options.install,
        git: options.git,
        force: options.force,
        templatesRoot: path.join(packageRoot, 'templates'),
        packageVersions: {
          cli: pkg?.version || '0.1.19',
          core: readPackageVersion('../core/package.json', '0.12.3'),
          theme: ['docs', 'documentation'].includes(options.template.trim().toLowerCase())
            ? readPackageVersion('../../themes/docs/package.json', '0.2.0')
            : readPackageVersion('../../themes/lucid/package.json', '0.11.2'),
        },
      });

      console.log(`已创建 ${created.template} 项目：${created.targetDir}`);
      console.log(`下一步：cd ${name} && ${options.packageManager} run dev`);
    }
  );

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

await program.parseAsync(process.argv);
