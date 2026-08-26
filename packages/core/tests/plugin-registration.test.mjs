import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, it } from 'node:test';
import {
  COGITA_BUILD_CONTEXT_VERSION,
  COGITA_CAPABILITIES,
  COGITA_CONTENT_INDEX_VERSION,
  COGITA_VIRTUAL_MODULE_IDS,
  COGITA_VIRTUAL_MODULE_SCHEMA_VERSION,
  getCogitaDiagnostic,
} from '@cogita/shared';
import { createRspressConfig } from '../dist/es/index.js';

const { version: coreVersion } = JSON.parse(
  readFileSync(new URL('../package.json', import.meta.url), 'utf8')
);
const workspaceRoot = new URL('../../..', import.meta.url).pathname;

async function captureRejection(promise, matcher) {
  let caught;
  await assert.rejects(promise, (error) => {
    caught = error;
    return matcher.test(error.message);
  });
  return caught;
}

describe('插件注册契约', () => {
  it('应按主题插件之后的顺序加载用户插件，并注入统一构建上下文', async () => {
    let receivedConfig;
    const userPlugin = (config) => {
      receivedConfig = config;
      return { name: 'test-user-plugin' };
    };

    const rspressConfig = await createRspressConfig(
      { plugins: [userPlugin] },
      '/tmp/cogita-plugin-registration-test'
    );
    const pluginNames = rspressConfig.plugins.map(({ name }) => name);

    assert.equal(pluginNames.at(0), 'cogita-content-index');
    assert.equal(pluginNames.at(1), 'cogita-runtime-defaults');
    assert.equal(pluginNames.at(-1), 'test-user-plugin');
    assert.equal(receivedConfig.buildContext.root, '/tmp/cogita-plugin-registration-test');
    assert.equal(receivedConfig.buildContext.contractVersion, COGITA_BUILD_CONTEXT_VERSION);
    assert.equal(receivedConfig.contentIndex.contractVersion, COGITA_CONTENT_INDEX_VERSION);
    assert.equal(receivedConfig.buildContext.strict, true);
    assert.equal(receivedConfig.buildContext.framework.version, coreVersion);
    assert.equal(typeof receivedConfig.buildContext.logger.info, 'function');
  });

  it('应由 Core 提供可选插件的安全运行时默认模块', async () => {
    const rspressConfig = await createRspressConfig({}, '/tmp/cogita-runtime-defaults-test');
    const defaults = rspressConfig.plugins.find(({ name }) => name === 'cogita-runtime-defaults');
    assert.equal(defaults.cogita.runtimeModulePolicy, 'fallback');
    const modules = await defaults.addRuntimeModules();

    assert.match(
      modules[COGITA_VIRTUAL_MODULE_IDS.TAGS_DATA],
      new RegExp(`cogitaVirtualModuleVersion = ${COGITA_VIRTUAL_MODULE_SCHEMA_VERSION}`)
    );
    assert.match(modules[COGITA_VIRTUAL_MODULE_IDS.TAGS_DATA], /export const allTags = \[\];/);
    assert.match(modules[COGITA_VIRTUAL_MODULE_IDS.COMMENTS_DATA], /enabled: false/);
  });

  it('应接受已满足的插件能力契约', async () => {
    const rspressConfig = await createRspressConfig(
      {
        plugins: [
          () => ({
            name: 'capability-provider-plugin',
            cogita: { providesCapabilities: ['test.content'] },
          }),
          () => ({
            name: 'capability-consumer-plugin',
            cogita: { requiresCapabilities: ['test.content'] },
          }),
        ],
      },
      '/tmp/cogita-capability-contract-test'
    );

    assert.ok(rspressConfig.plugins.some(({ name }) => name === 'capability-consumer-plugin'));
  });

  it('严格模式下应拒绝缺失的插件能力契约', async () => {
    const error = await captureRejection(
      createRspressConfig(
        {
          plugins: [
            () => ({
              name: 'missing-capability-consumer-plugin',
              cogita: { requiresCapabilities: ['test.missing'] },
            }),
          ],
        },
        '/tmp/cogita-missing-capability-test'
      ),
      /能力契约未满足.*插件 missing-capability-consumer-plugin 依赖能力 test\.missing/
    );
    assert.equal(getCogitaDiagnostic(error)?.code, 'COGITA_CAPABILITY_MISSING');
    assert.match(getCogitaDiagnostic(error)?.hint || '', /theme\.capabilities\.required/);
    assert.deepEqual(getCogitaDiagnostic(error)?.details, {
      missingCapabilities: ['插件 missing-capability-consumer-plugin 依赖能力 test.missing'],
    });
  });

  it('非严格模式下应警告并继续构建缺失的能力契约', async () => {
    const warnings = [];
    const originalWarn = console.warn;
    console.warn = (message) => warnings.push(message);

    try {
      const rspressConfig = await createRspressConfig(
        {
          strict: false,
          plugins: [
            () => ({
              name: 'non-strict-missing-capability-plugin',
              cogita: { requiresCapabilities: ['test.optional'] },
            }),
          ],
        },
        '/tmp/cogita-missing-capability-test'
      );

      assert.ok(
        rspressConfig.plugins.some(({ name }) => name === 'non-strict-missing-capability-plugin')
      );
    } finally {
      console.warn = originalWarn;
    }

    assert.equal(warnings.length, 1);
    assert.match(warnings[0], /能力契约未满足.*test\.optional/);
  });

  it('内置插件应暴露稳定的能力标识', async () => {
    const rspressConfig = await createRspressConfig(
      {
        theme: path.resolve(workspaceRoot, 'themes/lucid/dist/index.js'),
        tags: { enabled: true },
        collections: { enabled: true },
        categories: { enabled: true },
        blogList: { enabled: true },
        search: { enabled: true },
        readingProgress: { enabled: true },
        codeCopy: { enabled: true },
        seo: { enabled: true },
        sitemap: { enabled: true },
      },
      workspaceRoot
    );
    const findPlugin = (name) => rspressConfig.plugins.find((plugin) => plugin.name === name);

    assert.deepEqual(findPlugin('@cogita/plugin-posts-frontmatter').cogita.providesCapabilities, [
      COGITA_CAPABILITIES.CONTENT_POSTS,
    ]);
    assert.deepEqual(findPlugin('@cogita/plugin-images').cogita.providesCapabilities, [
      'content.images',
    ]);
    assert.deepEqual(findPlugin('@cogita/plugin-images').cogita.requiresCapabilities, [
      'content.posts',
    ]);
    assert.deepEqual(findPlugin('@cogita/plugin-seo').cogita.requiresCapabilities, [
      'content.posts',
    ]);
    assert.deepEqual(findPlugin('@cogita/plugin-sitemap').cogita.requiresCapabilities, [
      'content.posts',
    ]);
    assert.deepEqual(findPlugin('@cogita/plugin-tags').cogita.requiresCapabilities, [
      'content.posts',
    ]);
    assert.deepEqual(findPlugin('@cogita/plugin-search').cogita.providesCapabilities, [
      'discovery.search',
    ]);

    const postsRuntime = await findPlugin('@cogita/plugin-posts-frontmatter').addRuntimeModules();
    assert.match(
      postsRuntime[COGITA_VIRTUAL_MODULE_IDS.POSTS_DATA],
      /cogitaVirtualModuleVersion = 1/
    );
    assert.match(postsRuntime[COGITA_VIRTUAL_MODULE_IDS.POSTS_DATA], /contentDataVersion = 1/);
  });

  it('严格模式下应拒绝插件生成重复页面路由', async () => {
    const rspressConfig = await createRspressConfig(
      {
        plugins: [
          () => ({
            name: 'duplicate-page-route-plugin',
            addPages: () => [{ routePath: '/same-page' }, { routePath: '/same-page' }],
          }),
        ],
      },
      '/tmp/cogita-page-route-test'
    );
    const plugin = rspressConfig.plugins.find(({ name }) => name === 'duplicate-page-route-plugin');

    const error = await captureRejection(plugin.addPages(), /页面路由 \/same-page 重复注册/);
    assert.equal(getCogitaDiagnostic(error)?.code, 'COGITA_PAGE_ROUTE_CONFLICT');
  });

  it('非严格模式下应保留首次注册的页面路由', async () => {
    const warnings = [];
    const originalWarn = console.warn;
    console.warn = (message) => warnings.push(message);

    let rspressConfig;
    let pages;
    try {
      rspressConfig = await createRspressConfig(
        {
          strict: false,
          plugins: [
            () => ({
              name: 'duplicate-page-route-plugin',
              addPages: () => [{ routePath: '/same-page' }, { routePath: '/same-page' }],
            }),
          ],
        },
        '/tmp/cogita-page-route-test'
      );
      const plugin = rspressConfig.plugins.find(
        ({ name }) => name === 'duplicate-page-route-plugin'
      );
      pages = await plugin.addPages();
    } finally {
      console.warn = originalWarn;
    }

    assert.equal(pages.length, 1);
    assert.equal(warnings.length, 1);
    assert.match(warnings[0], /非严格模式下保留首次注册/);
  });

  it('同一来源重复调用时应保持页面路由注册幂等', async () => {
    const rspressConfig = await createRspressConfig(
      {
        plugins: [
          () => ({
            name: 'idempotent-page-route-plugin',
            addPages: () => [{ routePath: '/same-page' }],
          }),
        ],
      },
      '/tmp/cogita-page-route-test'
    );
    const plugin = rspressConfig.plugins.find(
      ({ name }) => name === 'idempotent-page-route-plugin'
    );

    const firstPages = await plugin.addPages();
    const secondPages = await plugin.addPages();
    assert.deepEqual(secondPages, firstPages);
  });

  it('严格模式下应拒绝重复注册的运行时模块', async () => {
    const rspressConfig = await createRspressConfig(
      {
        plugins: [
          () => ({
            name: 'runtime-module-plugin-a',
            addRuntimeModules: () => ({ 'virtual-shared-data': 'export const source = "a";' }),
          }),
          () => ({
            name: 'runtime-module-plugin-b',
            addRuntimeModules: () => ({ 'virtual-shared-data': 'export const source = "b";' }),
          }),
        ],
      },
      '/tmp/cogita-runtime-module-test'
    );
    const plugins = rspressConfig.plugins.filter(({ name }) =>
      name.startsWith('runtime-module-plugin-')
    );

    await plugins[0].addRuntimeModules();
    const error = await captureRejection(
      plugins[1].addRuntimeModules(),
      /运行时模块 virtual-shared-data 重复注册/
    );
    assert.equal(getCogitaDiagnostic(error)?.code, 'COGITA_RUNTIME_MODULE_CONFLICT');
  });

  it('非严格模式下应保留首次注册的运行时模块并记录警告', async () => {
    const warnings = [];
    const originalWarn = console.warn;
    console.warn = (message) => warnings.push(message);

    let plugins;
    let secondModules;
    try {
      const rspressConfig = await createRspressConfig(
        {
          strict: false,
          plugins: [
            () => ({
              name: 'runtime-module-plugin-a',
              addRuntimeModules: () => ({ 'virtual-shared-data': 'export const source = "a";' }),
            }),
            () => ({
              name: 'runtime-module-plugin-b',
              addRuntimeModules: () => ({ 'virtual-shared-data': 'export const source = "b";' }),
            }),
          ],
        },
        '/tmp/cogita-runtime-module-test'
      );
      plugins = rspressConfig.plugins.filter(({ name }) =>
        name.startsWith('runtime-module-plugin-')
      );
      await plugins[0].addRuntimeModules();
      secondModules = await plugins[1].addRuntimeModules();
    } finally {
      console.warn = originalWarn;
    }

    assert.deepEqual(secondModules, {});
    assert.equal(warnings.length, 1);
    assert.match(warnings[0], /非严格模式下保留首次注册/);
  });

  it('真实插件应允许覆盖 Core 提供的默认运行时模块', async () => {
    const rspressConfig = await createRspressConfig(
      {
        plugins: [
          () => ({
            name: 'runtime-module-override-plugin',
            addRuntimeModules: () => ({
              'virtual-tags-data': 'export const allTags = [{ name: "Git" }];',
            }),
          }),
        ],
      },
      '/tmp/cogita-runtime-module-test'
    );
    const defaults = rspressConfig.plugins.find(({ name }) => name === 'cogita-runtime-defaults');
    const override = rspressConfig.plugins.find(
      ({ name }) => name === 'runtime-module-override-plugin'
    );

    await defaults.addRuntimeModules();
    const modules = await override.addRuntimeModules();
    assert.match(modules['virtual-tags-data'], /\{ name: "Git" \}/);
  });

  it('运行时默认模块应通过显式元数据识别，而不是依赖插件名称', async () => {
    const rspressConfig = await createRspressConfig(
      {
        plugins: [
          () => ({
            name: 'runtime-module-fallback-alias',
            cogita: { runtimeModulePolicy: 'fallback' },
            addRuntimeModules: () => ({
              'virtual-tags-data': 'export const allTags = [];',
            }),
          }),
        ],
      },
      '/tmp/cogita-runtime-module-test'
    );
    const fallbackAlias = rspressConfig.plugins.find(
      ({ name }) => name === 'runtime-module-fallback-alias'
    );
    const defaults = rspressConfig.plugins.find(({ name }) => name === 'cogita-runtime-defaults');

    await defaults.addRuntimeModules();
    await assert.rejects(
      fallbackAlias.addRuntimeModules(),
      /运行时模块 virtual-tags-data 重复注册/
    );
  });

  it('真实插件先完成时应丢弃迟到的 Core 默认运行时模块', async () => {
    const rspressConfig = await createRspressConfig(
      {
        plugins: [
          () => ({
            name: 'runtime-module-override-plugin',
            addRuntimeModules: () => ({
              'virtual-tags-data': 'export const allTags = [{ name: "Git" }];',
            }),
          }),
        ],
      },
      '/tmp/cogita-runtime-module-test'
    );
    const defaults = rspressConfig.plugins.find(({ name }) => name === 'cogita-runtime-defaults');
    const override = rspressConfig.plugins.find(
      ({ name }) => name === 'runtime-module-override-plugin'
    );

    await override.addRuntimeModules();
    const modules = await defaults.addRuntimeModules();
    assert.equal(modules['virtual-tags-data'], undefined);
  });

  it('同一来源重复调用时应保持运行时模块注册幂等', async () => {
    const rspressConfig = await createRspressConfig(
      {
        plugins: [
          () => ({
            name: 'idempotent-runtime-module-plugin',
            addRuntimeModules: () => ({
              'virtual-shared-data': 'export const source = "same";',
            }),
          }),
        ],
      },
      '/tmp/cogita-runtime-module-test'
    );
    const plugin = rspressConfig.plugins.find(
      ({ name }) => name === 'idempotent-runtime-module-plugin'
    );

    const firstModules = await plugin.addRuntimeModules();
    const secondModules = await plugin.addRuntimeModules();
    assert.deepEqual(secondModules, firstModules);
  });

  it('严格模式下应拒绝重复注册的插件名称', async () => {
    const duplicatePlugin = () => ({ name: 'duplicate-test-plugin' });

    const error = await captureRejection(
      createRspressConfig(
        { plugins: [duplicatePlugin, duplicatePlugin] },
        '/tmp/cogita-plugin-registration-test'
      ),
      /重复注册/
    );
    assert.equal(getCogitaDiagnostic(error)?.code, 'COGITA_PLUGIN_DUPLICATE');
  });

  it('非严格模式下应保留首次注册的插件并记录警告', async () => {
    const warnings = [];
    const duplicatePlugin = () => ({ name: 'duplicate-test-plugin' });
    const originalWarn = console.warn;
    console.warn = (message) => warnings.push(message);

    let rspressConfig;
    try {
      rspressConfig = await createRspressConfig(
        { strict: false, plugins: [duplicatePlugin, duplicatePlugin] },
        '/tmp/cogita-plugin-registration-test'
      );
    } finally {
      console.warn = originalWarn;
    }

    assert.equal(
      rspressConfig.plugins.filter(({ name }) => name === 'duplicate-test-plugin').length,
      1
    );
    assert.equal(warnings.length, 1);
    assert.match(warnings[0], /非严格模式下保留首次注册/);
  });

  it('严格模式下应拒绝没有 name 的插件返回值', async () => {
    const error = await captureRejection(
      createRspressConfig(
        {
          plugins: [
            () => ({
              beforeBuild() {
                return undefined;
              },
            }),
          ],
        },
        '/tmp/cogita-plugin-registration-test'
      ),
      /必须提供非空 name/
    );
    assert.equal(getCogitaDiagnostic(error)?.code, 'COGITA_PLUGIN_INVALID');
  });

  it('严格模式下应保留插件工厂错误的原始 cause', async () => {
    const originalError = new Error('factory exploded');

    await assert.rejects(
      createRspressConfig(
        {
          plugins: [
            () => {
              throw originalError;
            },
          ],
        },
        '/tmp/cogita-plugin-registration-test'
      ),
      (error) => {
        assert.match(error.message, /插件工厂执行失败：factory exploded/);
        assert.equal(error.cause, originalError);
        assert.equal(getCogitaDiagnostic(error)?.code, 'COGITA_PLUGIN_FACTORY_FAILED');
        return true;
      }
    );
  });

  it('应根据插件实例声明校验主题布局，而不是依赖核心插件清单', async () => {
    const pluginWithLayoutRequirement = () => ({
      name: 'layout-contract-plugin',
      cogita: {
        requiredLayouts: [{ layout: 'missing-layout', label: '自定义页面' }],
      },
    });

    const error = await captureRejection(
      createRspressConfig(
        {
          theme: '@cogita/theme-docs',
          plugins: [pluginWithLayoutRequirement],
        },
        path.resolve(process.cwd(), '../../docs-site')
      ),
      /缺少主题布局：自定义页面/
    );
    assert.equal(getCogitaDiagnostic(error)?.code, 'COGITA_THEME_LAYOUT_MISSING');
    assert.match(getCogitaDiagnostic(error)?.hint || '', /pageLayouts/);
  });

  it('布局需求可以根据最终插件配置决定是否启用', async () => {
    const pluginWithConditionalRequirement = () => ({
      name: 'conditional-layout-contract-plugin',
      cogita: {
        requiredLayouts: [
          {
            layout: 'missing-layout',
            label: '仅在启用时需要的页面',
            when: (config) => config.search?.enabled === true,
          },
        ],
      },
    });

    const rspressConfig = await createRspressConfig(
      { plugins: [pluginWithConditionalRequirement] },
      '/tmp/cogita-plugin-registration-test'
    );

    assert.equal(
      rspressConfig.plugins.some(({ name }) => name === 'conditional-layout-contract-plugin'),
      true
    );
  });
});
