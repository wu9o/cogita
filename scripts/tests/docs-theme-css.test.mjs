import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const themeCss = await readFile(
  new URL('../../themes/docs/src/theme.css', import.meta.url),
  'utf8'
);

test('Docs 主题的流程箭头不应继承节点卡片样式', () => {
  assert.match(themeCss, /.docs-home-flow > span:not\(\.docs-home-flow-arrow\)\s*\{/);
  assert.match(themeCss, /\.docs-home-flow-arrow\s*\{[\s\S]*?transform: rotate\(90deg\);/);
  assert.doesNotMatch(themeCss, /\.docs-home-flow span\s*\{/);
});
