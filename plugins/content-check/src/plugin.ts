import fs from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import {
  COGITA_CAPABILITIES,
  type CogitaPlugin,
  type CogitaPluginConfig,
  type ContentPost,
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
  post: Pick<ContentPost, 'route' | 'filePath'>,
  message: string
): void {
  issues.push({ severity, code, route: post.route, filePath: post.filePath, message });
}

function readFrontmatter(filePath: string): Record<string, unknown> {
  const parsed = matter(fs.readFileSync(filePath, 'utf8')).data;
  return isRecord(parsed) ? parsed : {};
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

function resolveImageFile(root: string, post: ContentPost, reference: string): string {
  const cleanReference = stripReferenceSuffix(reference);
  if (cleanReference.startsWith('./') || cleanReference.startsWith('../')) {
    return path.resolve(path.dirname(post.filePath), cleanReference);
  }
  return path.resolve(root, 'public', cleanReference.replace(/^[/\\]+/, ''));
}

function hasLocalImage(root: string, post: ContentPost, reference: string): boolean {
  return fs.existsSync(resolveImageFile(root, post, reference));
}

async function collectPosts(
  config: CogitaPluginConfig,
  logger: ReturnType<typeof getCogitaLogger>
): Promise<ContentPost[]> {
  const buildContext = getCogitaBuildContext(config);
  if (buildContext.contentIndex) {
    return (await buildContext.contentIndex.getPosts()).map((post) => ({
      ...post,
      url: post.url || post.route,
    }));
  }

  logger.warn('[Content Check Plugin] 未找到共享内容索引，跳过文章诊断');
  return [];
}

async function readPostBody(config: CogitaPluginConfig, post: ContentPost): Promise<string> {
  const buildContext = getCogitaBuildContext(config);
  if (buildContext.contentIndex?.getPostContent) {
    return buildContext.contentIndex.getPostContent(post.filePath);
  }
  return matter(await fs.promises.readFile(post.filePath, 'utf8')).content;
}

function checkRequiredFields(
  issues: ContentCheckIssue[],
  post: ContentPost,
  frontmatter: Record<string, unknown>,
  requiredFields: ContentCheckField[]
): void {
  for (const field of requiredFields) {
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
    addIssue(issues, 'error', `missing-${field}`, post, `缺少必填 frontmatter：${labels[field]}`);
  }
}

function checkCoverImage(
  issues: ContentCheckIssue[],
  root: string,
  post: ContentPost,
  checkImageAlt: boolean
): void {
  if (!post.image || isExternalReference(post.image)) {
    return;
  }
  if (!hasLocalImage(root, post, post.image)) {
    addIssue(issues, 'warning', 'missing-cover-image', post, `找不到文章封面：${post.image}`);
  }
  if (checkImageAlt && !post.imageAlt?.trim()) {
    addIssue(issues, 'warning', 'missing-cover-alt', post, '文章封面缺少 imageAlt');
  }
}

function checkBodyImages(
  issues: ContentCheckIssue[],
  root: string,
  post: ContentPost,
  body: string,
  checkImageAlt: boolean
): void {
  for (const match of body.matchAll(IMAGE_REFERENCE_PATTERN)) {
    const alt = match[1]?.trim() || '';
    const reference = match[2]?.trim() || '';
    if (!reference || isExternalReference(reference)) {
      continue;
    }
    if (!hasLocalImage(root, post, reference)) {
      addIssue(issues, 'warning', 'missing-body-image', post, `找不到正文图片：${reference}`);
    }
    if (checkImageAlt && !alt) {
      addIssue(issues, 'warning', 'missing-body-image-alt', post, `正文图片缺少 alt：${reference}`);
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

function resolveMarkdownTarget(post: ContentPost, target: string): string[] {
  const absoluteTarget = target.startsWith('/')
    ? path.resolve(path.dirname(post.filePath), `.${target}`)
    : path.resolve(path.dirname(post.filePath), target);
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

function hasLocalTarget(post: ContentPost, target: string): boolean {
  return resolveMarkdownTarget(post, target).some((candidate) => fs.existsSync(candidate));
}

function stripFencedCode(body: string): string {
  return body.replace(/```[\s\S]*?```/g, '').replace(/~~~[\s\S]*?~~~/g, '');
}

function checkBodyLinks(
  issues: ContentCheckIssue[],
  config: CogitaPluginConfig,
  post: ContentPost,
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
    const fileExists = !target.startsWith('/') && hasLocalTarget(post, target);
    const publicFileExists = target.startsWith('/')
      ? fs.existsSync(path.resolve(getCogitaBuildContext(config).root, 'public', target.slice(1)))
      : false;

    if (!routeExists && !fileExists && !publicFileExists && route !== '/') {
      addIssue(issues, 'warning', 'missing-link', post, `找不到本地链接目标：${reference}`);
    }
  }
}

async function checkSourceParseErrors(
  config: CogitaPluginConfig,
  posts: readonly ContentPost[]
): Promise<ContentCheckIssue[]> {
  const buildContext = getCogitaBuildContext(config);
  const postByFile = new Map(posts.map((post) => [path.resolve(post.filePath), post]));
  const issues: ContentCheckIssue[] = [];

  for (const filePath of await collectSourceFiles(config)) {
    try {
      readFrontmatter(filePath);
    } catch (error) {
      const post = postByFile.get(path.resolve(filePath));
      issues.push({
        severity: 'error',
        code: 'invalid-frontmatter',
        route: post?.route || `/${path.relative(buildContext.root, filePath).replace(/\\/g, '/')}`,
        filePath,
        message: `Frontmatter 解析失败：${error instanceof Error ? error.message : String(error)}`,
      });
    }
  }

  return issues;
}

/** 收集文章源文件，用于诊断索引阶段无法暴露的 frontmatter 解析错误。 */
async function collectSourceFiles(config: CogitaPluginConfig): Promise<string[]> {
  const buildContext = getCogitaBuildContext(config);
  const postsConfig = config.posts ?? {};
  const cwd = buildContext.cwd || process.cwd();
  const postsDir = postsConfig.dir || 'posts';
  const extensions = postsConfig.extensions?.length ? postsConfig.extensions : ['md', 'mdx'];
  const extensionPattern = extensions.length > 1 ? `{${extensions.join(',')}}` : extensions[0];

  return glob(`${postsDir}/**/*.${extensionPattern}`, {
    absolute: true,
    cwd,
    nodir: true,
  });
}

function createReport(postCount: number, issues: ContentCheckIssue[]): ContentCheckReport {
  return {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    postCount,
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
    `[Content Check Plugin] 检查完成：${report.postCount} 篇文章，${report.errors} 个错误，${report.warnings} 个警告`,
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
      providesCapabilities: ['quality.content-check'],
      requiresCapabilities: [COGITA_CAPABILITIES.CONTENT_POSTS],
    },

    async beforeBuild(rspressConfig: unknown) {
      const posts = await collectPosts(config, logger);
      const issues: ContentCheckIssue[] = await checkSourceParseErrors(config, posts);
      const routes = new Map<string, ContentPost[]>();

      for (const post of posts) {
        const route = normalizeRoute(post.route);
        const routePosts = routes.get(route) ?? [];
        routePosts.push(post);
        routes.set(route, routePosts);
      }

      for (const post of posts) {
        const frontmatter = readFrontmatter(post.filePath);
        checkRequiredFields(issues, post, frontmatter, finalConfig.requiredFields);

        if (finalConfig.checkImages) {
          checkCoverImage(issues, buildContext.root, post, finalConfig.checkImageAlt);
        }

        const body = await readPostBody(config, post);
        if (finalConfig.checkEmptyContent && !body.trim()) {
          addIssue(issues, 'warning', 'empty-content', post, '文章正文为空');
        }
        if (finalConfig.checkImages) {
          checkBodyImages(issues, buildContext.root, post, body, finalConfig.checkImageAlt);
        }
        if (finalConfig.checkLinks) {
          checkBodyLinks(issues, config, post, body, new Set(routes.keys()));
        }
      }

      if (finalConfig.checkRoutes) {
        for (const [route, routePosts] of routes) {
          if (routePosts.length < 2) {
            continue;
          }
          for (const post of routePosts) {
            addIssue(issues, 'error', 'duplicate-route', post, `文章路由重复：${route}`);
          }
        }
      }

      report = createReport(posts.length, applyIssuePolicy(issues, finalConfig));
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
