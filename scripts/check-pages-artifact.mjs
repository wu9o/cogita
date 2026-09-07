import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(scriptDirectory, '..');
const pagesRoot = path.join(repositoryRoot, 'docs-site/doc_build');
const demoSlugs = ['docs', 'lucid', 'editorial', 'knowledge'];

function readPagesFile(relativePath) {
  const filePath = path.join(pagesRoot, relativePath);
  if (!existsSync(filePath)) {
    throw new Error(`Pages 产物缺少 ${relativePath}。`);
  }
  return readFileSync(filePath, 'utf8');
}

const docsHome = readPagesFile('index.html');
const launchGuide = readPagesFile('guides/launch.html');
const demosLanding = readPagesFile('demos/index.html');
const socialCard = readPagesFile('demos/social-card.svg');

for (const phrase of ['Get started', 'Themes', 'Knowledge theme']) {
  if (!docsHome.includes(phrase)) {
    throw new Error(`Pages 文档首页缺少英文推广入口：${phrase}。`);
  }
}

for (const phrase of ['Launch kit', 'Five-minute start', 'Suggested post']) {
  if (!launchGuide.includes(phrase)) {
    throw new Error(`Pages Launch kit 缺少关键内容：${phrase}。`);
  }
}

for (const slug of demoSlugs) {
  const demoIndex = `demos/${slug}/index.html`;
  readPagesFile(demoIndex);
  if (!demosLanding.includes(`/demos/${slug}/`)) {
    throw new Error(`Pages 主题 Demo 总览缺少 ${slug} 链接。`);
  }
}

if (
  !socialCard.includes('One framework for blogs,') ||
  !socialCard.includes('docs, and knowledge bases.') ||
  /[㐀-鿿]/.test(socialCard)
) {
  throw new Error('Pages 社交分享卡片未通过英文优先校验。');
}

console.log('Pages 发布产物校验通过：文档入口、Launch kit、四个主题 Demo 和社交卡片完整。');
