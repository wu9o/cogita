import { spawnSync } from 'node:child_process';
import { access, mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

type TemplateName = 'blog' | 'docs' | 'knowledge';

const TEMPLATE_ALIASES: Record<string, TemplateName> = {
  basic: 'blog',
  blog: 'blog',
  minimal: 'blog',
  personal: 'blog',
  tech: 'blog',
  docs: 'docs',
  documentation: 'docs',
  knowledge: 'knowledge',
  'knowledge-base': 'knowledge',
  wiki: 'knowledge',
};

const PACKAGE_MANAGERS = new Set(['pnpm', 'npm', 'yarn']);

export interface CreateProjectOptions {
  name: string;
  template: string;
  packageManager: string;
  install: boolean;
  git: boolean;
  force: boolean;
  templatesRoot: string;
  packageVersions: {
    cli: string;
    core: string;
    theme: string;
  };
}

export interface CreatedProject {
  targetDir: string;
  packageName: string;
  template: TemplateName;
}

function normalizeProjectName(name: string): string {
  const baseName = path.basename(path.resolve(process.cwd(), name));
  const normalized = baseName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, '-')
    .replace(/^-+|-+$/g, '');

  if (!normalized) {
    throw new Error('项目目录名无法转换为有效的 npm 包名。');
  }

  return normalized;
}

function createSiteTitle(packageName: string): string {
  return packageName
    .split(/[-_.]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function resolveTemplate(template: string): TemplateName {
  const normalized = TEMPLATE_ALIASES[template.trim().toLowerCase()];
  if (!normalized) {
    throw new Error(`未知模板：${template}。可用模板：blog、docs、knowledge。`);
  }

  return normalized;
}

async function directoryExists(directory: string): Promise<boolean> {
  try {
    await access(directory);
    return true;
  } catch {
    return false;
  }
}

async function ensureTargetDirectory(targetDir: string, force: boolean): Promise<void> {
  if (!(await directoryExists(targetDir))) {
    await mkdir(targetDir, { recursive: true });
    return;
  }

  const entries = await readdir(targetDir);
  if (entries.length > 0 && !force) {
    throw new Error(`目标目录不为空：${targetDir}。请换一个目录，或使用 --force。`);
  }
}

async function renderTemplateDirectory(
  sourceDir: string,
  targetDir: string,
  variables: Record<string, string>
): Promise<void> {
  await mkdir(targetDir, { recursive: true });

  for (const entry of await readdir(sourceDir, { withFileTypes: true })) {
    const sourcePath = path.join(sourceDir, entry.name);
    const targetPath = path.join(targetDir, entry.name);

    if (entry.isDirectory()) {
      await renderTemplateDirectory(sourcePath, targetPath, variables);
      continue;
    }

    let content = await readFile(sourcePath, 'utf8');
    for (const [key, value] of Object.entries(variables)) {
      content = content.replaceAll(`__${key}__`, value);
    }
    await writeFile(targetPath, content);
  }
}

function runCommand(command: string, args: string[], cwd: string): void {
  const result = spawnSync(command, args, { cwd, stdio: 'inherit' });
  if (result.status !== 0) {
    throw new Error(`命令执行失败：${command} ${args.join(' ')}`);
  }
}

export async function createProject(options: CreateProjectOptions): Promise<CreatedProject> {
  if (!PACKAGE_MANAGERS.has(options.packageManager)) {
    throw new Error(`不支持的包管理器：${options.packageManager}。可用值：pnpm、npm、yarn。`);
  }

  const template = resolveTemplate(options.template);
  const targetDir = path.resolve(process.cwd(), options.name);
  const packageName = normalizeProjectName(options.name);
  const siteTitle = createSiteTitle(packageName);

  await ensureTargetDirectory(targetDir, options.force);
  await renderTemplateDirectory(path.join(options.templatesRoot, template), targetDir, {
    PACKAGE_NAME: packageName,
    SITE_TITLE: siteTitle,
    CLI_VERSION: options.packageVersions.cli,
    CORE_VERSION: options.packageVersions.core,
    THEME_VERSION: options.packageVersions.theme,
  });

  if (options.install) {
    runCommand(options.packageManager, ['install'], targetDir);
  }

  if (options.git) {
    runCommand('git', ['init'], targetDir);
  }

  return { targetDir, packageName, template };
}

export function getSupportedTemplates(): string[] {
  return ['blog', 'docs', 'knowledge'];
}
