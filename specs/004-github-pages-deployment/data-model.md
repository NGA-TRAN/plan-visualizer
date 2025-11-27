# Data Model: GitHub Pages Deployment Pipeline

**Feature**: 004-github-pages-deployment  
**Date**: 2025-01-27

## Overview

This feature implements CI/CD infrastructure using GitHub Actions. There is no application database or persistent storage - all state is managed by GitHub Actions platform. This document describes the workflow entities and their relationships.

## Entities

### 1. Workflow Run

**Purpose**: Represents a single execution of the GitHub Actions workflow.

**Storage**: GitHub Actions platform (not application storage)

**Attributes**:
- **run_id**: string - Unique identifier for the workflow run
- **workflow_name**: string - Name of the workflow (e.g., "Deploy to GitHub Pages")
- **status**: 'queued' | 'in_progress' | 'completed' | 'cancelled' | 'failure'
- **conclusion**: 'success' | 'failure' | 'cancelled' | 'skipped' | null
- **trigger_event**: 'push' | 'pull_request' | 'workflow_dispatch'
- **branch**: string - Branch that triggered the workflow
- **commit_sha**: string - Git commit SHA that triggered the workflow
- **created_at**: timestamp - When workflow run started
- **updated_at**: timestamp - Last status update

**Relationships**: 
- Contains multiple Jobs
- Triggered by Git Event

**State Transitions**:
- **queued** → **in_progress**: When runner picks up the workflow
- **in_progress** → **completed**: When all jobs finish successfully
- **in_progress** → **failure**: When any job fails
- **in_progress** → **cancelled**: When workflow is manually cancelled

---

### 2. Job

**Purpose**: Represents a single job within a workflow run (e.g., "build" or "deploy").

**Storage**: GitHub Actions platform

**Attributes**:
- **job_id**: string - Unique identifier for the job
- **job_name**: string - Name of the job (e.g., "build", "deploy")
- **status**: 'queued' | 'in_progress' | 'completed' | 'cancelled' | 'failure'
- **conclusion**: 'success' | 'failure' | 'cancelled' | 'skipped' | null
- **runner**: string - GitHub Actions runner (e.g., "ubuntu-latest")
- **started_at**: timestamp - When job started
- **completed_at**: timestamp - When job finished

**Relationships**:
- Belongs to Workflow Run
- Contains multiple Steps
- May depend on other Jobs (via `needs`)

**State Transitions**:
- **queued** → **in_progress**: When runner starts executing job
- **in_progress** → **completed**: When all steps succeed
- **in_progress** → **failure**: When any step fails
- **in_progress** → **cancelled**: When job is cancelled

---

### 3. Step

**Purpose**: Represents a single step within a job (e.g., "Checkout code", "Build application").

**Storage**: GitHub Actions platform

**Attributes**:
- **step_name**: string - Name of the step
- **status**: 'queued' | 'in_progress' | 'completed' | 'failure'
- **exit_code**: number | null - Process exit code
- **duration**: number - Execution time in seconds
- **logs**: string - Step output logs

**Relationships**:
- Belongs to Job
- Executes Actions or shell commands

**State Transitions**:
- **queued** → **in_progress**: When step starts executing
- **in_progress** → **completed**: When step succeeds (exit code 0)
- **in_progress** → **failure**: When step fails (non-zero exit code)

---

### 4. Cache Entry

**Purpose**: Represents cached dependencies or build artifacts stored by GitHub Actions.

**Storage**: GitHub Actions cache storage

**Attributes**:
- **cache_key**: string - Unique cache key (e.g., "Linux-npm-abc123")
- **cache_path**: string[] - Paths cached (e.g., ["node_modules", "dist"])
- **size**: number - Cache size in bytes
- **created_at**: timestamp - When cache was created
- **last_used_at**: timestamp - When cache was last accessed
- **expires_at**: timestamp - When cache expires (typically 7 days of no use)

**Relationships**: 
- Used by Workflow Runs
- Invalidated by dependency file changes

**State Transitions**:
- **Created**: When cache is first created
- **Used**: When cache is hit in subsequent runs
- **Invalidated**: When cache key changes (dependency files modified)
- **Expired**: When cache hasn't been used for 7 days

**Cache Keys**:
- Dependencies: `${{ runner.os }}-npm-${{ hashFiles('**/package-lock.json') }}`
- Build outputs: `${{ runner.os }}-build-${{ hashFiles('**/src/**', '**/vite.config.ts') }}`

---

### 5. Build Artifact

**Purpose**: Represents the built application files ready for deployment.

**Storage**: GitHub Actions artifact storage (temporary), then GitHub Pages

**Attributes**:
- **artifact_name**: string - Name of the artifact (e.g., "github-pages")
- **artifact_path**: string - Local path to artifact (e.g., "./dist")
- **size**: number - Artifact size in bytes
- **created_at**: timestamp - When artifact was created
- **uploaded_at**: timestamp - When artifact was uploaded
- **deployed_at**: timestamp - When artifact was deployed to GitHub Pages

**Relationships**:
- Created by Build Job
- Deployed by Deploy Job
- Served by GitHub Pages

**State Transitions**:
- **Created**: When build completes successfully
- **Uploaded**: When artifact is uploaded to GitHub Actions storage
- **Deployed**: When artifact is deployed to GitHub Pages
- **Expired**: When artifact expires (90 days default)

---

### 6. Deployment

**Purpose**: Represents a deployment of the application to GitHub Pages.

**Storage**: GitHub Pages platform

**Attributes**:
- **deployment_id**: string - Unique deployment identifier
- **environment**: string - Deployment environment (e.g., "github-pages")
- **status**: 'queued' | 'in_progress' | 'success' | 'failure' | 'cancelled'
- **url**: string - GitHub Pages URL where deployment is accessible
- **deployed_at**: timestamp - When deployment completed
- **commit_sha**: string - Git commit SHA that was deployed

**Relationships**:
- Created by Deploy Job
- Uses Build Artifact
- Accessible via GitHub Pages URL

**State Transitions**:
- **queued** → **in_progress**: When deployment starts
- **in_progress** → **success**: When deployment completes successfully
- **in_progress** → **failure**: When deployment fails
- **in_progress** → **cancelled**: When deployment is cancelled

---

## Workflow State Machine

```
Git Event (push/PR)
    ↓
Workflow Run (queued)
    ↓
Build Job (in_progress)
    ├─ Checkout Step
    ├─ Setup Node Step
    ├─ Cache Dependencies Step
    ├─ Install Dependencies Step
    ├─ Build Step
    └─ Upload Artifact Step
    ↓
Build Job (completed) → Deploy Job (if main branch)
    ├─ Download Artifact Step
    ├─ Configure Pages Step
    ├─ Upload Pages Artifact Step
    └─ Deploy Pages Step
    ↓
Deployment (success)
    ↓
GitHub Pages (accessible)
```

---

## Data Flow

### Build Flow

1. Git push/PR event triggers workflow
2. Workflow Run created (queued)
3. Build Job starts
4. Dependencies cached/restored
5. Application built
6. Build artifacts created
7. Artifacts uploaded to GitHub Actions storage

### Deployment Flow (Main Branch Only)

1. Build Job completes successfully
2. Deploy Job starts (conditional on main branch)
3. Build artifacts downloaded
4. Pages configured
5. Artifacts uploaded as Pages artifact
6. Pages deployment triggered
7. Deployment completes
8. GitHub Pages site updated

### Cache Flow

1. First build: Dependencies installed, cache created
2. Subsequent builds: Cache restored if key matches
3. Dependency update: Cache key changes, new cache created
4. Cache expiration: Unused cache deleted after 7 days

---

## No Persistent Storage

**Important**: This feature does not use application-level persistent storage. All state is managed by:
- GitHub Actions platform (workflow runs, jobs, steps)
- GitHub Actions cache (dependencies, build outputs)
- GitHub Pages platform (deployed site)

No database, IndexedDB, localStorage, or file system persistence is required for this CI/CD feature.

---

## Validation Rules

- **Workflow Run**: Must have valid trigger event (push or pull_request)
- **Job**: Must have valid dependencies (deploy needs build)
- **Step**: Must have valid action or command
- **Cache**: Cache key must be deterministic (based on file hashes)
- **Artifact**: Artifact path must exist after build completes
- **Deployment**: Only allowed from main branch

---

## Error States

- **Build Failure**: Workflow stops, no deployment, status reported to PR
- **Deployment Failure**: Build succeeded but deployment failed, error reported
- **Cache Miss**: Falls back to installing dependencies (slower but works)
- **Artifact Missing**: Deployment fails with clear error message
- **Permission Denied**: Workflow fails if permissions insufficient

