import fs from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import {
  COGITA_CAPABILITIES,
  COGITA_QUALITY_REPORT_SCHEMA_VERSION,
  type CogitaPlugin,
  type CogitaPluginConfig,
  type ContentEntry,
  getCogitaBuildContext,
  getCogitaLogger,
} from '@cogita/shared';
import { glob } from 'glob';
import matter from 'gray-matter';
import type {
  ContentCheckConfig,
  ContentCheckField,
  ContentCheckIssue,
  ContentCheckReport,
} from './types';

const DEFAULT_REQUIRED_FIELDS: ContentCheckField[] = ['title', 'date'];
const IMAGE_REFERENCE_PATTERN = /!\[([^\]]*)\]\(([^)\s]+)(?:\s+["'][^"']*["'])?\)/g;
const LINK_REFERENCE_PATTERN = /\[([^\]]*)\]\(([^)\s]+)(?:\s+["'][^"']*["'])?\)/g;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isExternalReference(value: string): boolean {
  return /^(?:https?:|data:|mailto:|#|\/\/)/i.test(value);
}

function isExternalLink(value: string): boolean {
  return /^(?:https?:|data:|mailto:|tel:|javascript:|\/\/)/i.test(value);
}

function stripReferenceSuffix(value: string): string {
  return value.split(/[?#]/, 1)[0];
}

function normalizeRoute(route: string): string {
  const normalized = route.replace(/\\/g, '/').replace(/\/+$/, '');
  return normalized || '/';
}

function addIssue(
  issues: ContentCheckIssue[],
  severity: ContentCheckIssue['severity'],
  code: string,
  entry: Pick<ContentEntry, 'route' | 'filePath'>,
  message: string
): void {
  issues.push({ severity, code, route: entry.route, filePath: entry.filePath, message });
}

function readFrontmatter(filePath: string): Record<string, unknown> {
  const parsed = matter(fs.readFileSync(filePath, 'utf8')).data;
  return isRecord(parsed) ? parsed : {};
}

/** 使用统一条目元数据替代外部来源的本地 frontmatter。 */
function readEntryFrontmatter(entry: ContentEntry): Record<string, unknown> {
  if (!entry.sourceId) {
    return readFrontmatter(entry.filePath);
  }

  return {
    title: entry.title,
    description: entry.description,
    excerpt: entry.excerpt,
    author: entry.author,
    date: entry.createDate,
    createDate: entry.createDate,
    image: entry.image,
    imageAlt: entry.imageAlt,
  };
}

function resolveOutputDir(rspressConfig: unknown, root: string): string {
  const config = isRecord(rspressConfig) ? rspressConfig : {};
  const output = isRecord(config.output) ? config.output : {};
  const outputPath = typeof output.path === 'string' ? output.path : 'doc_build';
  return path.resolve(root, outputPath);
}

function resolveReportFile(outputDir: string, reportPath: string): string {
  const normalizedPath = reportPath.replace(/^[/\\]+/, '');
  const reportFile = path.resolve(outputDir, normalizedPath);
  const relativePath = path.relative(outputDir, reportFile);
  if (relativePath.startsWith('..') || path.isAbsolute(relativePath)) {
    throw new Error('[Content Check Plugin] reportPath 不能写出构建输出目录');
  }
  return reportFile;
}

function resolveImageFile(root: string, entry: ContentEntry, reference: string): string {
  const cleanReference = stripReferenceSuffix(reference);
  if (cleanReference.startsWith('./') || cleanReference.startsWith('../')) {
    return path.resolve(path.dirname(entry.filePath), cleanReference);
  }
  return path.resolve(root, 'public', cleanReference.replace(/^[/\\]+/, ''));
}

function hasLocalImage(root: string, entry: ContentEntry, reference: string): boolean {
  return fs.existsSync(resolveImageFile(root, entry, reference));
}

/** 读取统一内容索引，兼容只提供旧版文章索引的第三方实现。 */
async function collectEntries(
  config: CogitaPluginConfig,
  logger: ReturnType<typeof getCogitaLogger>
): Promise<ContentEntry[]> {
  const buildContext = getCogitaBuildContext(config);
  if (buildContext.contentIndex) {
    const entries = buildContext.contentIndex.getEntries
      ? await buildContext.contentIndex.getEntries()
      : (await buildContext.contentIndex.getPosts()).map((post) => ({
          ...post,
          kind: 'post' as const,
        }));
    return entries.map((entry) => ({
      ...entry,
      url: entry.url || entry.route,
    }));
  }

  logger.warn('[Content Check Plugin] 未找到共享内容索引，跳过内容诊断');
  return [];
}

async function readEntryBody(config: CogitaPluginConfig, entry: ContentEntry): Promise<string> {
  const buildContext = getCogitaBuildContext(config);
  if (buildContext.contentIndex?.getPostContent) {
    return buildContext.contentIndex.getPostContent(entry.filePath);
  }
  return matter(await fs.promises.readFile(entry.filePath, 'utf8')).content;
}

function checkRequiredFields(
  issues: ContentCheckIssue[],
  entry: ContentEntry,
  frontmatter: Record<string, unknown>,
  requiredFields: ContentCheckField[]
): void {
  for (const field of requiredFields) {
    // 普通文档的创建时间可以由文件元数据提供，因此不强制要求 date frontmatter。
    if (
      field === 'date' &&
      entry.kind === 'document' &&
      !frontmatter.date &&
      !frontmatter.createDate
    ) {
      continue;
    }
    const value =
      field === 'date' ? (frontmatter.date ?? frontmatter.createDate) : frontmatter[field];
    if (typeof value === 'string' ? value.trim() : value !== undefined && value !== null) {
      continue;
    }
    const labels: Record<ContentCheckField, string> = {
      title: 'title',
      description: 'description',
      date: 'date 或 createDate',
      author: 'author',
      imageAlt: 'imageAlt',
    };
    addIssue(issues, 'error', `missing-${field}`, entry, `缺少必填 frontmatter：${labels[field]}`);
  }
}

function checkCoverImage(
  issues: ContentCheckIssue[],
  root: string,
  entry: ContentEntry,
  checkImageAlt: boolean
): void {
  if (!entry.image || isExternalReference(entry.image)) {
    return;
  }
  if (!hasLocalImage(root, entry, entry.image)) {
    addIssue(issues, 'warning', 'missing-cover-image', entry, `找不到内容封面：${entry.image}`);
  }
  if (checkImageAlt && !entry.imageAlt?.trim()) {
    addIssue(issues, 'warning', 'missing-cover-alt', entry, '内容封面缺少 imageAlt');
  }
}

function checkBodyImages(
  issues: ContentCheckIssue[],
  root: string,
  entry: ContentEntry,
  body: string,
  checkImageAlt: boolean
): void {
  for (const match of body.matchAll(IMAGE_REFERENCE_PATTERN)) {
    const alt = match[1]?.trim() || '';
    const reference = match[2]?.trim() || '';
    if (!reference || isExternalReference(reference)) {
      continue;
    }
    if (!hasLocalImage(root, entry, reference)) {
      addIssue(issues, 'warning', 'missing-body-image', entry, `找不到正文图片：${reference}`);
    }
    if (checkImageAlt && !alt) {
      addIssue(
        issues,
        'warning',
        'missing-body-image-alt',
        entry,
        `正文图片缺少 alt：${reference}`
      );
    }
  }
}

function getLinkPath(reference: string): string {
  return reference.split(/[?#]/, 1)[0];
}

function getRoutePath(reference: string, base?: string): string {
  let route = getLinkPath(reference).replace(/\\/g, '/');
  const normalizedBase = base?.replace(/\\/g, '/').replace(/\/+$/, '');
  if (normalizedBase && route.startsWith(`${normalizedBase}/`)) {
    route = route.slice(normalizedBase.length);
  }
  return normalizeRoute(route);
}

function resolveMarkdownTarget(entry: ContentEntry, target: string): string[] {
  const absoluteTarget = target.startsWith('/')
    ? path.resolve(path.dirname(entry.filePath), `.${target}`)
    : path.resolve(path.dirname(entry.filePath), target);
  const extension = path.extname(absoluteTarget).toLowerCase();
  if (extension) {
    return [absoluteTarget];
  }
  return [
    absoluteTarget,
    `${absoluteTarget}.md`,
    `${absoluteTarget}.mdx`,
    path.join(absoluteTarget, 'index.md'),
    path.join(absoluteTarget, 'index.mdx'),
  ];
}

function hasLocalTarget(entry: ContentEntry, target: string): boolean {
  return resolveMarkdownTarget(entry, target).some((candidate) => fs.existsSync(candidate));
}

function stripFencedCode(body: string): string {
  return body.replace(/```[\s\S]*?```/g, '').replace(/~~~[\s\S]*?~~~/g, '');
}

function checkBodyLinks(
  issues: ContentCheckIssue[],
  config: CogitaPluginConfig,
  entry: ContentEntry,
  body: string,
  routes: ReadonlySet<string>
): void {
  const source = stripFencedCode(body);
  const base = config.site?.base;

  for (const match of source.matchAll(LINK_REFERENCE_PATTERN)) {
    const offset = match.index ?? 0;
    if (source[offset - 1] === '!') {
      continue;
    }

    const reference = match[2]?.trim() || '';
    const target = getLinkPath(reference);
    if (!reference || !target || target.startsWith('#') || isExternalLink(target)) {
      continue;
    }

    const route = getRoutePath(target, base);
    const routeExists = target.startsWith('/') && routes.has(route);
    const fileExists = !target.startsWith('/') && hasLocalTarget(entry, target);
    const publicFileExists = target.startsWith('/')
      ? fs.existsSync(path.resolve(getCogitaBuildContext(config).root, 'public', target.slice(1)))
      : false;

    if (!routeExists && !fileExists && !publicFileExists && route !== '/') {
      addIssue(issues, 'warning', 'missing-link', entry, `找不到本地链接目标：${reference}`);
    }
  }
}

async function checkSourceParseErrors(
  config: CogitaPluginConfig,
  entries: readonly ContentEntry[]
): Promise<ContentCheckIssue[]> {
  const buildContext = getCogitaBuildContext(config);
  const entryByFile = new Map(entries.map((entry) => [path.resolve(entry.filePath), entry]));
  const issues: ContentCheckIssue[] = [];

  for (const filePath of await collectSourceFiles(config)) {
    try {
      readFrontmatter(filePath);
    } catch (error) {
      const entry = entryByFile.get(path.resolve(filePath));
      issues.push({
        severity: 'error',
        code: 'invalid-frontmatter',
        route: entry?.route || `/${path.relative(buildContext.root, filePath).replace(/\\/g, '/')}`,
        filePath,
        message: `Frontmatter 解析失败：${error instanceof Error ? error.message : String(error)}`,
      });
    }
  }

  return issues;
}

/** 收集文章和普通文档源文件，用于诊断索引阶段无法暴露的 frontmatter 解析错误。 */
async function collectSourceFiles(config: CogitaPluginConfig): Promise<string[]> {
  const buildContext = getCogitaBuildContext(config);
  const postsConfig = config.posts ?? {};
  const cwd = buildContext.cwd || process.cwd();
  const sourceDirectories = [postsConfig.dir || 'posts', config.contentDir].filter(
    (directory): directory is string => Boolean(directory)
  );
  const extensions = postsConfig.extensions?.length ? postsConfig.extensions : ['md', 'mdx'];
  const extensionPattern = extensions.length > 1 ? `{${extensions.join(',')}}` : extensions[0];

  const files = await Promise.all(
    sourceDirectories.map((directory) =>
      glob(`${directory}/**/*.${extensionPattern}`, {
        absolute: true,
        cwd,
        nodir: true,
      })
    )
  );
  return Array.from(new Set(files.flat().map((filePath) => path.resolve(filePath))));
}

function createReport(contentCount: number, issues: ContentCheckIssue[]): ContentCheckReport {
  return {
    schemaVersion: COGITA_QUALITY_REPORT_SCHEMA_VERSION,
    reportType: 'content-check',
    generatedAt: new Date().toISOString(),
    itemCount: contentCount,
    // 保留 postCount 字段，兼容已有质量报告消费者；新消费者应使用 itemCount。
    postCount: contentCount,
    errors: issues.filter((issue) => issue.severity === 'error').length,
    warnings: issues.filter((issue) => issue.severity === 'warning').length,
    issues,
  };
}

function matchesIgnoredPath(filePath: string, ignoredPath: string): boolean {
  const normalizedFilePath = filePath.replace(/\\/g, '/');
  const normalizedIgnoredPath = ignoredPath.replace(/\\/g, '/').replace(/^\/+/, '');
  return (
    normalizedFilePath === normalizedIgnoredPath ||
    normalizedFilePath.endsWith(`/${normalizedIgnoredPath}`)
  );
}

function applyIssuePolicy(
  issues: ContentCheckIssue[],
  config: ContentCheckConfig
): ContentCheckIssue[] {
  return issues.flatMap((issue) => {
    const isIgnored = config.ignores?.some(
      (ignored) =>
        (!ignored.code || ignored.code === issue.code) &&
        (!ignored.route || ignored.route === issue.route) &&
        (!ignored.filePath || matchesIgnoredPath(issue.filePath, ignored.filePath))
    );
    const configuredSeverity = config.severity?.[issue.code];

    if (isIgnored || configuredSeverity === 'ignore') {
      return [];
    }

    if (configuredSeverity) {
      return [{ ...issue, severity: configuredSeverity }];
    }

    return [issue];
  });
}

function formatReport(report: ContentCheckReport): string {
  const lines = [
    `[Content Check Plugin] 检查完成：${report.itemCount} 个内容条目，${report.errors} 个错误，${report.warnings} 个警告`,
  ];
  for (const issue of report.issues) {
    lines.push(
      `  [${issue.severity === 'error' ? '错误' : '警告'}] ${issue.route} ${issue.code}: ${issue.message}`
    );
  }
  return lines.join('\n');
}

async function writeReportFile(reportFile: string, report: ContentCheckReport): Promise<void> {
  await mkdir(path.dirname(reportFile), { recursive: true });
  await writeFile(reportFile, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
}

/** 创建文章内容质量与构建诊断插件。 */
export function pluginContentCheck(config: CogitaPluginConfig): CogitaPlugin | null {
  const contentCheck = config.contentCheck as ContentCheckConfig | undefined;
  if (!contentCheck || contentCheck.enabled === false) {
    return null;
  }

  const buildContext = getCogitaBuildContext(config);
  const logger = getCogitaLogger(config);
  const finalConfig = {
    failOnError: false,
    requiredFields: DEFAULT_REQUIRED_FIELDS,
    checkImages: true,
    checkImageAlt: true,
    checkRoutes: true,
    checkEmptyContent: true,
    checkLinks: true,
    ...contentCheck,
  };
  let report: ContentCheckReport | undefined;
  let reportFile: string | undefined;

  return {
    name: '@cogita/plugin-content-check',
    cogita: {
      providesCapabilities: [COGITA_CAPABILITIES.QUALITY_CONTENT_CHECK],
      requiresCapabilities: [COGITA_CAPABILITIES.CONTENT_POSTS],
    },

    async beforeBuild(rspressConfig: unknown) {
      const entries = await collectEntries(config, logger);
      const issues: ContentCheckIssue[] = await checkSourceParseErrors(config, entries);
      const routes = new Map<string, ContentEntry[]>();

      for (const entry of entries) {
        const route = normalizeRoute(entry.route);
        const routeEntries = routes.get(route) ?? [];
        routeEntries.push(entry);
        routes.set(route, routeEntries);
      }

      for (const entry of entries) {
        const frontmatter = readEntryFrontmatter(entry);
        checkRequiredFields(issues, entry, frontmatter, finalConfig.requiredFields);

        if (finalConfig.checkImages) {
          checkCoverImage(issues, buildContext.root, entry, finalConfig.checkImageAlt);
        }

        const body = await readEntryBody(config, entry);
        if (finalConfig.checkEmptyContent && !body.trim()) {
          addIssue(issues, 'warning', 'empty-content', entry, '内容正文为空');
        }
        if (finalConfig.checkImages) {
          checkBodyImages(issues, buildContext.root, entry, body, finalConfig.checkImageAlt);
        }
        if (finalConfig.checkLinks) {
          checkBodyLinks(issues, config, entry, body, new Set(routes.keys()));
        }
      }

      if (finalConfig.checkRoutes) {
        for (const [route, routeEntries] of routes) {
          if (routeEntries.length < 2) {
            continue;
          }
          for (const entry of routeEntries) {
            addIssue(issues, 'error', 'duplicate-route', entry, `内容路由重复：${route}`);
          }
        }
      }

      report = createReport(entries.length, applyIssuePolicy(issues, finalConfig));
      logger.info(formatReport(report));

      reportFile = finalConfig.reportPath
        ? resolveReportFile(
            resolveOutputDir(rspressConfig, buildContext.cwd || process.cwd()),
            finalConfig.reportPath
          )
        : undefined;

      if (reportFile) {
        await writeReportFile(reportFile, report);
      }

      if (finalConfig.failOnError && report.errors > 0) {
        throw new Error(`[Content Check Plugin] 发现 ${report.errors} 个错误，已根据配置阻断构建`);
      }
    },

    async afterBuild() {
      if (!report || !reportFile) {
        return;
      }
      await writeReportFile(reportFile, report);
      logger.info(`[Content Check Plugin] 诊断报告已写入：${reportFile}`);
    },
  };
}

export default pluginContentCheck;
