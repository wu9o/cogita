import assert from 'node:assert/strict';
import { rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { describe, it } from 'node:test';
import {
  cleanMarkdownForReading,
  countReadingWords,
  createReadingStats,
  extractReadingStats,
  resolveReadingProgressConfig,
} from '../dist/utils.js';

function createPost() {
  return {
    title: '阅读测试',
    route: '/posts/reading-test',
    createDate: '2026-08-22',
    updateDate: '2026-08-22',
  };
}

describe('阅读进度工具函数', () => {
  it('应规范化默认配置并限制阅读速度下限', () => {
    const config = resolveReadingProgressConfig({ wordsPerMinute: 0 });

    assert.equal(config.enabled, true);
    assert.equal(config.showBar, true);
    assert.equal(config.showReadingTime, true);
    assert.equal(config.showTocProgress, true);
    assert.equal(config.rememberPosition, false);
    assert.equal(config.wordsPerMinute, 1);
    assert.equal(config.includeCode, false);
  });

  it('应保留显式关闭状态，供主题安全跳过渲染', () => {
    const config = resolveReadingProgressConfig({ enabled: false });

    assert.equal(config.enabled, false);
    assert.equal(config.showBar, true);
    assert.equal(config.showReadingTime, true);
  });

  it('应保留目录联动，并只在显式配置时开启阅读位置记忆', () => {
    const config = resolveReadingProgressConfig({
      showTocProgress: false,
      rememberPosition: true,
    });

    assert.equal(config.showTocProgress, false);
    assert.equal(config.rememberPosition, true);
  });

  it('应移除 frontmatter、代码块和 Markdown 标记', () => {
    const markdown = [
      '---',
      'title: 测试',
      '---',
      '# 标题',
      '',
      '中文内容 [链接](https://example.com)',
      '',
      '```ts',
      'const value = 1;',
      '```',
    ].join('\n');

    assert.equal(cleanMarkdownForReading(markdown, false), '标题 中文内容 链接');
    assert.equal(cleanMarkdownForReading(markdown, true), '标题 中文内容 链接 const value = 1;');
  });

  it('应按中文字符和英文单词计算阅读时间', () => {
    const config = resolveReadingProgressConfig({ wordsPerMinute: 10 });
    const stats = createReadingStats(createPost(), '中文中文 hello world', config);

    assert.equal(countReadingWords('中文中文 hello world'), 6);
    assert.equal(stats.wordCount, 6);
    assert.equal(stats.readingTimeMinutes, 1);
  });

  it('有共享内容索引时应复用文章元数据并只读取正文', async () => {
    const filePath = path.join(os.tmpdir(), `cogita-reading-${Date.now()}.md`);
    await writeFile(filePath, 'hello', 'utf8');

    try {
      const stats = await extractReadingStats(
        'missing-posts',
        process.cwd(),
        'posts',
        ['md'],
        resolveReadingProgressConfig({ wordsPerMinute: 10 }),
        {
          getPosts: async () => [
            {
              title: '索引文章',
              filePath,
              route: '/posts/indexed',
              createDate: '2026-08-24',
              updateDate: '2026-08-24',
              url: '/posts/indexed',
            },
          ],
        }
      );

      assert.equal(stats[0].route, '/posts/indexed');
      assert.equal(stats[0].wordCount, 1);
    } finally {
      await rm(filePath, { force: true });
    }
  });
});
