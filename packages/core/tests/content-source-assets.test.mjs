import assert from 'node:assert/strict';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { createContentSourceAssetsPlugin } from '../dist/es/index.js';

const logger = {
  debug: () => undefined,
  info: () => undefined,
  warn: () => undefined,
  error: () => undefined,
};

test('Core 应将外部内容源资源复制到隔离公共目录', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'cogita-content-source-assets-'));
  const sourceFile = path.join(root, 'diagram.svg');
  await writeFile(sourceFile, '<svg>asset</svg>\n', 'utf8');

  try {
    const plugin = createContentSourceAssetsPlugin({
      root,
      cwd: root,
      contentSources: [
        {
          id: 'notes',
          async load() {
            return [];
          },
          async getAssets() {
            return [{ filePath: sourceFile, publicPath: 'external-content/notes/diagram.svg' }];
          },
        },
      ],
      buildContext: { root, cwd: root, logger },
    });

    await mkdir(path.join(root, '.cogita_content', 'public', 'external-content'), {
      recursive: true,
    });
    await plugin.beforeBuild();

    assert.equal(
      await readFile(
        path.join(root, '.cogita_content', 'public', 'external-content', 'notes', 'diagram.svg'),
        'utf8'
      ),
      '<svg>asset</svg>\n'
    );

    await plugin.afterBuild({ root, outDir: 'doc_build' }, true);
    assert.equal(
      await readFile(
        path.join(root, 'doc_build', 'external-content', 'notes', 'diagram.svg'),
        'utf8'
      ),
      '<svg>asset</svg>\n'
    );
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('Core 应拒绝越出公共目录的外部资源路径', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'cogita-content-source-assets-'));
  const sourceFile = path.join(root, 'diagram.svg');
  await writeFile(sourceFile, '<svg></svg>\n', 'utf8');

  try {
    const plugin = createContentSourceAssetsPlugin({
      root,
      cwd: root,
      contentSources: [
        {
          id: 'notes',
          async load() {
            return [];
          },
          async getAssets() {
            return [{ filePath: sourceFile, publicPath: '../diagram.svg' }];
          },
        },
      ],
      buildContext: { root, cwd: root, logger },
    });

    await assert.rejects(plugin.beforeBuild(), /外部内容源资源路径无效/);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
