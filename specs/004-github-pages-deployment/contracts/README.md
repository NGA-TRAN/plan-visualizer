# API Contracts: GitHub Pages Deployment Pipeline

**Feature**: 004-github-pages-deployment  
**Date**: 2025-01-27

## Overview

This feature uses GitHub Actions workflows, which are declarative YAML configurations rather than traditional APIs. This document defines the workflow contract, event triggers, and job specifications.

## Workflow Contract

### Workflow File Structure

**Location**: `.github/workflows/deploy.yml`

**Contract**:
```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps: [BuildSteps]
    outputs:
      artifact-path: ${{ steps.upload.outputs.path }}
  
  deploy:
    needs: build
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    permissions:
      contents: read
      pages: write
      id-token: write
    environment:
      name: github-pages
      url: ${{ steps.deploy.outputs.page_url }}
    steps: [DeploySteps]
```

---

## Event Triggers

### Push Event

**Trigger**: Code pushed to `main` branch

**Contract**:
```yaml
on:
  push:
    branches: [main]
```

**Behavior**:
- Triggers workflow run
- Executes build job
- Executes deploy job (conditional on main branch)
- Deploys to GitHub Pages

**Event Data**:
- `github.ref`: `refs/heads/main`
- `github.event_name`: `push`
- `github.sha`: Commit SHA that triggered workflow

---

### Pull Request Event

**Trigger**: Pull request opened or updated targeting `main` branch

**Contract**:
```yaml
on:
  pull_request:
    branches: [main]
```

**Behavior**:
- Triggers workflow run
- Executes build job only
- Skips deploy job (not main branch)
- Reports build status to PR

**Event Data**:
- `github.ref`: `refs/pull/{number}/merge`
- `github.event_name`: `pull_request`
- `github.event.pull_request.head.sha`: PR commit SHA

---

## Job Contracts

### Build Job

**Name**: `build`

**Contract**:
```yaml
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
```

**Inputs**: None (uses repository code)

**Outputs**:
- `artifact-name`: `github-pages`
- `artifact-path`: `dist`

**Success Criteria**:
- All steps complete with exit code 0
- Build artifacts exist in `dist/` directory
- Artifacts uploaded successfully

**Failure Criteria**:
- Any step fails (non-zero exit code)
- Build command fails
- Artifact upload fails

---

### Deploy Job

**Name**: `deploy`

**Contract**:
```yaml
jobs:
  deploy:
    needs: build
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    permissions:
      contents: read
      pages: write
      id-token: write
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

**Dependencies**: Requires `build` job to complete successfully

**Condition**: Only runs if `github.ref == 'refs/heads/main'`

**Permissions**:
- `contents: read` - Read repository contents
- `pages: write` - Write to GitHub Pages
- `id-token: write` - Generate OIDC token for Pages

**Inputs**:
- Build artifacts from `build` job

**Outputs**:
- `page_url`: GitHub Pages URL where site is deployed

**Success Criteria**:
- All steps complete with exit code 0
- Pages artifact uploaded successfully
- Deployment completes successfully
- Site accessible via GitHub Pages URL

**Failure Criteria**:
- Any step fails (non-zero exit code)
- Artifact download fails
- Pages configuration fails
- Deployment fails

---

## Action Contracts

### actions/checkout@v4

**Purpose**: Checkout repository code

**Inputs**:
- `repository`: Repository to checkout (default: current repository)
- `ref`: Branch/commit to checkout (default: triggering commit)
- `path`: Path to checkout code (default: workspace root)

**Outputs**: None

**Errors**: Fails if repository not accessible or ref not found

---

### actions/setup-node@v4

**Purpose**: Setup Node.js runtime and npm cache

**Inputs**:
- `node-version`: Node.js version (e.g., '18')
- `cache`: Package manager to cache ('npm', 'yarn', 'pnpm')

**Outputs**: None

**Errors**: Fails if Node.js version not available

---

### actions/cache@v4

**Purpose**: Cache and restore files/directories

**Inputs**:
- `path`: Paths to cache (array or multiline string)
- `key`: Cache key (must be unique)
- `restore-keys`: Partial keys for fallback (optional)

**Outputs**:
- `cache-hit`: Boolean indicating if cache was found

**Errors**: Fails if cache operation fails (rare)

---

### actions/upload-artifact@v4

**Purpose**: Upload files as workflow artifacts

**Inputs**:
- `name`: Artifact name
- `path`: Path to files to upload
- `retention-days`: Days to retain artifact (default: 90)

**Outputs**: None

**Errors**: Fails if upload fails or path doesn't exist

---

### actions/download-artifact@v4

**Purpose**: Download workflow artifacts

**Inputs**:
- `name`: Artifact name to download
- `path`: Destination path (default: workspace root)

**Outputs**: None

**Errors**: Fails if artifact not found or download fails

---

### actions/configure-pages@v4

**Purpose**: Configure GitHub Pages deployment

**Inputs**: None (uses repository settings)

**Outputs**: None

**Errors**: Fails if Pages not enabled or permissions insufficient

---

### actions/upload-pages-artifact@v4

**Purpose**: Upload artifact for GitHub Pages deployment

**Inputs**:
- `path`: Path to files to deploy (e.g., './dist')

**Outputs**: None

**Errors**: Fails if upload fails or path doesn't exist

---

### actions/deploy-pages@v4

**Purpose**: Deploy artifact to GitHub Pages

**Inputs**: None (uses uploaded Pages artifact)

**Outputs**:
- `page_url`: URL of deployed site

**Errors**: Fails if deployment fails or Pages unavailable

---

## Environment Variables

### GitHub Provided

- `GITHUB_TOKEN`: Authentication token (automatically provided)
- `GITHUB_REPOSITORY`: Repository name (e.g., "owner/repo")
- `GITHUB_REF`: Git ref that triggered workflow
- `GITHUB_SHA`: Commit SHA that triggered workflow
- `GITHUB_WORKSPACE`: Workspace directory path

### Build Process

- `NODE_ENV`: Set to `production` during build
- `CI`: Set to `true` (indicates CI environment)

---

## Error Handling

### Build Failures

**Contract**: Build job fails if any step fails

**Behavior**:
- Workflow run marked as failed
- Deploy job skipped (due to `needs: build`)
- Failure status reported to PR (if triggered by PR)
- Build logs available in workflow run

**Recovery**: Fix build errors, push new commit

---

### Deployment Failures

**Contract**: Deploy job fails if any step fails

**Behavior**:
- Deploy job marked as failed
- Previous deployment remains active (no rollback)
- Failure status reported in workflow run
- Error logs available

**Recovery**: Fix deployment issues, push new commit

---

### Cache Failures

**Contract**: Cache operations should not fail workflow

**Behavior**:
- Cache miss: Falls back to installing dependencies
- Cache restore failure: Falls back to installing dependencies
- Build continues normally (slower but works)

**Recovery**: Automatic (no action needed)

---

## Security Contracts

### Authentication

- Uses `GITHUB_TOKEN` (automatically provided)
- No manual token management required
- Token scoped to repository permissions

### Permissions

- Minimal required permissions
- Explicit permission declarations
- Pages write permission only for deploy job

### Secrets

- No secrets required
- No hardcoded credentials
- All authentication via GITHUB_TOKEN

---

## Testing Contracts

### Workflow Validation

- YAML syntax validated by GitHub Actions
- Workflow structure validated on push
- Invalid workflows rejected before execution

### Build Testing

- Test on feature branch (build only)
- Verify build succeeds locally first
- Test on pull request (build validation)

### Deployment Testing

- Test on main branch push
- Verify deployment succeeds
- Verify site accessibility

---

## Performance Contracts

### Build Time

- Target: <5 minutes for typical changes
- Cached builds: <2 minutes
- Uncached builds: <5 minutes

### Deployment Time

- Target: <2 minutes after build
- Typical: 30-60 seconds

### Cache Effectiveness

- Target: 50%+ faster with cache
- Typical: 60-70% faster

---

## Monitoring Contracts

### Workflow Status

- Available in GitHub Actions UI
- Reported to pull requests
- Email notifications (if configured)

### Build Metrics

- Build duration tracked
- Cache hit rate tracked
- Success/failure rate tracked

### Deployment Metrics

- Deployment duration tracked
- Success/failure rate tracked
- Site accessibility verified

