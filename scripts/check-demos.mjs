import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(scriptDirectory, '..');
const demosRoot = path.join(repositoryRoot, 'demos');
const expectedSlugs = ['docs', 'editorial', 'knowledge', 'lucid'];

function getFiles(root) {
  const files = [];
  for (const entry of readdirSync(root, { withFileTypes: true })) {
    if (entry.name === 'doc_build' || entry.name === 'node_modules') continue;
    const filePath = path.join(root, entry.name);
    if (entry.isDirectory()) files.push(...getFiles(filePath));
    else if (entry.isFile()) files.push(filePath);
  }
  return files;
}

const demoDirectories = readdirSync(demosRoot, { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && expectedSlugs.includes(entry.name))
  .map((entry) => entry.name)
  .sort();

if (JSON.stringify(demoDirectories) !== JSON.stringify([...expectedSlugs].sort())) {
  throw new Error(
    `主题 Demo 不完整：期望 ${expectedSlugs.join(', ')}，实际 ${demoDirectories.join(', ')}。`
  );
}

for (const slug of expectedSlugs) {
  const demoRoot = path.join(demosRoot, slug);
  const manifest = JSON.parse(readFileSync(path.join(demoRoot, 'package.json'), 'utf8'));
  const outputPath = path.join(demoRoot, 'doc_build', 'index.html');
  if (manifest.name !== `@cogita/demo-${slug}`) {
    throw new Error(`${slug} 的 Demo 包名不符合约定。`);
  }
  if (!existsSync(outputPath)) {
    throw new Error(`${manifest.name} 缺少构建产物。`);
  }
  const html = readFileSync(outputPath, 'utf8');
  if (!html.includes('<html')) {
    throw new Error(`${manifest.name} 的首页不是有效 HTML。`);
  }
}

const landing = readFileSync(path.join(demosRoot, 'landing', 'index.html'), 'utf8');
for (const slug of expectedSlugs) {
  if (!landing.includes(`/demos/${slug}/`)) {
    throw new Error(`主题 Demo 落地页缺少 ${slug} 链接。`);
  }
}

const demoFiles = readdirSync(demosRoot, { withFileTypes: true })
  .filter((entry) => entry.name !== 'landing' && entry.isDirectory())
  .flatMap((entry) => getFiles(path.join(demosRoot, entry.name)));
for (const file of demoFiles) {
  if (readFileSync(file, 'utf8').includes('cogita-blog')) {
    throw new Error(`主题 Demo 不应依赖外部博客内容：${path.relative(repositoryRoot, file)}`);
  }
}

console.log(`主题 Demo 校验通过：${expectedSlugs.length} 个独立站点。`);
