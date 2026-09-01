import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const matrixDocument = path.join(root, 'docs-site/content/guides/compatibility-matrix.md');
const startMarker = '<!-- compatibility-matrix:start -->';
const endMarker = '<!-- compatibility-matrix:end -->';
const rspressCoreRange = '^1.45.1';
const rspressRuntimeRange = '^1.0.0';
const reactRange = '^18.0.0 || ^19.0.0';

const matrixEntries = [
  ['@cogita/shared', 'packages/shared/package.json', 'Core 平台', '公共类型、能力和版本契约'],
  ['@cogita/core', 'packages/core/package.json', 'Core 平台', '配置编排、插件注册和构建生命周期'],
  ['@cogita/cli', 'packages/cli/package.json', 'Core 平台', '站点初始化、开发和构建入口'],
  ['@cogita/ui', 'packages/ui/package.json', '主题生态', '主题共享 UI 组件'],
  [
    '@cogita/plugin-blog-list',
    'plugins/blog-list/package.json',
    '博客主题插件',
    '列表、筛选、分页和归档',
  ],
  [
    '@cogita/plugin-categories',
    'plugins/categories/package.json',
    '博客主题插件',
    '分类聚合和页面',
  ],
  [
    '@cogita/plugin-code-copy',
    'plugins/code-copy/package.json',
    '博客主题插件',
    '代码复制运行时增强',
  ],
  [
    '@cogita/plugin-collections',
    'plugins/collections/package.json',
    '博客主题插件',
    '合集聚合和页面',
  ],
  [
    '@cogita/plugin-comments',
    'plugins/comments/package.json',
    '博客主题插件',
    '评论配置和文章路由',
  ],
  [
    '@cogita/plugin-content-check',
    'plugins/content-check/package.json',
    '博客主题插件',
    '内容质量诊断',
  ],
  [
    '@cogita/plugin-content-relations',
    'plugins/content-relations/package.json',
    '知识库插件',
    '本地链接、相关文章和反向链接',
  ],
  [
    '@cogita/plugin-content-source-json',
    'plugins/content-source-json/package.json',
    '知识库插件',
    'JSON 导出内容源适配',
  ],
  [
    '@cogita/plugin-content-source-git',
    'plugins/content-source-git/package.json',
    '知识库插件',
    '独立 Git Markdown 内容源适配',
  ],
  ['@cogita/plugin-images', 'plugins/images/package.json', '博客主题插件', '公共图片和封面处理'],
  [
    '@cogita/plugin-posts-frontmatter',
    'plugins/posts-frontmatter/package.json',
    '博客主题插件',
    '文章索引和文章页面',
  ],
  [
    '@cogita/plugin-reading-progress',
    'plugins/reading-progress/package.json',
    '博客主题插件',
    '阅读时间和阅读进度',
  ],
  ['@cogita/plugin-rss', 'plugins/rss/package.json', '博客主题插件', 'RSS、Atom 和 JSON Feed'],
  ['@cogita/plugin-search', 'plugins/search/package.json', '博客主题插件', '本地搜索索引和页面'],
  ['@cogita/plugin-seo', 'plugins/seo/package.json', '博客主题插件', '页面 SEO 元数据和审计'],
  ['@cogita/plugin-sitemap', 'plugins/sitemap/package.json', '博客主题插件', '站点地图生成'],
  ['@cogita/plugin-tags', 'plugins/tags/package.json', '博客主题插件', '标签聚合和页面'],
  ['@cogita/theme-lucid', 'themes/lucid/package.json', '博客主题', '默认博客主题和完整插件集成'],
  ['@cogita/theme-editorial', 'themes/editorial/package.json', '博客主题', '编辑风格博客主题'],
  ['@cogita/theme-docs', 'themes/docs/package.json', '文档主题', '技术手册和文档站主题'],
  [
    '@cogita/theme-knowledge',
    'themes/knowledge/package.json',
    '知识库主题',
    '统一内容、搜索、标签和反向链接',
  ],
];

function readPackage(relativePath) {
  const absolutePath = path.join(root, relativePath);
  return JSON.parse(fs.readFileSync(absolutePath, 'utf8'));
}

function getDeclaredRange(packageJson, dependencyName) {
  return (
    packageJson.dependencies?.[dependencyName] ||
    packageJson.devDependencies?.[dependencyName] ||
    packageJson.peerDependencies?.[dependencyName]
  );
}

function renderMatrix() {
  const rows = matrixEntries.map(([name, file, lane, role]) => {
    const packageJson = readPackage(file);
    return `| \`${name}\` | ${packageJson.version} | ${lane} | ${role} |`;
  });

  return [
    startMarker,
    '| 包 | 当前版本 | 兼容轨道 | 角色 |',
    '| --- | --- | --- | --- |',
    ...rows,
    endMarker,
  ].join('\n');
}

function validatePackageMatrix() {
  const errors = [];
  const names = new Set();

  for (const [name, file] of matrixEntries) {
    const packageJson = readPackage(file);
    if (names.has(name)) {
      errors.push(`兼容矩阵重复登记包：${name}`);
    }
    names.add(name);

    if (packageJson.name !== name) {
      errors.push(`${file} 的 package name 为 ${packageJson.name}，矩阵登记为 ${name}`);
    }

    const rspressCore = getDeclaredRange(packageJson, '@rspress/core');
    if (rspressCore && rspressCore !== rspressCoreRange) {
      errors.push(`${name} 的 @rspress/core 范围为 ${rspressCore}，应为 ${rspressCoreRange}`);
    }
  }

  for (const themeName of [
    '@cogita/theme-lucid',
    '@cogita/theme-editorial',
    '@cogita/theme-docs',
    '@cogita/theme-knowledge',
  ]) {
    const packageJson = matrixEntries.find(([name]) => name === themeName);
    const theme = readPackage(packageJson[1]);
    if (theme.peerDependencies?.['@rspress/runtime'] !== rspressRuntimeRange) {
      errors.push(`${themeName} 的 @rspress/runtime peer 范围必须为 ${rspressRuntimeRange}`);
    }
    if (theme.peerDependencies?.react !== reactRange) {
      errors.push(`${themeName} 的 React peer 范围必须为 ${reactRange}`);
    }
  }

  return errors;
}

function updateDocument(expectedBlock) {
  const source = fs.readFileSync(matrixDocument, 'utf8');
  const markerPattern = new RegExp(
    `${startMarker.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[\\s\\S]*?${endMarker.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`
  );

  if (!markerPattern.test(source)) {
    throw new Error(`文档缺少兼容矩阵标记：${matrixDocument}`);
  }

  const next = source.replace(markerPattern, expectedBlock);
  if (process.argv.includes('--write')) {
    fs.writeFileSync(matrixDocument, next);
    return true;
  }

  if (next !== source) {
    throw new Error(
      '兼容矩阵与 package.json 版本不一致，请运行 pnpm run check:compatibility -- --write 更新文档。'
    );
  }

  return false;
}

const validationErrors = validatePackageMatrix();
if (validationErrors.length > 0) {
  console.error(validationErrors.map((error) => `[Compatibility Matrix] ${error}`).join('\n'));
  process.exit(1);
}

const didWrite = updateDocument(renderMatrix());
console.log(
  `[Compatibility Matrix] ${matrixEntries.length} 个包通过检查${didWrite ? '，文档版本表已更新' : ''}`
);
