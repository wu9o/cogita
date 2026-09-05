---
title: Architecture design
---

# Architecture design

Cogita is a theme-driven static site framework. Its architecture keeps site content, rendering decisions, reusable capabilities, and generated output on separate boundaries while allowing them to compose through typed contracts.

## Design principles

### Convention over configuration

Cogita starts with sensible defaults:

- articles live in a posts directory;
- handbook and reference pages live under contentDir;
- the site configuration is cogita.config.ts;
- themes declare the capabilities they need;
- plugins generate data and pages through public extension points.

The default path should produce a useful site. Advanced configuration should extend that path rather than replace it with framework internals.

### Themes are ecosystems

A theme is more than a visual skin. It defines page layouts, styles, navigation conventions, and the default plugin capabilities needed to make its reading experience coherent.

~~~text
site config → Core → theme → plugins → static output
~~~

### Progressive enhancement

The same project can grow through three levels:

1. zero-configuration startup with a basic page;
2. configured plugins, content sources, and theme options;
3. direct access to the underlying Rspress configuration when a site needs it.

### Public contracts first

Core, themes, and plugins communicate through public types, the shared ContentIndex, capability identifiers, and versioned virtual modules. A consumer should not need to import private files from another package.

## System boundaries

~~~mermaid
graph TB
  Site[Site repository<br/>config and content] --> Core[@cogita/core<br/>config and assembly]
  Core --> Theme[Theme package<br/>layouts and styles]
  Core --> Plugins[Plugin factories<br/>data and capabilities]
  Plugins --> Index[Shared ContentIndex]
  Plugins --> Modules[Virtual runtime modules]
  Theme --> Modules
  Theme --> Output[Static pages and assets]
  Core --> Output
~~~

The site repository owns content, branding, configuration, and local extensions. Core resolves the configuration and assembles the build. Themes own the reading surface. Plugins own reusable data or behavior. The generated directory is the handoff boundary to a host such as GitHub Pages.

## Configuration flow

The configuration lifecycle is:

1. the CLI locates and loads cogita.config.ts;
2. Core normalizes site, content, theme, plugin, and builder options;
3. Core resolves the selected theme from the consumer project;
4. the theme returns layouts, styles, and plugin factories;
5. Core instantiates core, theme, and site plugins;
6. Core validates layout and capability declarations;
7. Rspress receives the assembled configuration and renders static output.

Configuration responsibilities remain separated:

| Boundary | Responsibility |
| --- | --- |
| Site config | Branding, paths, content sources, and enabled capabilities |
| Core | Resolution, normalization, registration, validation, and assembly |
| Theme | Layouts, styles, navigation, and reading experience |
| Plugin | Data collection, generated pages, runtime modules, and diagnostics |
| Rspress | Markdown processing, rendering, bundling, and output |

## Theme resolution

Themes are runtime dependencies of the consumer site. Core resolves the configured package from the site project, loads its theme entry point, and validates the returned CogitaTheme. A legacy shorthand may remain for compatibility, but new sites should install and name their theme package explicitly.

A theme entry point declares the rendering boundary:

~~~typescript
import path from 'node:path';
import type { CogitaTheme } from '@cogita/shared';

export function getThemeConfig(): CogitaTheme {
  return {
    name: '@cogita/theme-example',
    pageLayouts: {
      home: './layouts/Home.js',
    },
    globalStyles: [path.resolve(__dirname, './theme.css')],
    plugins: [],
  };
}
~~~

Core resolves layout paths relative to the theme package that returned them. This keeps a theme portable and prevents the consumer from depending on a repository-specific directory.

## Plugin registration

Themes provide default plugin factories. Sites can add project-specific factories through the plugins option. The registry records each plugin's name and source, flattens factory results, validates the plugin shape, and detects conflicts.

~~~text
core plugins → theme bridge plugins → theme plugins → site plugins
~~~

This order resolves identity and conflicts; it is not a serial lifecycle dependency. Hooks may run concurrently, so plugins must not use array order to coordinate scanning or data preparation.

The registry validates:

- a non-empty unique plugin name;
- factory errors with the original cause preserved;
- required theme layouts;
- required and optional capabilities;
- duplicate page routes;
- duplicate virtual runtime module identifiers.

Strict mode stops the build for invalid or ambiguous contracts. Non-strict mode preserves the first registration where possible and emits a stable diagnostic through the shared logger.

## Layout and capability contracts

A plugin that creates a theme page declares the layout key it needs. Core validates this after all plugins are instantiated, so a missing page layout fails before deployment.

~~~typescript
export const pluginExample: CogitaPluginFactory = () => ({
  name: '@cogita/plugin-example',
  cogita: {
    requiredLayouts: [
      { layout: 'example', label: 'Example page' },
    ],
    providesCapabilities: ['content.example'],
    requiresCapabilities: ['content.posts'],
  },
});
~~~

Capabilities use stable domain.capability identifiers. A plugin can provide or require a capability, while a theme can classify it as required or optional. Built-in identifiers should come from COGITA_CAPABILITIES in @cogita/shared.

An optional capability must have a safe visual fallback. A required capability should fail early when no provider exists. Multiple providers for one capability are ambiguous and fail in strict mode.

## Shared content index

Content plugins collect and normalize source data into the shared ContentIndex. Themes and other plugins can consume the same index without rescanning the file system.

~~~text
posts/*.md        → frontmatter parser → post records
content/**/*.md   → document parser   → document records
external sources  → source adapter    → document records
                                         ↓
                                  shared ContentIndex
                                         ↓
                         search, tags, relations, themes
~~~

The index is the stable handoff between collection and presentation. A plugin should read the index through CogitaBuildContext and should only read full document bodies when its feature needs them.

## Virtual runtime modules

Some build-time data must reach browser-side theme components. Plugins expose that data through virtual modules:

~~~text
build-time plugin → serialized virtual module → theme component
~~~

Every public module identifier must be unique during one build and should carry its contract version. Use the shared module helpers and identifiers instead of inventing a second spelling for an existing contract.

Fallback modules may expose empty arrays or a disabled state for optional features. They must never expose machine paths, credentials, private configuration, or unneeded source content.

## Build lifecycle

The build is organized around explicit phases:

1. configuration loading and normalization;
2. theme resolution and plugin instantiation;
3. contract validation;
4. beforeBuild preparation;
5. page and virtual module registration;
6. Rspress rendering and asset bundling;
7. afterBuild reports and artifact checks.

Plugins should assign one responsibility to each hook:

- beforeBuild: validate configuration and prepare shared data;
- addPages: add generated routes without rescanning sources;
- addRuntimeModules: expose serialized runtime data;
- afterBuild: write reports or inspect output.

## Development and production paths

Development mode loads the same configuration and theme contracts as production, then starts the Rspress server with file watching. Production mode renders the static output and runs the configured artifact checks.

Keeping these paths aligned matters for adoption: a site author should be able to reproduce a deployment failure locally using the same base path, content sources, theme, and plugins.

For a project hosted under a repository path, keep site.base and builderConfig.output.assetPrefix aligned:

~~~typescript
export default defineConfig({
  site: {
    base: '/cogita/',
  },
  builderConfig: {
    output: {
      assetPrefix: '/cogita/',
    },
  },
});
~~~

## Extension boundary

Use a plugin when a capability can serve more than one theme or site. Use a theme extension when the feature changes page composition or visual hierarchy. Keep product-specific rules and content in the consumer repository.

This division lets Core remain stable while the ecosystem grows:

- new content sources become adapters or plugins;
- new discovery features consume the shared index;
- new visual experiences become themes;
- new deployment hosts consume the same static output.

## Contract evolution

Build context, content index, and virtual modules carry explicit version information where the contract is shared. Additive fields are preferred. When a breaking change is unavoidable, update the public types, design document, consumer examples, and Changeset together.

The architecture is successful when a theme can evolve its presentation, a plugin can evolve its capability, and a site can upgrade packages without copying framework internals or rewriting its content model.
