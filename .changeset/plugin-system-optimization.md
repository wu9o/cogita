---
"@cogita/core": minor
"@cogita/plugin-rss": minor
"@cogita/plugin-posts-frontmatter": patch
"@cogita/theme-lucid": patch
"@cogita/shared": patch
---

feat: optimize plugin system architecture

- Standardize plugin factory pattern for consistent API across all plugins
- Enhance framework configuration handling with comprehensive type safety
- Move configuration validation responsibility from themes to plugins
- Add structured configuration namespaces (posts, rss) with proper defaults
- Improve error handling and graceful degradation when plugins fail
- Maintain backward compatibility with existing configurations

**Key improvements:**
- Unified plugin declaration in themes: `plugins: [pluginPostsFrontmatter, pluginRSS]`
- Enhanced `CogitaFullConfig` with framework metadata and smart defaults
- Plugin-level configuration validation instead of theme-level
- Structured configuration: `config.posts` and `config.rss`
- Better TypeScript support with detailed type definitions

**Migration notes:**
- RSS plugin now auto-detects configuration from `config.rss` field
- Posts plugin supports both new structured config and legacy direct access
- Themes no longer need complex configuration handling logic
