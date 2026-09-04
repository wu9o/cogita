---
title: Plugin development guide
---

# Plugin development guide

This guide explains how to build a Cogita plugin that can be enabled by a site or a theme without coupling the plugin to one visual layout. Plugins provide capabilities; themes decide how those capabilities are presented.

## Start with the contract

Read the [Plugin API specification](./plugin-api-specification.md) first. It defines factory return values, registration order, layout requirements, capability identifiers, virtual modules, diagnostics, and lifecycle boundaries.

A minimal plugin has its own package, a factory, and a small configuration namespace:

~~~text
plugins/your-feature/
├── src/
│   ├── index.ts
│   ├── plugin.ts
│   └── utils.ts
├── tests/
├── client.d.ts
├── package.json
├── tsconfig.json
└── rslib.config.ts
~~~

## Use the factory pattern

The factory receives the enhanced CogitaPluginConfig and returns a plugin instance:

~~~typescript
import type { CogitaPluginFactory } from '@cogita/shared';

export const pluginYourFeature: CogitaPluginFactory = (config) => {
  if (!config.yourFeature) return null;

  return {
    name: '@cogita/plugin-your-feature',
    async beforeBuild() {},
  };
};
~~~

Keep the plugin configuration under its own namespace. Return null when the capability is disabled or cannot run in the current site. This keeps the zero-configuration path quiet and lets Core assemble only the capabilities a site actually uses.

## Read shared build services

Build-time state is available through CogitaBuildContext:

~~~typescript
import { getCogitaBuildContext, getCogitaLogger } from '@cogita/shared';
import type { CogitaPluginFactory } from '@cogita/shared';

export const pluginYourFeature: CogitaPluginFactory = (config) => {
  const context = getCogitaBuildContext(config);
  const logger = getCogitaLogger(config);

  return {
    name: '@cogita/plugin-your-feature',
    async beforeBuild() {
      logger.info('Building site at ' + context.root);
      const posts = await context.contentIndex?.getPosts();
      logger.debug('Indexed posts: ' + (posts?.length ?? 0));
    },
  };
};
~~~

The context contains the site root, current working directory, shared contentIndex, theme layout paths, strict mode, the unified logger, and framework metadata. Legacy top-level fields remain for compatibility, but new build services belong in this context.

## Declare pages and capabilities

If a plugin generates a page, declare the layout it requires:

~~~typescript
export const pluginYourFeature: CogitaPluginFactory = () => ({
  name: '@cogita/plugin-your-feature',
  cogita: {
    requiredLayouts: [
      { layout: 'feature', label: 'Feature page' },
    ],
    providesCapabilities: ['content.feature'],
    requiresCapabilities: ['content.posts'],
  },
});
~~~

The layout name must match a key in the selected theme's pageLayouts. Use stable domain.capability identifiers for data contracts. Built-in identifiers should be imported from COGITA_CAPABILITIES in @cogita/shared.

Themes can mark capabilities as required or optional:

~~~typescript
export const themeExample = {
  name: '@cogita/theme-example',
  capabilities: {
    required: ['content.posts'],
    optional: ['content.feature'],
  },
  pageLayouts: {
    home: './layouts/Home.js',
    feature: './layouts/Feature.js',
  },
};
~~~

Core validates these declarations before the build. Missing required capabilities and missing layouts fail early in strict mode. Optional capabilities should have a visible, safe fallback in the theme.

## Share data through virtual modules

Use the shared content index when multiple plugins need the same source data. Use a virtual module when a theme layout needs serialized build output:

~~~typescript
import type { CogitaPluginFactory } from '@cogita/shared';

export const pluginYourFeature: CogitaPluginFactory = (config) => ({
  name: '@cogita/plugin-your-feature',
  addRuntimeModules() {
    const items = config.contentIndex?.getPosts?.() ?? [];
    return {
      'virtual-your-feature-data':
        'export const items = ' + JSON.stringify(items) + ';',
    };
  },
});
~~~

Every module identifier must be unique in one build. Use createCogitaVirtualModule and public identifiers from @cogita/shared when the module is part of a shared contract. Do not expose absolute paths, tokens, private configuration, or full article bodies unless that is explicitly part of the public data model.

## Respect lifecycle boundaries

Use one hook for one job:

- beforeBuild: validate options, read the shared index, and prepare build data.
- addPages: generate additional routes without rescanning content.
- addRuntimeModules: expose stable serialized data to browser code.
- afterBuild: write reports or inspect artifacts after generation.

Rspress may run build hooks concurrently. Do not coordinate plugins by relying on the order of the plugin array. A plugin should be safe to run more than once during development rebuilds and should avoid mutating another plugin's state.

## Register a site plugin

A site can add a plugin without modifying its theme:

~~~typescript
import { defineConfig } from '@cogita/core';
import { pluginYourFeature } from './plugins/your-feature';

export default defineConfig({
  theme: '@cogita/theme-lucid',
  plugins: [pluginYourFeature],
});
~~~

Core registers core capabilities, theme bridge plugins, theme plugins, and then site plugins. Plugin names must be unique. Strict mode is recommended for development and CI because duplicate names, conflicting routes, and conflicting runtime modules become actionable build errors.

## Test the consumer path

Tests should cover the plugin as a package and as part of a minimal site:

~~~bash
pnpm --filter @cogita/plugin-your-feature build
pnpm --filter @cogita/plugin-your-feature test
pnpm run build:packages
pnpm --filter docs-site build
~~~

At minimum, test:

- missing configuration and enabled: false returning null;
- default options and invalid configuration;
- shared build context and content index access;
- missing capabilities and missing layouts;
- duplicate plugin names in strict and non-strict modes;
- virtual module identifiers and serialized data;
- a minimal consumer that renders the plugin's page or UI.

When a published package changes, add a Changeset. Keep the package README, design document, and consumer example synchronized.

## Keep plugins portable

Avoid importing internal files from Core, themes, or another plugin. Depend on public types and helpers from @cogita/shared, and declare workspace dependencies with workspace:* during monorepo development.

Do not put site-specific content or business rules inside a reusable plugin. If a feature changes the composition of a reading experience, extend the theme; if it supplies reusable data or behavior, keep it in the plugin.
