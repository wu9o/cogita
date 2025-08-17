import { defineConfig } from '@rslib/core';
import { pluginPublint } from 'rsbuild-plugin-publint';

const COMMON_EXTERNALS = ['@types/react'];

export default defineConfig({
  plugins: [pluginPublint()],
  lib: [
    {
      dts: {
        bundle: true,
        distPath: './dist/types',
      },
      format: 'esm',
      syntax: 'es2015',
      output: {
        distPath: {
          root: './dist/es',
        },
        externals: COMMON_EXTERNALS,
      },
    },
  ],
});
