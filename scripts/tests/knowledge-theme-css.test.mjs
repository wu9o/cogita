import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const themeCss = await readFile(
  new URL('../../themes/knowledge/src/theme.css', import.meta.url),
  'utf8'
);

test('Knowledge 主题应移除无内容文档侧栏的宽度占位', () => {
  assert.match(themeCss, /--rp-sidebar-width:\s*0px;/);
  assert.match(themeCss, /aside\.rspress-sidebar\s*\{[\s\S]*?display:\s*none\s*!important;/);
  assert.match(
    themeCss,
    /\.rspress-doc:has\(\.knowledge-home\)[\s\S]*?max-width:\s*none\s*!important;/
  );
  assert.match(themeCss, /\.knowledge-relations\s*\{[\s\S]*?grid-template-columns:/);
  assert.match(themeCss, /\.knowledge-relations-section ul\s*\{[\s\S]*?list-style:\s*none;/);
});
