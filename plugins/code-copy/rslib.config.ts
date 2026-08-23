import { defineConfig } from '@rslib/core';
import { pluginPublint } from 'rsbuild-plugin-publint';

export default defineConfig({
  plugins: [pluginPublint()],
  lib: [
    {
      bundle: false,
      dts: {
        bundle: true,
      },
      format: 'esm',
      source: {
        entry: {
          index: ['./src/index.ts'],
          plugin: ['./src/plugin.ts'],
          types: ['./src/types.ts'],
        },
      },
      output: {
        target: 'node',
      },
    },
  ],
});
