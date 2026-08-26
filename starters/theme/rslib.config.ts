import { pluginReact } from '@rsbuild/plugin-react';
import { pluginSass } from '@rsbuild/plugin-sass';
import { defineConfig } from '@rslib/core';
import { pluginPublint } from 'rsbuild-plugin-publint';

export default defineConfig({
  plugins: [pluginPublint()],
  lib: [
    {
      bundle: false,
      dts: { bundle: true },
      plugins: [pluginReact(), pluginSass()],
      format: 'esm',
      source: {
        entry: { index: ['./src/**'] },
      },
      output: {
        target: 'web',
        externals: [
          '@rspress/runtime',
          '@rspress/core/runtime',
          '@theme',
          'virtual-routes',
          'virtual-site-data',
          'virtual-global-styles',
          'virtual-global-components',
          'virtual-i18n-text',
        ],
        injectStyles: true,
        copy: [{ from: './src/theme.css', to: './' }],
      },
    },
  ],
});
