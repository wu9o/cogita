import { pluginReact } from '@rsbuild/plugin-react';
import { pluginSass } from '@rsbuild/plugin-sass';
import { pluginSvgr } from '@rsbuild/plugin-svgr';
import { defineConfig } from '@rslib/core';
import { pluginPublint } from 'rsbuild-plugin-publint';

const COMMON_EXTERNALS = [
  'virtual-routes',
  'virtual-site-data',
  'virtual-global-styles',
  'virtual-global-components',
  'virtual-cogita-i18n-text',
  'virtual-search-data',
  'virtual-tags-data',
  'virtual-content-relations-data',
  '@rspress/runtime',
  '@rspress/core/runtime',
  '@theme',
  /@theme-assets\//,
  '@types/react',
];

export default defineConfig({
  plugins: [pluginPublint()],
  lib: [
    {
      bundle: false,
      dts: { bundle: true },
      plugins: [
        pluginReact(),
        pluginSvgr({ svgrOptions: { exportType: 'default' } }),
        pluginSass(),
      ],
      format: 'esm',
      syntax: 'es2015',
      source: {
        define: { __WEBPACK_PUBLIC_PATH__: '__webpack_public_path__' },
        entry: { index: ['./src/**'] },
      },
      tools: {
        rspack: {
          output: {
            environment: { const: false },
          },
        },
      },
      output: {
        target: 'web',
        externals: COMMON_EXTERNALS,
        cssModules: {
          localIdentName: '[local]_[hash:hex:5]',
          namedExport: false,
          exportLocalsConvention: 'camelCaseOnly',
        },
        injectStyles: true,
        copy: [{ from: './src/theme.css', to: './' }],
      },
    },
  ],
});
