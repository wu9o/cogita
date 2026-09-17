# Contributing to Cogita

Thank you for helping make Cogita a better open-source framework. Contributions can improve the core contracts, themes, plugins, documentation, demos, templates, or the developer experience around them.

Before starting a larger change, open an issue or discussion so the scope and public API can be aligned early.

## Getting started

### Prerequisites

- Node.js >= 18.0.0
- pnpm >= 9.0.0

### Setup

1. Fork the repository and create a branch from `main`.
2. Clone your fork:
   ```bash
   git clone https://github.com/your-username/cogita.git
   cd cogita
   ```
3. Install dependencies:
   ```bash
   pnpm install
   ```
4. Build the workspace packages before changing package consumers:
   ```bash
   pnpm run build:packages
   ```
5. Start development:
   ```bash
   pnpm run dev
   ```

## Project structure

```
cogita/
├── packages/           # Core, CLI, shared types, UI, and CLI templates
├── plugins/            # Optional capabilities such as search, RSS, SEO, and content sources
├── themes/             # Official Docs, Lucid, Editorial, and Knowledge themes
├── demos/              # Independent consumers used by the live theme showcase
├── docs-site/          # Framework handbook source and generated site
├── examples/           # Deployment and external-content examples
└── scripts/            # Build, release, compatibility, and consumer checks
```

## Development workflow

For detailed development guidelines, see our [Development Guide](./docs-site/content/guides/development.md).

### Code Quality

We use Biome for formatting and linting:

```bash
# Check code quality
pnpm run check

# Auto-fix issues
pnpm run check:fix

# Format code
pnpm run format:fix

# Lint code
pnpm run lint:fix
```

### Building Packages

```bash
# Build all packages
pnpm run build:packages

# Build specific plugin
pnpm --filter @cogita/plugin-name build
```

### Testing

```bash
# Run all tests
pnpm run test

# Test specific package
pnpm --filter @cogita/plugin-name test
```

## Creating a plugin

1. Create a new directory in `plugins/`:
   ```bash
   mkdir plugins/your-feature
   cd plugins/your-feature
   ```

2. Initialize the package:
   ```bash
   pnpm init
   ```

3. Follow the plugin template structure:
   ```
   plugin-your-feature/
   ├── src/
   │   ├── index.ts
   │   ├── plugin.ts
   │   └── types.ts
   ├── client.d.ts
   ├── package.json
   ├── tsconfig.json
   ├── rslib.config.ts
   └── README.md
   ```

4. Use an existing plugin as a reference, especially [`plugins/posts-frontmatter`](./plugins/posts-frontmatter).
5. Keep the factory contract, configuration namespace, capability declarations, and README aligned with the implementation.

## Creating a theme

1. Create a new directory in `themes/`:
   ```bash
   mkdir themes/your-theme
   ```

2. Use an existing official theme as a reference. A theme should expose a `getThemeConfig()` entry point, own its layouts and styles, and declare the plugins it needs.
3. Add an independent consumer under `demos/` so the theme can be evaluated with real content.
4. Add the theme to the package map, documentation, and demo showcase when it becomes an official theme.

## Documentation and demos

Public-facing changes should update the closest documentation path and, when relevant, an independent demo. Prefer showing a working configuration and rendered result over describing a capability only in abstract terms.

When changing a public contract, check:

- the package README and API reference;
- the English and Chinese handbook pages when both exist;
- at least one real demo or CLI template consumer;
- generated output, links, and the relevant package boundary check.

## Pull request guidelines

1. **Branch**: Create a focused branch from `main`.
2. **Commit messages**: Use conventional commits format:
   - `feat: add new plugin`
   - `fix: resolve issue with plugin`
   - `docs: update README`
   - `chore: update dependencies`

3. **Scope**: Keep implementation, documentation, and generated examples consistent.
4. **Validation**: Run the checks relevant to the change and include the results in the pull request.
5. **Documentation**: Update the README, handbook, package docs, or demo when the public behavior changes.
6. **Changeset**: Add a changeset for published package changes:
   ```bash
   pnpm changeset
   ```

## Reporting issues

When reporting issues, please include:

- Node.js and pnpm versions
- Operating system
- Steps to reproduce
- Expected vs actual behavior
- Relevant code snippets or error messages

## Feature requests

We welcome feature requests! Please:

1. Check existing issues first
2. Provide a clear use case
3. Explain the expected behavior
4. Consider if it fits the project scope

## Documentation

- Update README files for any new features
- Add JSDoc comments to public APIs
- Update the handbook under `docs-site/content/`

## Release process

We use [Changesets](https://github.com/changesets/changesets) for version management:

1. Add changeset: `pnpm changeset`
2. Version packages: `pnpm version-packages`
3. Release: `pnpm release`

## Code of conduct

Please be respectful and constructive in all interactions. We're building this together!

## Questions

If you have questions, feel free to:

- Open a discussion on GitHub
- Create an issue with the "question" label
- Reach out to the maintainers

Thank you for contributing to Cogita! 🎉
