import { cpSync, existsSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(scriptDirectory, '..');
const demosRoot = path.join(repositoryRoot, 'demos');
const pagesRoot = path.join(repositoryRoot, 'docs-site/doc_build');
const demosOutputRoot = path.join(pagesRoot, 'demos');
const demoSlugs = ['docs', 'lucid', 'editorial', 'knowledge'];

if (!existsSync(path.join(demosRoot, 'landing/index.html'))) {
  throw new Error('主题 Demo 总览尚未构建。');
}

mkdirSync(demosOutputRoot, { recursive: true });
cpSync(path.join(demosRoot, 'landing'), demosOutputRoot, { recursive: true, force: true });

for (const slug of demoSlugs) {
  const source = path.join(demosRoot, slug, 'doc_build');
  if (!existsSync(path.join(source, 'index.html'))) {
    throw new Error(`${slug} Demo 尚未生成 doc_build/index.html。`);
  }
  cpSync(source, path.join(demosOutputRoot, slug), { recursive: true, force: true });
}

console.log(
  `已将 ${demoSlugs.length} 个主题 Demo 部署到 ${path.relative(repositoryRoot, demosOutputRoot)}。`
);
