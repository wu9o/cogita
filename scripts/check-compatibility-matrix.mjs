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
  [
    '@cogita/shared',
    'packages/shared/package.json',
    'Core platform',
    'Shared types, capabilities, and version contracts',
  ],
  [
    '@cogita/core',
    'packages/core/package.json',
    'Core platform',
    'Configuration, plugin registration, and build lifecycle',
  ],
  [
    '@cogita/cli',
    'packages/cli/package.json',
    'Core platform',
    'Site initialization, development, and build entry points',
  ],
  ['@cogita/ui', 'packages/ui/package.json', 'Theme ecosystem', 'Shared theme UI components'],
  [
    '@cogita/plugin-blog-list',
    'plugins/blog-list/package.json',
    'Blog theme plugin',
    'Lists, filters, pagination, and archives',
  ],
  [
    '@cogita/plugin-categories',
    'plugins/categories/package.json',
    'Blog theme plugin',
    'Category aggregation and pages',
  ],
  [
    '@cogita/plugin-code-copy',
    'plugins/code-copy/package.json',
    'Blog theme plugin',
    'Runtime code-copy enhancement',
  ],
  [
    '@cogita/plugin-collections',
    'plugins/collections/package.json',
    'Blog theme plugin',
    'Collection aggregation and pages',
  ],
  [
    '@cogita/plugin-comments',
    'plugins/comments/package.json',
    'Blog theme plugin',
    'Comment configuration and post routes',
  ],
  [
    '@cogita/plugin-content-check',
    'plugins/content-check/package.json',
    'Blog theme plugin',
    'Content quality diagnostics',
  ],
  [
    '@cogita/plugin-content-relations',
    'plugins/content-relations/package.json',
    'Knowledge plugin',
    'Local links, related content, and backlinks',
  ],
  [
    '@cogita/plugin-content-source-json',
    'plugins/content-source-json/package.json',
    'Knowledge plugin',
    'JSON export content-source adapter',
  ],
  [
    '@cogita/plugin-content-source-git',
    'plugins/content-source-git/package.json',
    'Knowledge plugin',
    'Independent Git Markdown content-source adapter',
  ],
  [
    '@cogita/plugin-images',
    'plugins/images/package.json',
    'Blog theme plugin',
    'Public image and cover handling',
  ],
  [
    '@cogita/plugin-posts-frontmatter',
    'plugins/posts-frontmatter/package.json',
    'Blog theme plugin',
    'Post index and post pages',
  ],
  [
    '@cogita/plugin-reading-progress',
    'plugins/reading-progress/package.json',
    'Blog theme plugin',
    'Reading time and progress',
  ],
  [
    '@cogita/plugin-rss',
    'plugins/rss/package.json',
    'Blog theme plugin',
    'RSS, Atom, and JSON Feed',
  ],
  [
    '@cogita/plugin-search',
    'plugins/search/package.json',
    'Blog theme plugin',
    'Local search index and pages',
  ],
  [
    '@cogita/plugin-seo',
    'plugins/seo/package.json',
    'Blog theme plugin',
    'Page SEO metadata and audits',
  ],
  [
    '@cogita/plugin-sitemap',
    'plugins/sitemap/package.json',
    'Blog theme plugin',
    'Sitemap generation',
  ],
  [
    '@cogita/plugin-tags',
    'plugins/tags/package.json',
    'Blog theme plugin',
    'Tag aggregation and pages',
  ],
  [
    '@cogita/theme-lucid',
    'themes/lucid/package.json',
    'Blog theme',
    'Default blog theme and full plugin integration',
  ],
  [
    '@cogita/theme-editorial',
    'themes/editorial/package.json',
    'Blog theme',
    'Editorial-style blog theme',
  ],
  [
    '@cogita/theme-docs',
    'themes/docs/package.json',
    'Docs theme',
    'Technical handbook and documentation sites',
  ],
  [
    '@cogita/theme-knowledge',
    'themes/knowledge/package.json',
    'Knowledge theme',
    'Unified content, search, tags, and backlinks',
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
    '| Package | Current version | Compatibility lane | Role |',
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
