import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import {
  findCogitaConfigPath,
  isCogitaThemeConfig,
  loadCogitaConfig,
  resolveThemePackage,
} from '@cogita/core';
import {
  COGITA_DOCTOR_SCHEMA_VERSION,
  type CogitaDoctorCheck,
  type CogitaDoctorReport,
  getCogitaDiagnostic,
} from '@cogita/shared';

const LOCK_FILES = ['pnpm-lock.yaml', 'package-lock.json', 'yarn.lock'];
const DEPENDENCY_GROUPS = [
  'dependencies',
  'devDependencies',
  'optionalDependencies',
  'peerDependencies',
] as const;

interface PackageManifest {
  scripts?: Record<string, unknown>;
  [key: string]: unknown;
}

interface InstalledPackage {
  entryPath: string;
  version?: string;
}

function addCheck(
  checks: CogitaDoctorCheck[],
  severity: CogitaDoctorCheck['severity'],
  code: string,
  message: string,
  hint?: string,
  details?: Readonly<Record<string, unknown>>
): void {
  checks.push({ severity, code, message, hint, details });
}

function readManifest(root: string): PackageManifest | undefined {
  const manifestPath = path.join(root, 'package.json');
  if (!fs.existsSync(manifestPath)) {
    return undefined;
  }

  try {
    return JSON.parse(fs.readFileSync(manifestPath, 'utf8')) as PackageManifest;
  } catch {
    return undefined;
  }
}

function getDeclaredDependency(manifest: PackageManifest, name: string): string | undefined {
  for (const group of DEPENDENCY_GROUPS) {
    const dependencies = manifest[group];
    if (dependencies && typeof dependencies === 'object' && name in dependencies) {
      const version = (dependencies as Record<string, unknown>)[name];
      return typeof version === 'string' ? version : String(version);
    }
  }
  return undefined;
}

function resolveInstalledPackage(root: string, name: string): InstalledPackage {
  const packageDirectory = path.join(root, 'node_modules', ...name.split('/'));
  if (fs.existsSync(packageDirectory)) {
    const resolvedDirectory = fs.realpathSync(packageDirectory);
    const manifestPath = path.join(resolvedDirectory, 'package.json');
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8')) as {
      exports?: unknown;
      module?: unknown;
      main?: unknown;
      version?: unknown;
    };
    const packageExports = manifest.exports;
    const rootExport =
      typeof packageExports === 'string'
        ? packageExports
        : packageExports && typeof packageExports === 'object'
          ? (packageExports as Record<string, unknown>)['.']
          : undefined;
    const entryExport =
      typeof rootExport === 'string'
        ? rootExport
        : rootExport && typeof rootExport === 'object'
          ? (rootExport as Record<string, unknown>).import ||
            (rootExport as Record<string, unknown>).default ||
            (rootExport as Record<string, unknown>).require
          : undefined;
    const entry =
      (typeof entryExport === 'string' && entryExport) ||
      (typeof manifest.module === 'string' && manifest.module) ||
      (typeof manifest.main === 'string' && manifest.main);
    if (!entry) {
      throw new Error(`包 ${name} 没有可解析的 ESM/CJS 入口。`);
    }
    return {
      entryPath: path.resolve(resolvedDirectory, entry),
      version: typeof manifest.version === 'string' ? manifest.version : undefined,
    };
  }

  const projectRequire = createRequire(path.join(root, 'package.json'));
  const entryPath = projectRequire.resolve(name);
  let currentDirectory = path.dirname(entryPath);

  while (true) {
    const manifestPath = path.join(currentDirectory, 'package.json');
    if (fs.existsSync(manifestPath)) {
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8')) as {
        name?: unknown;
        version?: unknown;
      };
      if (manifest.name === name) {
        return {
          entryPath,
          version: typeof manifest.version === 'string' ? manifest.version : undefined,
        };
      }
    }

    const parentDirectory = path.dirname(currentDirectory);
    if (parentDirectory === currentDirectory) {
      break;
    }
    currentDirectory = parentDirectory;
  }

  return { entryPath };
}

function checkProjectManifest(
  root: string,
  checks: CogitaDoctorCheck[]
): PackageManifest | undefined {
  const manifestPath = path.join(root, 'package.json');
  const manifest = readManifest(root);
  if (!manifest) {
    addCheck(
      checks,
      'error',
      'COGITA_DOCTOR_PACKAGE_JSON_INVALID',
      `无法读取站点 package.json：${manifestPath}`,
      '请在站点根目录创建有效的 package.json。'
    );
    return undefined;
  }

  addCheck(
    checks,
    'info',
    'COGITA_DOCTOR_PACKAGE_JSON_OK',
    '站点 package.json 可读取。',
    undefined,
    {
      manifestPath,
    }
  );

  if (!LOCK_FILES.some((fileName) => fs.existsSync(path.join(root, fileName)))) {
    addCheck(
      checks,
      'warning',
      'COGITA_DOCTOR_LOCKFILE_MISSING',
      '站点没有检测到包管理器 lockfile。',
      '提交 pnpm-lock.yaml、package-lock.json 或 yarn.lock，保证部署环境安装到可复现的依赖版本。'
    );
  } else {
    addCheck(checks, 'info', 'COGITA_DOCTOR_LOCKFILE_OK', '站点存在包管理器 lockfile。');
  }

  const buildScript = manifest.scripts?.build;
  if (typeof buildScript !== 'string' || !/cogita\s+build/.test(buildScript)) {
    addCheck(
      checks,
      'warning',
      'COGITA_DOCTOR_BUILD_SCRIPT_MISSING',
      'package.json 的 build 脚本没有调用 cogita build。',
      '将生产构建脚本统一为 cogita build，避免本地和部署流水线使用不同入口。'
    );
  } else {
    addCheck(checks, 'info', 'COGITA_DOCTOR_BUILD_SCRIPT_OK', '生产构建脚本已使用 cogita build。');
  }

  return manifest;
}

function checkDependency(
  root: string,
  manifest: PackageManifest | undefined,
  name: string,
  checks: CogitaDoctorCheck[],
  required: boolean
): InstalledPackage | undefined {
  if (!manifest) {
    return undefined;
  }

  const declaredVersion = getDeclaredDependency(manifest, name);
  if (!declaredVersion) {
    addCheck(
      checks,
      required ? 'error' : 'warning',
      'COGITA_DOCTOR_DEPENDENCY_DECLARATION_MISSING',
      `站点没有声明 ${name} 依赖。`,
      `请在站点 package.json 中声明 ${name}，并通过包管理器安装。`,
      { packageName: name }
    );
    return undefined;
  }

  try {
    const installed = resolveInstalledPackage(root, name);
    addCheck(
      checks,
      'info',
      'COGITA_DOCTOR_DEPENDENCY_OK',
      `${name} 已声明且可以解析。`,
      undefined,
      { packageName: name, declaredVersion, installedVersion: installed.version }
    );
    return installed;
  } catch (error) {
    addCheck(
      checks,
      'error',
      'COGITA_DOCTOR_DEPENDENCY_UNRESOLVED',
      `${name} 已声明，但当前安装结果无法解析。`,
      '请在站点根目录重新执行包管理器 install，并确认 lockfile 与 package.json 一致。',
      {
        packageName: name,
        declaredVersion,
        error: error instanceof Error ? error.message : String(error),
      }
    );
    return undefined;
  }
}

async function checkTheme(
  themePackage: string | undefined,
  installedTheme: InstalledPackage | undefined,
  checks: CogitaDoctorCheck[]
): Promise<void> {
  if (!themePackage || !installedTheme) {
    return;
  }

  try {
    const themeModule = (await import(pathToFileURL(installedTheme.entryPath).href)) as {
      getThemeConfig?: unknown;
    };
    if (typeof themeModule.getThemeConfig !== 'function') {
      addCheck(
        checks,
        'error',
        'COGITA_DOCTOR_THEME_INVALID',
        `主题 ${themePackage} 没有导出 getThemeConfig。`,
        '升级主题包，或确认主题入口导出了符合 CogitaTheme 契约的 getThemeConfig。'
      );
      return;
    }

    const themeConfig = (themeModule.getThemeConfig as () => unknown)();
    if (!isCogitaThemeConfig(themeConfig)) {
      addCheck(
        checks,
        'error',
        'COGITA_DOCTOR_THEME_CONTRACT_INVALID',
        `主题 ${themePackage} 返回的主题契约缺少 name 或 pageLayouts.home。`,
        '请升级主题包，或修正主题的 getThemeConfig 返回值。'
      );
      return;
    }

    addCheck(
      checks,
      'info',
      'COGITA_DOCTOR_THEME_OK',
      `主题 ${themePackage} 可以加载且契约有效。`,
      undefined,
      {
        packageName: themePackage,
        installedVersion: installedTheme.version,
      }
    );
  } catch (error) {
    addCheck(
      checks,
      'error',
      'COGITA_DOCTOR_THEME_LOAD_FAILED',
      `主题 ${themePackage} 无法加载：${error instanceof Error ? error.message : String(error)}`,
      '请检查主题依赖、导出入口和当前 Core 版本兼容性。'
    );
  }
}

function checkContentDirectory(
  root: string,
  config: { contentDir?: string; posts?: { dir?: string } },
  checks: CogitaDoctorCheck[]
): void {
  const configuredDirectories = [
    config.contentDir ? { name: 'contentDir', value: config.contentDir } : undefined,
    config.posts?.dir ? { name: 'posts.dir', value: config.posts.dir } : undefined,
  ].filter((entry): entry is { name: string; value: string } => Boolean(entry));

  if (configuredDirectories.length === 0) {
    addCheck(
      checks,
      'info',
      'COGITA_DOCTOR_CONTENT_DIR_UNCONFIGURED',
      '站点未显式配置内容目录，使用主题或插件默认值。'
    );
    return;
  }

  for (const directory of configuredDirectories) {
    const absolutePath = path.resolve(root, directory.value);
    if (!fs.existsSync(absolutePath)) {
      addCheck(
        checks,
        'error',
        'COGITA_DOCTOR_CONTENT_DIR_NOT_FOUND',
        `${directory.name} 指向的目录不存在：${absolutePath}`,
        `请创建 ${directory.value}，或修改 cogita.config.ts 中的 ${directory.name} 配置。`,
        { field: directory.name, configuredPath: directory.value, absolutePath }
      );
    } else {
      addCheck(
        checks,
        'info',
        'COGITA_DOCTOR_CONTENT_DIR_OK',
        `${directory.name} 目录存在：${absolutePath}`,
        undefined,
        {
          field: directory.name,
          absolutePath,
        }
      );
    }
  }
}

export async function runDoctor(root: string = process.cwd()): Promise<CogitaDoctorReport> {
  const projectRoot = path.resolve(root);
  const checks: CogitaDoctorCheck[] = [];
  const configPath = await findCogitaConfigPath(projectRoot);
  let config: { theme?: string; contentDir?: string; posts?: { dir?: string } } | undefined;

  if (!configPath) {
    addCheck(
      checks,
      'error',
      'COGITA_DOCTOR_CONFIG_NOT_FOUND',
      `未找到 Cogita 配置文件：${projectRoot}`,
      '请在站点根目录创建 cogita.config.ts，或运行 cogita create 初始化站点。'
    );
  } else {
    try {
      config = await loadCogitaConfig(projectRoot, { required: true });
      addCheck(
        checks,
        'info',
        'COGITA_DOCTOR_CONFIG_OK',
        `配置文件可以加载：${configPath}`,
        undefined,
        {
          configPath,
        }
      );
    } catch (error) {
      const diagnostic = getCogitaDiagnostic(error);
      addCheck(
        checks,
        'error',
        'COGITA_DOCTOR_CONFIG_INVALID',
        diagnostic?.message || `配置文件加载失败：${configPath}`,
        diagnostic?.hint || '请检查 cogita.config.ts 的语法、导入路径和配置字段。',
        diagnostic?.details
      );
    }
  }

  const manifest = checkProjectManifest(projectRoot, checks);
  checkDependency(projectRoot, manifest, '@cogita/cli', checks, false);
  checkDependency(projectRoot, manifest, '@cogita/core', checks, true);

  const themePackage = config?.theme ? resolveThemePackage(config) : undefined;
  const installedTheme = themePackage
    ? checkDependency(projectRoot, manifest, themePackage, checks, true)
    : undefined;
  if (config && !themePackage) {
    addCheck(
      checks,
      'error',
      'COGITA_DOCTOR_THEME_NOT_CONFIGURED',
      '配置中没有设置 theme。',
      '请配置内置主题别名（例如 lucid 或 docs），或填写已安装的主题包名。'
    );
  }

  await checkTheme(themePackage, installedTheme, checks);
  if (config) {
    checkContentDirectory(projectRoot, config, checks);
  }

  return {
    schemaVersion: COGITA_DOCTOR_SCHEMA_VERSION,
    root: projectRoot,
    configPath,
    ok: !checks.some((check) => check.severity === 'error'),
    errors: checks.filter((check) => check.severity === 'error').length,
    warnings: checks.filter((check) => check.severity === 'warning').length,
    checks,
  };
}

export function formatDoctorReport(report: CogitaDoctorReport): string {
  const lines = [`[Cogita Doctor] 检查站点：${report.root}`];
  for (const check of report.checks) {
    const label =
      check.severity === 'error' ? '错误' : check.severity === 'warning' ? '警告' : '通过';
    lines.push(`  [${label}] ${check.code}: ${check.message}`);
    if (check.hint && check.severity !== 'info') {
      lines.push(`    提示：${check.hint}`);
    }
  }
  lines.push(`[Cogita Doctor] 结果：${report.errors} 个错误，${report.warnings} 个警告`);
  return lines.join('\n');
}
