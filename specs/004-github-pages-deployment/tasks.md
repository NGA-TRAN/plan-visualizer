# Tasks: GitHub Pages Deployment Pipeline

**Input**: Design documents from `/specs/004-github-pages-deployment/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Tests are OPTIONAL and not included in this task list. Focus on implementation tasks.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Workflow files**: `.github/workflows/` at repository root
- **Configuration**: No changes to application code required

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create workflow directory structure

- [X] T001 Create workflow directory structure: `.github/workflows/` directory at repository root

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core workflow file structure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T002 Create base workflow file structure in `.github/workflows/deploy.yml` with workflow name, trigger events (push and pull_request), and permissions block
- [X] T003 Define workflow-level permissions in `.github/workflows/deploy.yml` (contents: read, pages: write, id-token: write)
- [X] T004 Add concurrency configuration in `.github/workflows/deploy.yml` to prevent concurrent deployments

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Automatic Build and Deploy on Main Branch (Priority: P1) 🎯 MVP

**Goal**: Automatically build and deploy the application to GitHub Pages when code is pushed to the main branch. The workflow triggers on push events, builds the application, and deploys it to GitHub Pages without manual intervention.

**Independent Test**: Push a commit to the main branch and verify that: (1) the GitHub Actions workflow triggers automatically, (2) the build completes successfully, (3) the application is deployed to GitHub Pages, and (4) the deployed site is accessible and functional.

### Implementation for User Story 1

- [X] T005 [US1] Create build job in `.github/workflows/deploy.yml` with runs-on: ubuntu-latest
- [X] T006 [US1] Add checkout step in build job using actions/checkout@v4 in `.github/workflows/deploy.yml`
- [X] T007 [US1] Add Node.js setup step in build job using actions/setup-node@v4 with node-version '18' and cache 'npm' in `.github/workflows/deploy.yml`
- [X] T008 [US1] Add dependency cache step in build job using actions/cache@v4 with node_modules and dist paths in `.github/workflows/deploy.yml`
- [X] T009 [US1] Add install dependencies step in build job running 'npm ci' in `.github/workflows/deploy.yml`
- [X] T010 [US1] Add build application step in build job running 'npm run build' in `.github/workflows/deploy.yml`
- [X] T011 [US1] Add upload build artifacts step in build job using actions/upload-artifact@v4 with name 'github-pages' and path 'dist' in `.github/workflows/deploy.yml`
- [X] T012 [US1] Create deploy job in `.github/workflows/deploy.yml` with needs: build and conditional 'if: github.ref == ''refs/heads/main'''
- [X] T013 [US1] Configure deploy job permissions and environment in `.github/workflows/deploy.yml` (pages: write, id-token: write, environment: github-pages)
- [X] T014 [US1] Add download artifacts step in deploy job using actions/download-artifact@v4 with name 'github-pages' in `.github/workflows/deploy.yml`
- [X] T015 [US1] Add setup Pages step in deploy job using actions/configure-pages@v4 in `.github/workflows/deploy.yml`
- [X] T016 [US1] Add upload Pages artifact step in deploy job using actions/upload-pages-artifact@v4 with path './dist' in `.github/workflows/deploy.yml`
- [X] T017 [US1] Add deploy to Pages step in deploy job using actions/deploy-pages@v4 in `.github/workflows/deploy.yml`
- [ ] T018 [US1] Test workflow: push commit to main branch, verify workflow triggers, build succeeds, deployment completes, and site is accessible

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently. The workflow automatically builds and deploys on main branch pushes.

---

## Phase 4: User Story 2 - Build Validation on Pull Requests (Priority: P2)

**Goal**: Automatically build the application when pull requests are opened or updated, validating that changes don't break the build process. Build status is reported back to the pull request for reviewers.

**Independent Test**: Open a pull request targeting main branch and verify that: (1) the GitHub Actions workflow triggers on the pull request event, (2) the build runs and completes, (3) the build status is reported back to the pull request, and (4) reviewers can see whether the build passed or failed.

### Implementation for User Story 2

- [X] T019 [US2] Verify pull_request trigger is configured in workflow on section in `.github/workflows/deploy.yml` (already done in T002, verify it works)
- [X] T020 [US2] Verify deploy job condition prevents deployment on pull requests in `.github/workflows/deploy.yml` (deploy job should only run on main branch)
- [ ] T021 [US2] Test workflow: open pull request, verify workflow triggers, build job runs, deploy job is skipped, and build status appears in PR
- [ ] T022 [US2] Test build failure scenario: introduce build error in PR, verify workflow fails, failure status appears in PR, and logs are accessible

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently. Pull requests trigger builds for validation without deploying to production.

---

## Phase 5: User Story 3 - Efficient Build Process with Caching (Priority: P2)

**Goal**: Optimize build performance by caching dependencies and build outputs. Subsequent builds reuse cached data when dependencies haven't changed, significantly reducing build time.

**Independent Test**: Run multiple builds and verify that: (1) the first build takes longer as it installs dependencies, (2) subsequent builds complete faster due to caching, (3) cache invalidation works correctly when dependencies change, and (4) build times are reduced compared to builds without caching.

### Implementation for User Story 3

- [X] T023 [US3] Verify npm cache is configured in setup-node step in `.github/workflows/deploy.yml` (cache: 'npm' parameter)
- [X] T024 [US3] Verify dependency cache key uses package-lock.json hash in `.github/workflows/deploy.yml` (key includes hashFiles('**/package-lock.json'))
- [X] T025 [US3] Verify cache restore-keys are configured for fallback in `.github/workflows/deploy.yml` (restore-keys with partial match)
- [ ] T026 [US3] Test cache effectiveness: run first build (cache miss), note build time, run second build with no dependency changes (cache hit), verify faster build time (50%+ improvement)
- [ ] T027 [US3] Test cache invalidation: update package.json or package-lock.json, run build, verify cache is invalidated and fresh dependencies are installed
- [ ] T028 [US3] Monitor cache hit rate in workflow logs and verify cache is being used effectively

**Checkpoint**: At this point, all three user stories should work independently. Caching significantly improves build performance, and cache invalidation works correctly.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories and edge case handling

- [X] T029 Verify workflow follows GitHub Actions best practices: uses official actions (v4), minimal permissions, proper error handling in `.github/workflows/deploy.yml`
- [X] T030 Add descriptive step names for better error messages and debugging in `.github/workflows/deploy.yml`
- [ ] T031 Handle edge case: verify workflow handles build failures gracefully (build job fails, deploy job is skipped, error reported)
- [ ] T032 Handle edge case: verify workflow handles deployment failures gracefully (deploy job fails, error reported, previous deployment remains)
- [ ] T033 Handle edge case: verify concurrent workflow runs don't conflict (concurrency group prevents conflicts)
- [ ] T034 Verify workflow respects GitHub Actions resource limits (build size <100MB, workflow time <7 minutes)
- [X] T035 Verify security: no hardcoded secrets, uses GITHUB_TOKEN, minimal permissions in `.github/workflows/deploy.yml`
- [ ] T036 Test complete workflow end-to-end: push to main, verify build, deployment, and site accessibility
- [ ] T037 Verify GitHub Pages settings: ensure "GitHub Actions" is selected as source in repository Settings → Pages
- [X] T038 Run quickstart.md validation: verify all setup steps work correctly and workflow matches quickstart guide
- [ ] T039 [P] Update README.md with deployment information: add section about automatic deployment via GitHub Actions
- [ ] T040 [P] Document workflow in repository: add notes about workflow triggers, build process, and deployment process

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories. Includes basic caching setup.
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Independent of US1, shares same workflow file but different trigger behavior
- **User Story 3 (P2)**: Can start after Foundational (Phase 2) - Builds on US1 caching setup, optimizes and verifies caching effectiveness

### Within Each User Story

- Workflow structure before job steps
- Job definition before step implementation
- Build job before deploy job (deploy depends on build)
- Step order matters (checkout → setup → cache → install → build → deploy)

### Parallel Opportunities

- **Foundational Phase**: T002, T003, T004 can be done together (all in same file, but sequential makes sense)
- **User Stories**: Once Foundational completes, US1, US2, and US3 can be worked on in parallel by different team members (though they share the same workflow file)
- **Within US1**: T005-T011 (build job steps) must be sequential, T012-T017 (deploy job steps) must be sequential
- **Polish Phase**: T039, T040 can run in parallel (different files)

---

## Parallel Example: User Story 1

```bash
# Workflow file is sequential by nature, but tasks can be grouped:
# Build job setup (T005-T011):
Task: "Create build job in .github/workflows/deploy.yml"
Task: "Add checkout step in build job"
Task: "Add Node.js setup step in build job"
# ... (continue sequentially)

# Deploy job setup (T012-T017):
Task: "Create deploy job in .github/workflows/deploy.yml"
Task: "Configure deploy job permissions and environment"
# ... (continue sequentially)
```

---

## Parallel Example: User Story 2

```bash
# Verification tasks can be done together:
Task: "Verify pull_request trigger is configured"
Task: "Verify deploy job condition prevents deployment on pull requests"
# Then test together
```

---

## Parallel Example: User Story 3

```bash
# Cache verification tasks:
Task: "Verify npm cache is configured"
Task: "Verify dependency cache key uses package-lock.json hash"
Task: "Verify cache restore-keys are configured"
# Then test cache effectiveness
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (create directory)
2. Complete Phase 2: Foundational (workflow structure)
3. Complete Phase 3: User Story 1 (build and deploy)
4. **STOP and VALIDATE**: Test workflow on main branch push
5. Deploy/demo if ready

**MVP Deliverable**: Automatic build and deployment to GitHub Pages on main branch pushes.

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo (PR validation)
4. Add User Story 3 → Test independently → Deploy/Demo (caching optimization)
5. Add Polish → Final testing → Production ready

Each story adds value without breaking previous stories.

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - **Developer A**: User Story 1 (Build and Deploy) - P1 priority
   - **Developer B**: User Story 2 (PR Validation) - P2 priority (can work in parallel, same file)
   - **Developer C**: User Story 3 (Caching) - P2 priority (can work in parallel, same file)
3. Stories complete and integrate independently
4. Team collaborates on Polish phase

**Note**: Since all stories modify the same workflow file, true parallel work requires coordination or sequential implementation. However, tasks within each story can be planned and reviewed independently.

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Workflow file is YAML - syntax must be valid
- Test workflow after each major change
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: invalid YAML syntax, missing permissions, hardcoded secrets
- Workflow file location: `.github/workflows/deploy.yml` (GitHub automatically detects this)

