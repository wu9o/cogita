# Development Guide

This guide covers the development workflow and code quality standards for Cogita.

## Code Quality Tools

Cogita uses a modern toolchain for code quality and consistency:

- **[Biome](https://biomejs.dev/)** - Fast formatter and linter
- **[Husky](https://typicode.github.io/husky/)** - Git hooks
- **[lint-staged](https://github.com/okonet/lint-staged)** - Run linters on staged files
- **[Commitlint](https://commitlint.js.org/)** - Conventional commit messages

## Setup

1. **Install dependencies**:
   ```bash
   pnpm install
   ```

2. **Initialize Git hooks**:
   ```bash
   pnpm run prepare
   ```

## Development Workflow

### Code Formatting and Linting

```bash
# Check code formatting and linting
pnpm run check

# Auto-fix formatting and linting issues
pnpm run check:fix

# Format code only
pnpm run format:fix

# Lint code only
pnpm run lint:fix
```

### Git Workflow

#### Commit Message Format

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Build process or auxiliary tool changes
- `ci`: CI configuration changes
- `build`: Build system changes
- `revert`: Reverting previous commits

**Examples:**
```bash
git commit -m "feat: add blog list pagination"
git commit -m "fix(plugin): resolve frontmatter parsing issue"
git commit -m "docs: update deployment guide"
git commit -m "chore: update dependencies"
```

#### Pre-commit Hooks

Before each commit, the following checks run automatically:

1. **lint-staged**: Formats and lints staged files
2. **Type checking**: Ensures TypeScript compilation
3. **Commit message validation**: Validates conventional commit format

If any check fails, the commit is blocked. Fix the issues and try again.

### Package Development

#### Creating a New Plugin

1. **Create package directory**:
   ```bash
   mkdir packages/plugin-your-feature
   cd packages/plugin-your-feature
   ```

2. **Initialize package**:
   ```bash
   pnpm init
   ```

3. **Follow the plugin structure**:
   ```
   plugin-your-feature/
   ├── src/
   │   ├── index.ts
   │   ├── plugin.ts
   │   ├── types.ts
   │   └── utils.ts
   ├── client.d.ts
   ├── package.json
   ├── tsconfig.json
   ├── rslib.config.ts
   └── README.md
   ```

4. **Use existing plugins as reference**, especially `plugin-posts-frontmatter`

#### Building Packages

```bash
# Build all packages
pnpm run build:packages

# Build specific package
pnpm --filter @cogita/plugin-name build

# Watch mode for development
pnpm --filter @cogita/plugin-name dev
```

## Code Style Guidelines

### TypeScript

- Use strict TypeScript configuration
- Prefer `interface` over `type` for object shapes
- Use explicit return types for public APIs
- Avoid `any` type (use `unknown` instead)

### Naming Conventions

- **Files**: kebab-case (`plugin-posts-frontmatter.ts`)
- **Directories**: kebab-case (`plugin-posts-frontmatter/`)
- **Variables/Functions**: camelCase (`getFrontmatterFromFile`)
- **Types/Interfaces**: PascalCase (`PostFrontmatter`)
- **Constants**: UPPER_SNAKE_CASE (`DEFAULT_ROUTE_PREFIX`)

### Import Organization

Biome automatically organizes imports in this order:

1. Node.js built-in modules
2. External packages
3. Internal packages (`@cogita/*`)
4. Relative imports

### Code Formatting

Biome is configured with these preferences:

- **Indentation**: 2 spaces
- **Line width**: 100 characters
- **Quotes**: Single quotes for strings, double for JSX
- **Semicolons**: Always
- **Trailing commas**: ES5 style

## Testing

### Running Tests

```bash
# Run all tests
pnpm run test

# Run tests for specific package
pnpm --filter @cogita/plugin-name test

# Watch mode
pnpm --filter @cogita/plugin-name test:watch
```

### Writing Tests

- Place tests in `__tests__` directory or alongside source files with `.test.ts` suffix
- Use descriptive test names
- Follow AAA pattern (Arrange, Act, Assert)
- Mock external dependencies

## Documentation

### Code Documentation

- Use JSDoc comments for public APIs
- Include examples in documentation
- Document complex algorithms and business logic

### README Files

Each package should have a comprehensive README with:

- Installation instructions
- Usage examples
- API documentation
- Configuration options

## Performance Considerations

### Build Performance

- Use incremental builds when possible
- Leverage caching in CI/CD
- Minimize dependencies

### Runtime Performance

- Avoid unnecessary re-renders
- Use lazy loading for large components
- Optimize bundle sizes

## Debugging

### Development Tools

- Use browser dev tools for client-side debugging
- Use Node.js debugger for build-time debugging
- Enable source maps for better stack traces

### Common Issues

1. **Build failures**: Check TypeScript errors and dependency issues
2. **Linting errors**: Run `pnpm run check:fix` to auto-fix
3. **Git hook failures**: Fix the underlying issues before committing

## IDE Setup

### VS Code (Recommended)

Install the recommended extensions:

- Biome - Formatting and linting
- TypeScript - Enhanced TypeScript support
- MDX - MDX file support

The workspace is pre-configured with optimal settings.

### Other IDEs

Configure your IDE to:

- Use Biome for formatting and linting
- Enable TypeScript strict mode
- Set up auto-import organization

## Continuous Integration

### GitHub Actions

Two workflows are configured:

1. **CI** (`ci.yml`): Runs on all pushes and PRs
   - Linting and formatting checks
   - Type checking
   - Tests

2. **Deploy** (`deploy.yml`): Runs on main branch
   - All CI checks
   - Build and deploy to GitHub Pages

### Local CI Simulation

Run the same checks locally:

```bash
# Full CI check
pnpm run check && pnpm run lint && pnpm run build:packages && pnpm run test
```

## Release Process

We use [Changesets](https://github.com/changesets/changesets) for version management:

1. **Add changeset**:
   ```bash
   pnpm changeset
   ```

2. **Version packages**:
   ```bash
   pnpm version-packages
   ```

3. **Release**:
   ```bash
   pnpm release
   ```

## Getting Help

- Check existing issues and discussions
- Read the documentation
- Ask questions in GitHub discussions
- Follow the code of conduct

Happy coding! 🚀