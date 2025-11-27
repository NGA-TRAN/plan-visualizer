# Quick Start: GitHub Pages Deployment Pipeline

**Feature**: 004-github-pages-deployment  
**Date**: 2025-01-27

## Overview

This guide provides a quick start for implementing the GitHub Actions workflow to build and deploy the Plan Visualizer application to GitHub Pages.

## Prerequisites

- GitHub repository with GitHub Actions enabled
- GitHub Pages enabled for the repository
- Repository has `main` branch (or adjust workflow for your default branch)
- Node.js 18+ compatible application
- npm package manager (package-lock.json exists)

## Setup Steps

### 1. Enable GitHub Pages

1. Go to repository Settings → Pages
2. Select "GitHub Actions" as the source (not "Deploy from a branch")
3. Save settings

### 2. Create Workflow Directory

```bash
mkdir -p .github/workflows
```

### 3. Create Workflow File

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Cache dependencies
        uses: actions/cache@v4
        with:
          path: |
            node_modules
            dist
          key: ${{ runner.os }}-build-${{ hashFiles('**/package-lock.json') }}
          restore-keys: |
            ${{ runner.os }}-build-
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build application
        run: npm run build
      
      - name: Upload build artifacts
        uses: actions/upload-artifact@v4
        with:
          name: github-pages
          path: dist
          retention-days: 1

  deploy:
    needs: build
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deploy.outputs.page_url }}
    steps:
      - name: Download build artifacts
        uses: actions/download-artifact@v4
        with:
          name: github-pages
          path: dist
      
      - name: Setup Pages
        uses: actions/configure-pages@v4
      
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v4
        with:
          path: './dist'
      
      - name: Deploy to GitHub Pages
        id: deploy
        uses: actions/deploy-pages@v4
```

### 4. Commit and Push

```bash
git add .github/workflows/deploy.yml
git commit -m "Add GitHub Pages deployment workflow"
git push origin main
```

### 5. Verify Workflow

1. Go to repository → Actions tab
2. Verify workflow run appears
3. Click on workflow run to see progress
4. Wait for completion (~2-5 minutes)

### 6. Verify Deployment

1. Go to repository Settings → Pages
2. Find the GitHub Pages URL (e.g., `https://username.github.io/repo-name/`)
3. Visit the URL to verify site is deployed
4. Verify application functionality

## Testing

### Test Build on Pull Request

1. Create a feature branch
2. Make a change
3. Open a pull request to `main`
4. Verify workflow triggers
5. Verify build job runs
6. Verify deploy job is skipped (not main branch)
7. Verify build status appears in PR

### Test Deployment on Main

1. Merge pull request to `main`
2. Verify workflow triggers
3. Verify build job runs
4. Verify deploy job runs
5. Verify deployment completes
6. Verify site updates

### Test Cache Effectiveness

1. Push first commit → Note build time (uncached)
2. Push second commit (no dependency changes) → Note build time (cached)
3. Verify cached build is faster (50%+ improvement expected)

## Configuration Options

### Change Node Version

Update in workflow:
```yaml
- uses: actions/setup-node@v4
  with:
    node-version: '20'  # Change from '18' to '20'
```

### Change Build Directory

If your build outputs to a different directory:

1. Update `vite.config.ts`:
```typescript
export default defineConfig({
  build: {
    outDir: 'build',  // Change from 'dist'
  },
})
```

2. Update workflow paths:
```yaml
path: build  # Change from dist
```

### Change Default Branch

If using `master` instead of `main`:

```yaml
on:
  push:
    branches: [master]  # Change from main
  pull_request:
    branches: [master]  # Change from main
```

### Add Custom Domain

1. Add `CNAME` file to `public/` directory:
```
yourdomain.com
```

2. GitHub Pages will automatically use it after deployment

## Troubleshooting

### Workflow Not Triggering

**Issue**: Workflow doesn't run on push

**Solutions**:
- Verify workflow file is in `.github/workflows/` directory
- Verify YAML syntax is valid (check Actions tab for errors)
- Verify branch name matches workflow trigger (`main`)
- Verify GitHub Actions is enabled (Settings → Actions)

### Build Fails

**Issue**: Build job fails

**Solutions**:
- Check build logs in Actions tab
- Verify `npm run build` works locally
- Verify all dependencies are in package.json
- Check for TypeScript errors (run `npm run type-check` locally)

### Deployment Fails

**Issue**: Deploy job fails

**Solutions**:
- Verify GitHub Pages is enabled (Settings → Pages)
- Verify "GitHub Actions" is selected as source
- Verify permissions are correct (`pages: write`, `id-token: write`)
- Check deployment logs in Actions tab
- Verify build artifacts exist (`dist/` directory)

### Site Not Accessible

**Issue**: GitHub Pages URL returns 404

**Solutions**:
- Wait 1-2 minutes after deployment (propagation delay)
- Verify deployment succeeded (green checkmark in Actions)
- Check GitHub Pages settings (Settings → Pages)
- Verify base path in `vite.config.ts` matches repository name:
```typescript
export default defineConfig({
  base: '/repo-name/',  // If repo is not username.github.io
})
```

### Cache Not Working

**Issue**: Builds are slow, cache not effective

**Solutions**:
- Verify cache key includes file hash (`hashFiles('**/package-lock.json')`)
- Check cache hit rate in workflow logs
- Verify `package-lock.json` is committed
- Clear cache manually if needed (Actions → Caches → Delete)

## Best Practices

1. **Always test locally first**: Run `npm run build` before pushing
2. **Use `npm ci`**: Faster and more reliable than `npm install` in CI
3. **Cache dependencies**: Significantly speeds up builds
4. **Monitor build times**: Track performance over time
5. **Review workflow logs**: Check for warnings or errors
6. **Keep actions updated**: Use latest versions (v4) for security
7. **Test on PRs**: Catch build failures before merging
8. **Use concurrency**: Prevent multiple deployments from conflicting

## Performance Optimization

### Optimize Cache Keys

Use specific file hashes:
```yaml
key: ${{ runner.os }}-npm-${{ hashFiles('**/package-lock.json') }}
```

### Reduce Artifact Size

Only upload necessary files:
```yaml
path: dist  # Not node_modules or source files
```

### Use Shorter Retention

For faster cleanup:
```yaml
retention-days: 1  # Default is 90
```

## Security Considerations

1. **Use official actions**: Prefer `actions/*` over third-party
2. **Minimal permissions**: Only grant what's needed
3. **No secrets**: Use GITHUB_TOKEN (automatically provided)
4. **Review dependencies**: Keep npm packages updated
5. **Deploy only from main**: Prevents unauthorized deployments

## Next Steps

After successful deployment:

1. Monitor workflow runs for failures
2. Optimize cache keys if needed
3. Add deployment notifications (optional)
4. Set up custom domain (optional)
5. Configure branch protection rules (recommended)

## Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [actions/deploy-pages](https://github.com/actions/deploy-pages)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html#github-pages)

