import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { pluginImages, rehypeImageFigure } from '../dist/index.js';

describe('图片插件能力契约', () => {
  it('显式关闭时不应注册插件或声明图片能力', () => {
    assert.equal(
      pluginImages({
        root: process.cwd(),
        cwd: process.cwd(),
        images: { enabled: false },
      }),
      null
    );
  });

  it('启用时应声明图片能力和文章索引依赖', () => {
    const plugin = pluginImages({
      root: process.cwd(),
      cwd: process.cwd(),
      images: { enabled: true },
    });

    assert.deepEqual(plugin?.cogita?.providesCapabilities, ['content.images']);
    assert.deepEqual(plugin?.cogita?.requiresCapabilities, ['content.posts']);
  });

  it('启用时应注册 Markdown 图片说明文字转换器', () => {
    const plugin = pluginImages({
      root: process.cwd(),
      cwd: process.cwd(),
      images: { enabled: true },
    });

    assert.equal(plugin?.markdown?.rehypePlugins?.[0], rehypeImageFigure);
  });
});
