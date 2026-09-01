import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const demosRoot = path.join(repositoryRoot, 'demos');
const expectedSlugs = ['docs', 'lucid', 'editorial', 'knowledge'];

test('每个内置主题都有独立 Demo 消费者', () => {
  for (const slug of expectedSlugs) {
    const demoRoot = path.join(demosRoot, slug);
    assert.ok(existsSync(path.join(demoRoot, 'package.json')), `${slug} 缺少 package.json`);
    assert.ok(existsSync(path.join(demoRoot, 'cogita.config.ts')), `${slug} 缺少配置文件`);
    const manifest = JSON.parse(readFileSync(path.join(demoRoot, 'package.json'), 'utf8'));
    assert.equal(manifest.name, `@cogita/demo-${slug}`);
    assert.equal(manifest.private, true);
  }
});

test('主题 Demo 落地页链接到所有内置主题', () => {
  const landing = readFileSync(path.join(demosRoot, 'landing', 'index.html'), 'utf8');
  for (const slug of expectedSlugs) {
    assert.match(landing, new RegExp(`/demos/${slug}/`));
  }
});
