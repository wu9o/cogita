import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const themeCss = await readFile(
  new URL('../../themes/editorial/src/theme.css', import.meta.url),
  'utf8'
);

test('Editorial 主题的文章标签应覆盖 Rspress 列表项间距', () => {
  assert.match(themeCss, /\.rspress-doc \.editorial-post-tags li\s*\{[\s\S]*?margin:\s*0;/);
  assert.match(themeCss, /\.rspress-doc \.editorial-article-tags li\s*\{[\s\S]*?margin:\s*0;/);
});
