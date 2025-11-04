# @cogita/cli

[![npm version](https://badge.fury.io/js/@cogita%2Fcli.svg)](https://badge.fury.io/js/@cogita%2Fcli)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green)](https://nodejs.org/)

[中文](./README.md) | **English**

> Command line interface for creating and managing Cogita blogs.

## What is it?

`@cogita/cli` provides a simple yet powerful set of commands to create, develop, and build Cogita blog projects. Get started in seconds with built-in templates and development tools.

## Installation

### Global Installation (Recommended)

```bash
# Using pnpm
pnpm add -g @cogita/cli

# Using npm
npm install -g @cogita/cli

# Using yarn
yarn global add @cogita/cli
```

### Use without Installation

```bash
npx @cogita/cli --help
```

## Quick Start

### Create a New Blog

```bash
# Interactive creation
cogita create

# Create with name
cogita create my-blog

# Create with template
cogita create my-blog --template minimal
```

### Development

```bash
# Start development server
cogita dev

# Custom port and host  
cogita dev --port 8080 --host 0.0.0.0
```

### Build & Deploy

```bash
# Build for production
cogita build

# Build to custom directory
cogita build --outDir dist

# Preview build result
cogita preview
```

## Available Commands

### `cogita create [name]`

Create a new Cogita blog project.

**Options:**
- `-t, --template <name>` - Template to use (default: "basic")  
- `-p, --package-manager <pm>` - Package manager (npm|yarn|pnpm)
- `--no-git` - Skip Git initialization
- `--no-install` - Skip dependency installation
- `-f, --force` - Overwrite existing directory

**Templates:**
- `basic` - Full-featured blog template (default)
- `minimal` - Minimal setup with essential features
- `tech` - Developer-focused template with code highlighting
- `personal` - Personal blog template with social integration

### `cogita dev`

Start development server with hot reload.

**Options:**
- `-p, --port <port>` - Port number (default: 3000)
- `-h, --host <host>` - Host address (default: "localhost")  
- `--open` - Open browser automatically (default: true)
- `--debug` - Enable debug mode

### `cogita build`

Build static site for production.

**Options:**
- `-o, --outDir <dir>` - Output directory (default: "dist")
- `--base <base>` - Base path for deployment
- `--clean` - Clean output directory before build
- `--analyze` - Analyze build output

### `cogita preview`

Preview the built site locally.

**Options:**
- `-p, --port <port>` - Port number (default: 4173)
- `--open` - Open browser automatically

## Example Workflows

### Basic Blog Setup

```bash
# Create and start developing
cogita create my-blog
cd my-blog
cogita dev
```

### Deploy to GitHub Pages

```bash
# Build with correct base path
cogita build --base /my-blog/

# The built files are ready for GitHub Pages
```

### Custom Development

```bash
# Use different port and enable debug
cogita dev --port 8080 --debug

# Build and analyze output
cogita build --analyze
```

## Project Templates

### Basic Template
Full-featured blog with:
- Lucid theme pre-configured
- Example posts and pages
- Social links setup
- SEO optimizations

### Minimal Template  
Lightweight setup with:
- Essential configuration only
- Single example post
- Clean starting point

### Tech Template
Developer-oriented with:
- Code syntax highlighting
- Technical blog layout
- GitHub integration
- Developer-friendly defaults

### Personal Template
Personal branding focus:
- Social media integration
- About page template
- Portfolio sections
- Personal blog styling

## Configuration

### CLI Configuration

Create `.cogitarc.json` in your project:

```json
{
  "defaultTemplate": "tech",
  "packageManager": "pnpm",
  "devServer": {
    "port": 3000,
    "open": true
  }
}
```

### Environment Variables

```bash
export COGITA_PACKAGE_MANAGER=pnpm
export COGITA_DEFAULT_TEMPLATE=minimal
export COGITA_DEBUG=true
```

## Troubleshooting

### Port Already in Use

```bash
# Use different port
cogita dev --port 3001

# Auto-select available port
cogita dev --port auto
```

### Build Issues

```bash
# Clean build
cogita build --clean

# Debug build
cogita build --debug
```

### Template Issues

```bash
# Force recreate
cogita create my-blog --force

# Skip automatic installation
cogita create my-blog --no-install
```

## Learn More

- 📖 [Complete Documentation](../../docs/README.md)
- 🧠 [Core Package](../core) - The engine behind CLI
- 🎨 [UI Components](../ui) - Available components
- 💡 [Best Practices](../../docs/best-practices.md)

## Related Packages

- [🧠 @cogita/core](../core) - Core blog engine
- [🎨 @cogita/ui](../ui) - UI component library  
- [🌟 @cogita/theme-lucid](../../themes/lucid) - Default theme

## License

MIT © [wu9o](https://github.com/wu9o)