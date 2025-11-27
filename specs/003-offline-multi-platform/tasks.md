# Tasks: Offline Multi-Platform Support

**Input**: Design documents from `/specs/003-offline-multi-platform/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Tests are OPTIONAL and not included in this task list. Focus on implementation tasks.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `src/features/offline/` for offline feature code
- **Public assets**: `public/` for manifest and icons
- **Config**: `vite.config.ts` at repository root

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and PWA dependencies

- [X] T001 Install PWA dependencies: vite-plugin-pwa, workbox-precaching, workbox-window in package.json
- [X] T002 [P] Install TypeScript types for Workbox: @types/workbox-precaching, @types/workbox-window as dev dependencies
- [X] T003 [P] Install optional IndexedDB wrapper: idb package for better IndexedDB DX

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core PWA infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T004 Configure vite-plugin-pwa in vite.config.ts with basic PWA settings
- [X] T005 Create Web App Manifest file at public/manifest.json with app metadata
- [X] T006 [P] Generate PWA icons (192x192, 512x512) and place in public/icons/ directory
- [X] T007 [P] Add PWA meta tags to index.html for iOS support (apple-mobile-web-app-capable, etc.)
- [X] T008 Create offline feature directory structure: src/features/offline/ with components/, hooks/, services/, types/ subdirectories
- [X] T009 Create TypeScript types file: src/features/offline/types/index.ts with offline-related type definitions

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Use Application Without Internet Connection (Priority: P1) 🎯 MVP

**Goal**: Enable full application functionality when network connectivity is unavailable. Users can access cached application, enter plans, visualize them, and interact with diagrams offline.

**Independent Test**: Disable network connectivity in browser DevTools, access application, enter a plan, visualize it, and interact with the diagram. Application should function identically to online mode for core features.

### Implementation for User Story 1

- [X] T010 [US1] Implement useOffline hook in src/features/offline/hooks/useOffline.ts to detect connectivity status
- [X] T011 [US1] Implement useServiceWorker hook in src/features/offline/hooks/useServiceWorker.ts for Service Worker registration and lifecycle
- [X] T012 [US1] Create OfflineIndicator component in src/features/offline/components/OfflineIndicator.tsx to show connectivity status
- [X] T013 [US1] Integrate OfflineIndicator component into root App component in src/app/App.tsx
- [X] T014 [US1] Create storageManager service in src/features/offline/services/storageManager.ts for IndexedDB operations
- [X] T015 [US1] Implement IndexedDB database schema setup in src/features/offline/services/storageManager.ts (planVisualizerDB with plans object store)
- [X] T016 [US1] Create PlanData type definition in src/features/offline/types/index.ts matching data-model.md specification
- [X] T017 [US1] Implement savePlanToStorage function in src/features/offline/services/storageManager.ts to persist plan data to IndexedDB
- [X] T018 [US1] Implement loadPlanFromStorage function in src/features/offline/services/storageManager.ts to retrieve plan data from IndexedDB
- [X] T019 [US1] Update PlanVisualizerPage component in src/features/plan-visualizer/components/PlanVisualizerPage.tsx to save plans to IndexedDB when visualized
- [X] T020 [US1] Update ExcalidrawCanvas component in src/features/plan-visualizer/components/ExcalidrawCanvas.tsx to work seamlessly when offline
- [X] T021 [US1] Ensure user preferences (theme, sidebar state) persist to localStorage in existing store implementation
- [ ] T022 [US1] Test offline functionality: build application, serve with HTTPS, disable network, verify all features work

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently. Application works completely offline with cached resources and local data storage.

---

## Phase 4: User Story 2 - Install and Use Application on Desktop (Priority: P2)

**Goal**: Enable users to install the application on desktop operating systems (Windows, macOS, Linux) and use it like a native desktop application with standalone window, system integration, and persistent preferences.

**Independent Test**: Install application on desktop OS, verify it appears in system menu, launch in standalone window, verify window state persists, test keyboard shortcuts. Application should behave like a native desktop app.

### Implementation for User Story 2

- [X] T023 [US2] Implement useInstallPrompt hook in src/features/offline/hooks/useInstallPrompt.ts to detect installability and handle installation
- [X] T024 [US2] Create InstallationState type definition in src/features/offline/types/index.ts matching data-model.md specification
- [X] T025 [US2] Implement installation state persistence in src/features/offline/hooks/useInstallPrompt.ts using localStorage
- [X] T026 [US2] Create InstallPrompt component in src/features/offline/components/InstallPrompt.tsx to show installation prompt UI
- [X] T027 [US2] Integrate InstallPrompt component into root App component in src/app/App.tsx
- [X] T028 [US2] Update Web App Manifest in public/manifest.json with desktop-specific settings (display: standalone, proper icons)
- [X] T029 [US2] Ensure manifest.json includes all required fields for desktop installation (name, short_name, icons, start_url, display)
- [ ] T030 [US2] Test desktop installation on Windows: verify install prompt appears, installation succeeds, app launches in standalone window
- [ ] T031 [US2] Test desktop installation on macOS: verify install prompt appears, installation succeeds, app launches in standalone window
- [ ] T032 [US2] Test desktop installation on Linux: verify install prompt appears, installation succeeds, app launches in standalone window
- [X] T033 [US2] Verify installed app remembers window size and position across sessions (browser handles this automatically)
- [X] T034 [US2] Verify keyboard shortcuts work correctly in standalone mode (test standard shortcuts like Ctrl/Cmd+R, Ctrl/Cmd+Shift+R)

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently. Application can be installed on desktop and works offline.

---

## Phase 5: User Story 3 - Use Application on Mobile Devices (Priority: P2)

**Goal**: Provide responsive, touch-optimized interface for mobile devices (smartphones and tablets) with proper layout adaptation, touch gesture support, and mobile installation capability.

**Independent Test**: Access application on mobile device, verify interface adapts to screen size, test touch interactions (pinch-to-zoom, pan, tap), enter plan text, verify keyboard doesn't obstruct UI, install to home screen. Application should be fully functional on mobile.

### Implementation for User Story 3

- [X] T035 [US3] Enhance responsive design in PlanVisualizerPage component in src/features/plan-visualizer/components/PlanVisualizerPage.tsx for mobile viewports (<640px)
- [X] T036 [US3] Optimize ExcalidrawCanvas component in src/features/plan-visualizer/components/ExcalidrawCanvas.tsx for mobile touch interactions
- [X] T037 [US3] Ensure sidebar collapses appropriately on mobile in existing Sidebar component in src/features/navigation/components/Sidebar.tsx
- [X] T038 [US3] Optimize PlanInput component in src/features/plan-visualizer/components/PlanInput.tsx for mobile keyboards (prevent UI obstruction)
- [X] T039 [US3] Add viewport meta tag optimization in index.html for mobile devices (prevent zoom on input focus)
- [X] T040 [US3] Update Web App Manifest in public/manifest.json with mobile-specific settings (orientation: any, proper mobile icons)
- [X] T041 [US3] Add iOS-specific meta tags in index.html (apple-mobile-web-app-capable, apple-mobile-web-app-status-bar-style, apple-touch-icon)
- [X] T042 [US3] Create apple-touch-icon (180x180) and place in public/icons/ directory for iOS home screen
- [ ] T043 [US3] Test responsive layout across screen sizes: 320px (small mobile), 768px (tablet), 1024px+ (desktop) - verify no horizontal scrolling
- [ ] T044 [US3] Test touch interactions on mobile device: verify pinch-to-zoom works on Excalidraw canvas, pan gestures work smoothly
- [ ] T045 [US3] Test mobile installation: verify "Add to Home Screen" option available on iOS and Android, app installs successfully
- [X] T046 [US3] Test orientation changes: rotate device, verify layout adapts without losing data or state
- [X] T047 [US3] Verify mobile keyboard doesn't obstruct input area when entering plan text

**Checkpoint**: At this point, all three user stories should work independently. Application works offline, installs on desktop and mobile, and provides responsive mobile experience.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories and edge case handling

- [ ] T048 [P] Implement useStorageQuota hook in src/features/offline/hooks/useStorageQuota.ts to monitor storage usage
- [ ] T049 [P] Create StorageQuotaWarning component in src/features/offline/components/StorageQuotaWarning.tsx to warn users before quota limits
- [ ] T050 Integrate StorageQuotaWarning component into root App component in src/app/App.tsx
- [ ] T051 Handle edge case: user goes offline while actively using application - ensure graceful transition
- [ ] T052 Handle edge case: storage quota limits - implement graceful error handling and user notifications in storageManager.ts
- [ ] T053 Handle edge case: user clears browser cache while offline - ensure application can recover gracefully
- [ ] T054 Handle edge case: multiple tabs/windows - ensure Service Worker and storage work correctly across tabs
- [ ] T055 Handle edge case: intermittent connectivity - ensure smooth transitions between online/offline states
- [ ] T056 Handle edge case: unsupported browser/OS - provide fallback messaging and graceful degradation
- [ ] T057 Optimize Service Worker caching strategy in vite.config.ts to ensure efficient cache usage (<50MB target)
- [ ] T058 Verify offline load time meets performance goal (<3 seconds from cache) - optimize if needed
- [ ] T059 Verify touch interaction response time meets performance goal (<100ms on mobile) - optimize if needed
- [ ] T060 Run quickstart.md validation: verify all installation steps work correctly
- [ ] T061 [P] Update documentation: add PWA installation instructions to README.md
- [ ] T062 [P] Code cleanup and refactoring: ensure all offline feature code follows constitution principles
- [ ] T063 Final integration testing: test complete workflow offline, on desktop installed, and on mobile

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

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Independent of US1, but shares manifest.json updates
- **User Story 3 (P2)**: Can start after Foundational (Phase 2) - Independent of US1/US2, but shares manifest.json updates

### Within Each User Story

- Hooks before components (hooks provide functionality for components)
- Services before components (services provide data operations)
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- **Setup Phase**: T002 and T003 can run in parallel (different packages)
- **Foundational Phase**: T006, T007, T009 can run in parallel (different files)
- **User Stories**: Once Foundational completes, US1, US2, and US3 can be worked on in parallel by different team members
- **Within US1**: T010, T011, T014, T016 can run in parallel (different files)
- **Within US2**: T023, T024, T028 can run in parallel (different files)
- **Within US3**: T035, T036, T037, T038 can run in parallel (different files)
- **Polish Phase**: T048, T049, T061, T062 can run in parallel (different files)

---

## Parallel Example: User Story 1

```bash
# Launch foundational hooks and services in parallel:
Task: "Implement useOffline hook in src/features/offline/hooks/useOffline.ts"
Task: "Implement useServiceWorker hook in src/features/offline/hooks/useServiceWorker.ts"
Task: "Create storageManager service in src/features/offline/services/storageManager.ts"
Task: "Create PlanData type definition in src/features/offline/types/index.ts"

# Then create components that depend on hooks:
Task: "Create OfflineIndicator component in src/features/offline/components/OfflineIndicator.tsx"
```

---

## Parallel Example: User Story 2

```bash
# Launch installation-related tasks in parallel:
Task: "Implement useInstallPrompt hook in src/features/offline/hooks/useInstallPrompt.ts"
Task: "Create InstallationState type definition in src/features/offline/types/index.ts"
Task: "Update Web App Manifest in public/manifest.json with desktop-specific settings"

# Then create component:
Task: "Create InstallPrompt component in src/features/offline/components/InstallPrompt.tsx"
```

---

## Parallel Example: User Story 3

```bash
# Launch mobile optimization tasks in parallel:
Task: "Enhance responsive design in PlanVisualizerPage component in src/features/plan-visualizer/components/PlanVisualizerPage.tsx"
Task: "Optimize ExcalidrawCanvas component in src/features/plan-visualizer/components/ExcalidrawCanvas.tsx for mobile"
Task: "Optimize PlanInput component in src/features/plan-visualizer/components/PlanInput.tsx for mobile keyboards"
Task: "Add iOS-specific meta tags in index.html"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (install dependencies)
2. Complete Phase 2: Foundational (Service Worker, manifest, basic structure)
3. Complete Phase 3: User Story 1 (Offline functionality)
4. **STOP and VALIDATE**: Test offline functionality independently
5. Deploy/demo if ready

**MVP Deliverable**: Application works completely offline with cached resources and local data storage.

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo (Desktop installation)
4. Add User Story 3 → Test independently → Deploy/Demo (Mobile support)
5. Add Polish Phase → Final testing → Production ready

Each story adds value without breaking previous stories.

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - **Developer A**: User Story 1 (Offline mode) - P1 priority
   - **Developer B**: User Story 2 (Desktop installation) - P2 priority
   - **Developer C**: User Story 3 (Mobile platform) - P2 priority
3. Stories complete and integrate independently
4. Team collaborates on Polish phase

**Note**: US2 and US3 can start in parallel after Foundational, but US1 should be prioritized as MVP.

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Service Worker requires HTTPS (or localhost for development)
- Test offline functionality by disabling network in browser DevTools
- Test installation on actual devices/platforms for best results
- Verify manifest.json is accessible and properly formatted
- Ensure PWA icons are properly sized and accessible
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence

