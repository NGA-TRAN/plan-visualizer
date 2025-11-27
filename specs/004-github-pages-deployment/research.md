# Research: GitHub Pages Deployment Pipeline

**Feature**: 004-github-pages-deployment  
**Date**: 2025-01-27  
**Purpose**: Resolve technology choices and best practices for GitHub Actions CI/CD pipeline

## Technology Decisions

### 1. GitHub Actions Workflow Structure

**Decision**: Use a single workflow file (`.github/workflows/deploy.yml`) with separate jobs for build and deployment, triggered on push to main and pull_request events.

**Rationale**:
- Single workflow file simplifies maintenance and version control
- Separate jobs allow build validation on PRs without deployment
- Standard GitHub Actions patterns are well-documented and maintainable
- Conditional deployment (only on main branch) is straightforward with job conditions

**Alternatives Considered**:
- **Separate workflows for build and deploy**: Rejected - adds complexity, harder to coordinate
- **Matrix builds for multiple environments**: Rejected - out of scope (single environment only)
- **Reusable workflows**: Rejected - unnecessary for single repository use case

**Implementation Pattern**:
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
    steps:
      # Build steps
  
  deploy:
    needs: build
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      # Deployment steps
```

---

### 2. Node.js Setup and Caching

**Decision**: Use `actions/setup-node@v4` with `actions/cache@v4` for dependency caching using npm cache and node_modules.

**Rationale**:
- `actions/setup-node@v4` is the official GitHub action for Node.js setup
- Built-in caching support reduces workflow complexity
- npm is already used in the project (package-lock.json exists)
- Caching node_modules significantly speeds up builds (50%+ improvement typical)

**Alternatives Considered**:
- **Manual cache action only**: Rejected - setup-node caching is simpler and more reliable
- **Yarn or pnpm**: Rejected - project uses npm, no need to change package manager
- **No caching**: Rejected - violates performance requirements and best practices

**Implementation Pattern**:
```yaml
- uses: actions/setup-node@v4
  with:
    node-version: '18'
    cache: 'npm'

- uses: actions/cache@v4
  with:
    path: |
      node_modules
      dist
    key: ${{ runner.os }}-build-${{ hashFiles('**/package-lock.json') }}
```

---

### 3. GitHub Pages Deployment Method

**Decision**: Use `actions/configure-pages@v4`, `actions/upload-pages-artifact@v4`, and `actions/deploy-pages@v4` for deployment.

**Rationale**:
- Official GitHub Actions for Pages deployment (recommended approach)
- Handles authentication automatically via GITHUB_TOKEN
- Supports both branch-based and artifact-based deployment
- Better error handling and status reporting than manual git push methods
- Works with GitHub Pages settings automatically

**Alternatives Considered**:
- **Manual git push to gh-pages branch**: Rejected - requires manual token management, less secure, more error-prone
- **Third-party actions (peaceiris/actions-gh-pages)**: Rejected - official actions are preferred for security and maintenance
- **GitHub Pages from branch**: Rejected - artifact-based deployment is more reliable and allows build validation

**Implementation Pattern**:
```yaml
- uses: actions/configure-pages@v4
- uses: actions/upload-pages-artifact@v4
  with:
    path: './dist'
- uses: actions/deploy-pages@v4
  permissions:
    pages: write
    id-token: write
```

---

### 4. Build Output Directory

**Decision**: Use `dist/` directory as the build output location (Vite default).

**Rationale**:
- Vite builds to `dist/` by default (configured in vite.config.ts)
- No configuration changes needed
- Standard convention for Vite projects
- Matches existing build process

**Alternatives Considered**:
- **Custom build directory**: Rejected - unnecessary, dist/ is standard
- **build/ or out/**: Rejected - would require vite.config.ts changes

---

### 5. Workflow Permissions

**Decision**: Use minimal required permissions with explicit `permissions` block for Pages deployment.

**Rationale**:
- Security best practice (principle of least privilege)
- Explicit permissions make security review easier
- Required for `actions/deploy-pages@v4` (needs `pages: write` and `id-token: write`)
- Prevents accidental privilege escalation

**Implementation Pattern**:
```yaml
permissions:
  contents: read
  pages: write
  id-token: write
```

---

### 6. Build Command and Type Checking

**Decision**: Run `npm run build` which executes `tsc && vite build` (TypeScript type checking + build).

**Rationale**:
- Matches existing package.json scripts
- Type checking catches errors before build
- Single command simplifies workflow
- Consistent with local development process

**Alternatives Considered**:
- **Separate type-check step**: Rejected - already included in build script, adds redundancy
- **Skip type checking**: Rejected - violates quality requirements, allows type errors in production

---

### 7. Error Handling and Failure Reporting

**Decision**: Use GitHub Actions built-in failure reporting with clear step names and error messages.

**Rationale**:
- GitHub Actions automatically reports failures in workflow UI
- Clear step names help identify failure points
- No additional tooling needed
- Failures are visible in PR checks automatically

**Implementation Pattern**:
- Use descriptive step names: `name: Build application`
- Let build commands fail naturally (non-zero exit codes)
- GitHub Actions will report failures automatically

---

### 8. Cache Invalidation Strategy

**Decision**: Invalidate cache based on `package-lock.json` hash for dependencies and build outputs separately.

**Rationale**:
- `package-lock.json` changes indicate dependency updates
- Separate caches allow fine-grained invalidation
- Build output cache can persist across dependency updates if source unchanged
- Standard practice for npm-based projects

**Implementation Pattern**:
```yaml
# Dependency cache
key: ${{ runner.os }}-npm-${{ hashFiles('**/package-lock.json') }}

# Build output cache  
key: ${{ runner.os }}-build-${{ hashFiles('**/src/**', '**/vite.config.ts') }}
```

---

### 9. Workflow Trigger Strategy

**Decision**: Trigger on `push` to main (deploy) and `pull_request` to main (validate only).

**Rationale**:
- Push to main: Production deployment needed
- Pull request: Build validation without deployment
- Standard CI/CD pattern
- Prevents broken code from reaching main branch

**Alternatives Considered**:
- **Deploy on all branches**: Rejected - security risk, violates requirement FR-012
- **Manual workflow dispatch**: Rejected - violates requirement FR-001 (automatic trigger)
- **Schedule-based deployment**: Rejected - out of scope, not required

---

### 10. Build Artifact Cleanup

**Decision**: Let GitHub Actions handle artifact cleanup automatically (artifacts expire after 90 days by default).

**Rationale**:
- GitHub Actions manages artifact lifecycle automatically
- No manual cleanup needed
- 90-day retention is sufficient for debugging
- Reduces workflow complexity

**Alternatives Considered**:
- **Manual artifact deletion**: Rejected - unnecessary, GitHub handles this
- **Custom retention policies**: Rejected - default is sufficient, adds complexity

---

## Best Practices Applied

1. **Security**:
   - Use official GitHub Actions (v4 where available)
   - Minimal permissions (contents: read, pages: write, id-token: write)
   - No hardcoded secrets (use GITHUB_TOKEN)
   - Deploy only from main branch

2. **Performance**:
   - Cache dependencies (npm cache + node_modules)
   - Cache build outputs when appropriate
   - Use latest action versions for performance improvements
   - Parallel jobs where possible

3. **Reliability**:
   - Type checking before build
   - Clear error messages
   - Conditional deployment (only on main)
   - Proper job dependencies (deploy needs build)

4. **Maintainability**:
   - Single workflow file
   - Clear step names
   - Standard patterns
   - Well-documented actions

---

## Integration Points

### With Existing Project

- **Build Process**: Uses existing `npm run build` command
- **Build Output**: Uses existing `dist/` directory (Vite default)
- **Package Manager**: Uses existing npm (package-lock.json)
- **TypeScript**: Uses existing TypeScript configuration

### New Files

- `.github/workflows/deploy.yml` - Main workflow file

### No Changes Required

- No changes to package.json
- No changes to vite.config.ts
- No changes to source code
- No changes to build process

---

## Testing Strategy

1. **Workflow Validation**:
   - YAML syntax validation (GitHub Actions validates automatically)
   - Test workflow on feature branch before merging

2. **Build Testing**:
   - Verify build succeeds locally first
   - Test workflow on pull request (build only, no deploy)

3. **Deployment Testing**:
   - Test deployment on main branch push
   - Verify GitHub Pages site is accessible
   - Verify deployed site functionality

4. **Cache Testing**:
   - First build (cache miss) - verify dependencies install
   - Second build (cache hit) - verify faster build time
   - Dependency update - verify cache invalidation

---

## Performance Expectations

- **First build (no cache)**: ~3-5 minutes (dependency installation + build)
- **Cached build**: ~1-2 minutes (build only, dependencies cached)
- **Deployment**: ~30-60 seconds (upload artifact + deploy)
- **Total workflow (cached)**: ~2-3 minutes
- **Total workflow (uncached)**: ~4-6 minutes

These meet the success criteria:
- SC-002: Build <5 minutes ✅
- SC-003: Cached builds 50%+ faster ✅
- SC-004: Deployment <2 minutes ✅

---

## Security Considerations

- **GITHUB_TOKEN**: Automatically provided, no manual token management needed
- **Permissions**: Minimal required (contents: read, pages: write, id-token: write)
- **Deployment**: Only from main branch (prevents unauthorized deployments)
- **Actions**: Use official GitHub Actions (v4) for security updates
- **Secrets**: No secrets required (uses GITHUB_TOKEN)

---

## Migration Path

1. **Phase 1**: Create workflow file in `.github/workflows/deploy.yml`
2. **Phase 2**: Test workflow on feature branch (build only)
3. **Phase 3**: Merge to main, verify deployment works
4. **Phase 4**: Monitor build times and cache effectiveness

No breaking changes - this is additive infrastructure.

