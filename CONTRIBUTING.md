# Contributing to Cogita

Thank you for your interest in contributing to Cogita! This guide will help you get started.

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18.0.0
- pnpm >= 8.0.0

### Setup

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/your-username/cogita.git
   cd cogita
   ```
3. Install dependencies:
   ```bash
   pnpm install
   ```
4. Start development:
   ```bash
   pnpm run dev
   ```

## 📦 Project Structure

```
cogita/
├── packages/           # Core packages and plugins
├── templates/          # Blog templates
├── examples/           # Usage examples
├── blog/              # Personal blog (example)
├── docs/              # Documentation
└── scripts/           # Build and utility scripts
```

## 🛠️ Development Workflow

For detailed development guidelines, see our [Development Guide](./docs/development.md).

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

## 📝 Creating a New Plugin

1. Create a new directory in `packages/`:
   ```bash
   mkdir packages/plugin-your-feature
   cd packages/plugin-your-feature
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

4. Use the existing plugins as reference, especially `plugin-posts-frontmatter`

## 🎨 Creating a New Theme

1. Create a new directory in `packages/`:
   ```bash
   mkdir packages/theme-your-theme
   ```

2. Follow the theme structure (to be defined)

## 📋 Pull Request Guidelines

1. **Fork & Branch**: Create a feature branch from `main`
2. **Commit Messages**: Use conventional commits format:
   - `feat: add new plugin`
   - `fix: resolve issue with plugin`
   - `docs: update README`
   - `chore: update dependencies`

3. **Testing**: Ensure all tests pass
4. **Documentation**: Update relevant documentation
5. **Changeset**: Add a changeset for your changes:
   ```bash
   pnpm changeset
   ```

## 🐛 Reporting Issues

When reporting issues, please include:

- Node.js and pnpm versions
- Operating system
- Steps to reproduce
- Expected vs actual behavior
- Relevant code snippets or error messages

## 💡 Feature Requests

We welcome feature requests! Please:

1. Check existing issues first
2. Provide a clear use case
3. Explain the expected behavior
4. Consider if it fits the project scope

## 📚 Documentation

- Update README files for any new features
- Add JSDoc comments to public APIs
- Update the main documentation in `/docs`

## 🔄 Release Process

We use [Changesets](https://github.com/changesets/changesets) for version management:

1. Add changeset: `pnpm changeset`
2. Version packages: `pnpm version-packages`
3. Release: `pnpm release`

## 🤝 Code of Conduct

Please be respectful and constructive in all interactions. We're building this together!

## ❓ Questions

If you have questions, feel free to:

- Open a discussion on GitHub
- Create an issue with the "question" label
- Reach out to the maintainers

Thank you for contributing to Cogita! 🎉