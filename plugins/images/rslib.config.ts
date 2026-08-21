import { defineConfig } from '@rslib/core';
import { pluginPublint } from 'rsbuild-plugin-publint';

export default defineConfig({
  lib: [
    {
      bundle: false,
      dts: true,
      format: 'esm',
      output: {
        distPath: {
          root: './dist',
        },
      },
    },
  ],
  plugins: [pluginPublint()],
});
