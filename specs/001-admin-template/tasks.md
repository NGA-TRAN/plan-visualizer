# Tasks: Lightweight React SPA Admin Template

**Input**: Design documents from `/specs/001-admin-template/`  
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, quickstart.md ✅

**Tests**: Not explicitly requested in specification. Test tasks omitted.

**Organization**: Tasks grouped by user story (6 stories: 2×P1, 2×P2, 2×P3)

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1-US6)
- Include exact file paths in descriptions

## Path Conventions

- **Project type**: Single frontend SPA
- **Source**: `src/` at repository root
- **Features**: `src/features/<feature-name>/`
- **Shared**: `src/shared/`

---

## Phase 1: Setup (Shared Infrastructure) ✅

**Purpose**: Project initialization, tooling, and base configuration

- [X] T001 Initialize Vite project with React + TypeScript template in project root
- [X] T002 Install core dependencies: react-router-dom, zustand, tailwindcss, postcss, autoprefixer
- [X] T003 [P] Install UI dependencies: @tanstack/react-table, recharts, lucide-react
- [X] T004 [P] Install form dependencies: react-hook-form, @hookform/resolvers, zod
- [X] T005 [P] Configure Tailwind CSS with tailwind.config.js and postcss.config.js
- [X] T006 [P] Configure TypeScript paths in tsconfig.json for @/ alias
- [ ] T007 [P] Configure ESLint + Prettier with .eslintrc.cjs and .prettierrc
- [X] T008 Create base folder structure: src/app/, src/features/, src/shared/, src/data/
- [X] T009 Create index.html with dark mode script in public/index.html

---

## Phase 2: Foundational (Blocking Prerequisites) ✅

**Purpose**: Core infrastructure that MUST be complete before ANY user story

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T010 Create TypeScript types for all entities in src/types/index.ts
- [X] T011 Create Zustand store with all slices in src/store/index.ts
      <!-- Single source of truth: users, activities, metrics, navigation, notifications, theme -->
- [X] T012 [P] Create sample data generator in src/data/seed.ts (100 users, 20 activities, 4 metrics)
- [X] T013 [P] Create utility: Tailwind class merge (cn) in src/shared/utils/cn.ts
- [X] T014 [P] Create utility: date/number formatters in src/shared/utils/formatters.ts
- [X] T015 Create app entry point in src/main.tsx with store initialization
- [X] T016 Create root App component with providers in src/app/App.tsx
- [X] T017 Create route definitions with lazy loading in src/app/router.tsx
- [X] T018 [P] Create shared Button component in src/shared/components/Button.tsx
- [X] T019 [P] Create shared Card component in src/shared/components/Card.tsx
- [X] T020 [P] Create shared Modal component in src/shared/components/Modal.tsx
- [X] T021 [P] Create shared EmptyState component in src/shared/components/EmptyState.tsx
- [X] T022 [P] Create shared LoadingSpinner component in src/shared/components/LoadingSpinner.tsx

**Checkpoint**: Foundation ready — user story implementation can now begin in parallel ✅

---

## Phase 3: User Story 1 — Dashboard Overview (Priority: P1) 🎯 MVP ✅

**Goal**: Display dashboard with 4 metric cards, interactive chart, and activity feed

**Independent Test**: Load the app and verify metric cards, chart, and activity feed render with sample data

### Implementation for User Story 1

- [X] T023 [P] [US1] Create MetricCard component in src/features/dashboard/components/MetricCard.tsx
- [X] T024 [P] [US1] Create ChartWidget component with Recharts in src/features/dashboard/components/ChartWidget.tsx
- [X] T025 [P] [US1] Create ActivityFeed component in src/features/dashboard/components/ActivityFeed.tsx
- [X] T026 [US1] Create useDashboardData hook in src/features/dashboard/hooks/useDashboardData.ts
- [X] T027 [US1] Create Dashboard page composing all widgets in src/features/dashboard/components/Dashboard.tsx
- [X] T028 [US1] Add responsive grid layout for dashboard widgets with Tailwind breakpoints
- [X] T029 [US1] Register Dashboard route as "/" in src/app/router.tsx

**Checkpoint**: Dashboard loads with 4 metric cards, 1 chart, and activity feed ✅

---

## Phase 4: User Story 2 — Data Table Management (Priority: P1) 🎯 MVP ✅

**Goal**: Display user data in sortable, searchable, paginated table with CRUD and CSV export

**Independent Test**: Navigate to /users, verify table renders, search/sort/paginate work, CRUD operations persist in memory

### Implementation for User Story 2

- [X] T030 [P] [US2] Create useUserSelectors helper in src/features/users/hooks/useUserSelectors.ts
      <!-- Exports: useUsers(), useAddUser(), useUpdateUser(), useDeleteUser() from centralized store -->
- [X] T031 [P] [US2] Create useUserTable hook with TanStack Table in src/features/users/hooks/useUserTable.ts
- [X] T032 [P] [US2] Create CSV export utility in src/features/users/utils/exportCsv.ts
- [X] T033 [US2] Create UserTable component with sorting/filtering in src/features/users/components/UserTable.tsx
- [X] T034 [US2] Create UserRow component in src/features/users/components/UserRow.tsx (inline in UserColumns.tsx)
- [X] T035 [US2] Create UserForm component for create/edit in src/features/users/components/UserForm.tsx
- [X] T036 [US2] Create UsersPage with table + modal integration in src/features/users/components/UsersPage.tsx
- [X] T037 [US2] Implement search input with debounced filtering in UserTable
- [X] T038 [US2] Implement pagination controls with page size selector (10, 25, 50, 100)
- [X] T039 [US2] Implement delete confirmation modal flow
- [X] T040 [US2] Add CSV export button to UsersPage toolbar
- [X] T041 [US2] Register Users route as "/users" in src/app/router.tsx

**Checkpoint**: Full CRUD operations work on user table, CSV export downloads file ✅

---

## Phase 5: User Story 3 — Sidebar Navigation (Priority: P2) ✅

**Goal**: Collapsible sidebar with grouped menu items and active route highlighting

**Independent Test**: Sidebar renders, collapses to icons-only mode, accordion groups expand/collapse, active route is highlighted

### Implementation for User Story 3

- [X] T042 [P] [US3] Create useNavigation hook in src/features/navigation/hooks/useNavigation.ts
- [X] T043 [P] [US3] Create NavItem component in src/features/navigation/components/NavItem.tsx
- [X] T044 [P] [US3] Create NavGroup accordion component in src/features/navigation/components/NavGroup.tsx
- [X] T045 [US3] Create Sidebar component with collapse toggle in src/features/navigation/components/Sidebar.tsx
- [X] T046 [US3] Add navigation items seed data in src/data/seed.ts
- [X] T047 [US3] Integrate Sidebar into App layout in src/app/App.tsx
- [X] T048 [US3] Add responsive behavior: drawer on mobile, fixed on desktop

**Checkpoint**: Sidebar navigation fully functional with collapse and accordion behavior ✅

---

## Phase 6: User Story 4 — Form Components & Validation (Priority: P2) ✅

**Goal**: Reusable form components with React Hook Form + Zod validation

**Independent Test**: Navigate to /forms, submit invalid data to see inline errors, submit valid data to see success

### Implementation for User Story 4

- [X] T049 [P] [US4] Create TextField component in src/features/forms/components/TextField.tsx
- [X] T050 [P] [US4] Create SelectField component in src/features/forms/components/SelectField.tsx
- [X] T051 [P] [US4] Create CheckboxField component in src/features/forms/components/CheckboxField.tsx
- [X] T052 [P] [US4] Create RadioGroup component in src/features/forms/components/RadioGroup.tsx
- [X] T053 [P] [US4] Create DatePicker component in src/features/forms/components/DatePicker.tsx
- [X] T054 [US4] Create Zod validation schemas in src/features/forms/schemas/index.ts
- [X] T055 [US4] Create FormDemo page showcasing all fields in src/features/forms/components/FormDemo.tsx
- [X] T056 [US4] Implement loading state on submit button to prevent double submission
- [X] T057 [US4] Register FormDemo route as "/forms" in src/app/router.tsx

**Checkpoint**: All form components validate in real-time with inline error messages ✅

---

## Phase 7: User Story 5 — Theme Switching (Priority: P3) ✅

**Goal**: Light/dark theme toggle with localStorage persistence and system preference detection

**Independent Test**: Click theme toggle, verify UI switches, refresh page and verify preference persists

### Implementation for User Story 5

- [X] T058 [P] [US5] Create theme CSS variables in src/features/theme/styles/theme.css
- [X] T059 [US5] Create useTheme hook with localStorage sync in src/features/theme/hooks/useTheme.ts
- [X] T060 [US5] Create ThemeToggle component in src/features/theme/components/ThemeToggle.tsx
- [X] T061 [US5] Add system preference detection (prefers-color-scheme) in useTheme
- [X] T062 [US5] Integrate ThemeToggle into app header/toolbar in src/app/App.tsx
- [X] T063 [US5] Apply dark mode class to all components using Tailwind dark: variants

**Checkpoint**: Theme toggles instantly, persists across refresh, respects system preference ✅

---

## Phase 8: User Story 6 — Notification System (Priority: P3) ✅

**Goal**: Toast notifications for success/error/warning/info with auto-dismiss

**Independent Test**: Trigger actions that show toasts, verify they appear, auto-dismiss after 5s, and stack correctly

### Implementation for User Story 6

- [X] T064 [P] [US6] Create useNotifications hook in src/features/notifications/hooks/useNotifications.ts
- [X] T065 [P] [US6] Create Toast component in src/features/notifications/components/Toast.tsx
- [X] T066 [US6] Create ToastContainer with stacking logic in src/features/notifications/components/ToastContainer.tsx
- [X] T067 [US6] Add slide-in/fade-out animations with Tailwind transitions
- [X] T068 [US6] Integrate ToastContainer into App providers in src/app/App.tsx
- [X] T069 [US6] Connect CRUD operations to show success/error toasts in UsersPage

**Checkpoint**: All actions show appropriate toast notifications ✅

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T070 [P] Add keyboard navigation (Tab, Enter, Escape) to all interactive elements
- [X] T071 [P] Add aria-labels and roles for accessibility (Lighthouse 90+ target)
- [X] T072 [P] Add responsive breakpoints for 320px-1920px width across all pages
- [ ] T073 Optimize bundle size: verify <500KB gzipped with Vite build analysis
- [X] T074 Add noscript fallback message in index.html
- [ ] T075 Run quickstart.md validation: verify all setup steps work
- [ ] T076 Final code cleanup: remove unused imports, format all files

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion — BLOCKS all user stories
- **User Stories (Phase 3-8)**: All depend on Foundational phase completion
  - US1 + US2 (P1): Can run in parallel after Foundational
  - US3 + US4 (P2): Can run in parallel after Foundational
  - US5 + US6 (P3): Can run in parallel after Foundational
- **Polish (Phase 9)**: Depends on all user stories being complete

### User Story Dependencies

| Story | Priority | Can Start After | Dependencies on Other Stories |
|-------|----------|-----------------|-------------------------------|
| US1 — Dashboard | P1 | Phase 2 | None |
| US2 — Data Table | P1 | Phase 2 | None |
| US3 — Navigation | P2 | Phase 2 | None (but routes from US1/US2 useful) |
| US4 — Forms | P2 | Phase 2 | None (but integrates with US2) |
| US5 — Theme | P3 | Phase 2 | None |
| US6 — Notifications | P3 | Phase 2 | None (but integrates with US2 CRUD) |

### Within Each User Story

1. Hooks/utilities before components
2. Smaller components before page components
3. Page component before route registration
4. Integration with other features last

### Parallel Opportunities

| Phase | Parallel Tasks |
|-------|----------------|
| Phase 1 | T003, T004 (dependencies) / T005, T006, T007 (config) |
| Phase 2 | T012, T013, T014 (utilities) / T018-T022 (shared components) |
| Phase 3 | T023, T024, T025 (dashboard widgets) |
| Phase 4 | T030, T031, T032 (user hooks/utils) |
| Phase 5 | T042, T043, T044 (nav components) |
| Phase 6 | T049-T053 (all form fields) |
| Phase 7 | T058 (CSS) can parallel with T059 (hook) |
| Phase 8 | T064, T065 (hook + component) |
| Phase 9 | T070, T071, T072 (all polish tasks) |

---

## Parallel Example: Phase 2 Foundational

```bash
# Launch all shared components together:
Task T018: "Create Button in src/shared/components/Button.tsx"
Task T019: "Create Card in src/shared/components/Card.tsx"
Task T020: "Create Modal in src/shared/components/Modal.tsx"
Task T021: "Create EmptyState in src/shared/components/EmptyState.tsx"
Task T022: "Create LoadingSpinner in src/shared/components/LoadingSpinner.tsx"

# Launch all utilities together:
Task T012: "Create seed.ts in src/data/seed.ts"
Task T013: "Create cn.ts in src/shared/utils/cn.ts"
Task T014: "Create formatters.ts in src/shared/utils/formatters.ts"
```

---

## Implementation Strategy

### MVP First (User Stories 1 + 2 Only)

1. Complete Phase 1: Setup (~30 min)
2. Complete Phase 2: Foundational (~2 hrs)
3. Complete Phase 3: Dashboard (US1) (~2 hrs)
4. Complete Phase 4: Data Table (US2) (~3 hrs)
5. **STOP and VALIDATE**: Both P1 stories work independently
6. Deploy/demo MVP

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. Add US1 (Dashboard) → Demo: "See the dashboard"
3. Add US2 (Data Table) → Demo: "Manage users with CRUD"
4. Add US3 (Navigation) → Demo: "Full navigation working"
5. Add US4 (Forms) → Demo: "Reusable form components"
6. Add US5 (Theme) → Demo: "Dark mode support"
7. Add US6 (Notifications) → Demo: "Action feedback"
8. Polish → Production ready

### Estimated Effort

| Phase | Tasks | Estimated Time |
|-------|-------|----------------|
| Setup | T001-T009 | 30 min |
| Foundational | T010-T022 | 2 hrs |
| US1 Dashboard | T023-T029 | 2 hrs |
| US2 Data Table | T030-T041 | 3 hrs |
| US3 Navigation | T042-T048 | 1.5 hrs |
| US4 Forms | T049-T057 | 2 hrs |
| US5 Theme | T058-T063 | 1 hr |
| US6 Notifications | T064-T069 | 1 hr |
| Polish | T070-T076 | 1.5 hrs |
| **Total** | **76 tasks** | **~14.5 hrs** |

---

## Notes

- [P] tasks = different files, no dependencies on incomplete tasks
- [Story] label maps task to specific user story for traceability
- Each user story is independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- US1 + US2 together form the minimum viable product (MVP)

## Implementation Status (2025-11-26)

| Phase | Status | Completed Tasks |
|-------|--------|-----------------|
| Phase 1: Setup | ✅ 89% | 8/9 tasks |
| Phase 2: Foundational | ✅ 100% | 13/13 tasks |
| Phase 3: Dashboard (US1) | ✅ 100% | 7/7 tasks |
| Phase 4: Data Table (US2) | ✅ 100% | 12/12 tasks |
| Phase 5: Navigation (US3) | ✅ 100% | 7/7 tasks |
| Phase 6: Forms (US4) | ✅ 100% | 9/9 tasks |
| Phase 7: Theme (US5) | ✅ 100% | 6/6 tasks |
| Phase 8: Notifications (US6) | ✅ 100% | 6/6 tasks |
| Phase 9: Polish | 🔄 43% | 3/7 tasks |
| **Total** | **95%** | **71/76 tasks** |

**Status**: ✅ All User Stories Complete (US1-US6)

**Remaining Tasks** (5):
- T007: ESLint + Prettier configuration
- T070: Keyboard navigation enhancement
- T073: Bundle size optimization
- T075: Quickstart validation
- T076: Final code cleanup

