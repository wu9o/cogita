import assert from 'node:assert/strict';
import path from 'node:path';
import { describe, it } from 'node:test';
import { createRspressConfig } from '../dist/es/index.js';

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
    assert.equal(receivedConfig.buildContext.strict, true);
    assert.equal(typeof receivedConfig.buildContext.logger.info, 'function');
  });

  it('应由 Core 提供可选插件的安全运行时默认模块', async () => {
    const rspressConfig = await createRspressConfig({}, '/tmp/cogita-runtime-defaults-test');
    const defaults = rspressConfig.plugins.find(({ name }) => name === 'cogita-runtime-defaults');
    const modules = await defaults.addRuntimeModules();

    assert.match(modules['virtual-tags-data'], /export const allTags = \[\];/);
    assert.match(modules['virtual-comments-data'], /enabled: false/);
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

    await assert.rejects(plugin.addPages(), /页面路由 \/same-page 重复注册/);
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
    await assert.rejects(plugins[1].addRuntimeModules(), /运行时模块 virtual-shared-data 重复注册/);
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

  it('严格模式下应拒绝重复注册的插件名称', async () => {
    const duplicatePlugin = () => ({ name: 'duplicate-test-plugin' });

    await assert.rejects(
      createRspressConfig(
        { plugins: [duplicatePlugin, duplicatePlugin] },
        '/tmp/cogita-plugin-registration-test'
      ),
      /重复注册/
    );
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
    await assert.rejects(
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

    await assert.rejects(
      createRspressConfig(
        {
          theme: '@cogita/theme-docs',
          plugins: [pluginWithLayoutRequirement],
        },
        path.resolve(process.cwd(), '../../docs-site')
      ),
      /缺少主题布局：自定义页面/
    );
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
