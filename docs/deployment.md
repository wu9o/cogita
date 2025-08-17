# Deployment Guide

This guide covers different ways to deploy your Cogita blog.

## GitHub Pages (Recommended)

### Automatic Deployment with GitHub Actions

The repository is configured with GitHub Actions for automatic deployment to GitHub Pages.

#### Setup Steps:

1. **Enable GitHub Pages**:
   - Go to your repository settings
   - Navigate to "Pages" section
   - Set source to "GitHub Actions"

2. **Push to main branch**:
   ```bash
   git push origin main
   ```

3. **Access your site**:
   - Your blog will be available at `https://username.github.io/cogita/`
   - Check the Actions tab for deployment status

#### Configuration:

The deployment is configured in `.github/workflows/deploy.yml` and includes:
- Node.js 18 setup
- pnpm package manager
- Automatic dependency caching
- Package building
- Blog building and deployment

### Manual Deployment

For manual deployment to GitHub Pages:

```bash
# Build and deploy
pnpm run deploy

# Or step by step
pnpm run build:packages
pnpm --filter blog build
pnpm --filter blog deploy
```

## Vercel

### One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/wu9o/cogita)

### Manual Setup

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Deploy**:
   ```bash
   # Build packages first
   pnpm run build:packages
   
   # Deploy from blog directory
   cd blog
   vercel --prod
   ```

3. **Configure Build Settings**:
   - Build Command: `pnpm run build`
   - Output Directory: `doc_build`
   - Install Command: `pnpm install`

## Netlify

### Git-based Deployment

1. **Connect Repository**:
   - Go to Netlify dashboard
   - Click "New site from Git"
   - Connect your GitHub repository

2. **Configure Build Settings**:
   - Base directory: `blog`
   - Build command: `pnpm run build:packages && pnpm run build`
   - Publish directory: `blog/doc_build`

3. **Environment Variables**:
   ```
   NODE_VERSION=18
   NPM_FLAGS=--prefix=/dev/null
   ```

### Manual Deploy

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Build and deploy
pnpm run build
netlify deploy --prod --dir=blog/doc_build
```

## Cloudflare Pages

1. **Connect Repository**:
   - Go to Cloudflare Pages dashboard
   - Connect your GitHub repository

2. **Configure Build**:
   - Framework preset: None
   - Build command: `pnpm run build:packages && cd blog && pnpm run build`
   - Build output directory: `blog/doc_build`
   - Root directory: `/`

3. **Environment Variables**:
   ```
   NODE_VERSION=18
   ```

## Custom Server

### Static File Hosting

After building, you can serve the `blog/doc_build` directory with any static file server:

```bash
# Build the site
pnpm run build

# Serve with any static server
npx serve blog/doc_build
# or
python -m http.server 8000 --directory blog/doc_build
# or
php -S localhost:8000 -t blog/doc_build
```

### Docker Deployment

Create a `Dockerfile` in the blog directory:

```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json pnpm-lock.yaml ./
RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm run build:packages
RUN pnpm --filter blog build

FROM nginx:alpine
COPY --from=builder /app/blog/doc_build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

Build and run:

```bash
docker build -t cogita-blog .
docker run -p 8080:80 cogita-blog
```

## Configuration for Different Environments

### Base URL Configuration

The blog automatically configures the base URL based on the environment:

```typescript
// blog/rspress.config.ts
export default defineConfig({
  base: process.env.NODE_ENV === 'production' ? '/cogita/' : '/',
  // ... other config
});
```

### Custom Domain

For custom domains, update the base configuration:

```typescript
export default defineConfig({
  base: '/', // For custom domains
  // ... other config
});
```

## Troubleshooting

### Common Issues

1. **404 on GitHub Pages**:
   - Ensure the base path is correctly set
   - Check that GitHub Pages is enabled in repository settings

2. **Build Failures**:
   - Verify Node.js version (18+)
   - Check that all dependencies are installed
   - Ensure packages are built before blog build

3. **Asset Loading Issues**:
   - Verify base URL configuration
   - Check asset paths in your content

### Debug Commands

```bash
# Check build output
pnpm run build
ls -la blog/doc_build

# Test locally
pnpm --filter blog preview

# Check package builds
pnpm run build:packages
```

## Performance Optimization

### Build Optimization

- Use `pnpm` for faster installs
- Enable caching in CI/CD
- Build packages only when changed

### Runtime Optimization

- Enable compression on your server
- Use CDN for assets
- Configure proper cache headers

For more deployment options and advanced configurations, see the [Rspress deployment documentation](https://rspress.dev/guide/basic/deploy).