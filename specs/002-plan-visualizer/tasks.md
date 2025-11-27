# Tasks: Plan Visualizer

**Input**: Design documents from `/specs/002-plan-visualizer/`  
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, quickstart.md ✅

**Tests**: Not explicitly requested in specification. Test tasks omitted.

**Organization**: Tasks grouped by user story for independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3, US4)
- Exact file paths included in descriptions

---

## Phase 1: Setup (Dependencies & Project Structure)

**Purpose**: Install dependencies and create feature folder structure

- [x] T001 Install @excalidraw/excalidraw and plan-viz packages via `npm install @excalidraw/excalidraw plan-viz`
- [x] T002 [P] Create feature directory structure at `src/features/plan-visualizer/`
- [x] T003 [P] Create types file at `src/features/plan-visualizer/types/index.ts` with ConversionStatus, ConversionState, and VisualizerUIState types

---

## Phase 2: Foundational (Core Hook & Route)

**Purpose**: Core infrastructure that MUST be complete before UI components

**⚠️ CRITICAL**: No user story UI work can begin until this phase is complete

- [x] T004 Implement usePlanConverter hook in `src/features/plan-visualizer/hooks/usePlanConverter.ts` with convert() function using plan-viz
- [x] T005 Add /plan-visualizer route to `src/app/router.tsx` with lazy-loaded PlanVisualizerPage component

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Enter and Visualize Execution Plan (Priority: P1) 🎯 MVP

**Goal**: Users can paste a DataFusion Physical Execution Plan and see it rendered as an interactive Excalidraw diagram

**Independent Test**: Paste a valid execution plan string, click Visualize, and verify an interactive diagram appears

### Implementation for User Story 1

- [x] T006 [P] [US1] Create PlanInput component in `src/features/plan-visualizer/components/PlanInput.tsx` with textarea and Visualize button
- [x] T007 [P] [US1] Create ExcalidrawCanvas component in `src/features/plan-visualizer/components/ExcalidrawCanvas.tsx` wrapping @excalidraw/excalidraw
- [x] T007a [US1] Add React Error Boundary around Excalidraw component in `src/features/plan-visualizer/components/ExcalidrawCanvas.tsx` to catch library load/render failures with fallback UI
- [x] T008 [US1] Create PlanVisualizerPage in `src/features/plan-visualizer/components/PlanVisualizerPage.tsx` orchestrating PlanInput, usePlanConverter, and ExcalidrawCanvas
- [x] T009 [US1] Wire up conversion flow: PlanInput → usePlanConverter.convert() → ExcalidrawCanvas with elements
- [x] T010 [US1] Add empty input validation: show message when Visualize clicked with empty input
- [x] T011 [US1] Add loading state during conversion with visual indicator

**Checkpoint**: User Story 1 complete - users can input plans and see visualizations

---

## Phase 4: User Story 2 - Interact with the Visualization (Priority: P2)

**Goal**: Users can pan, zoom, and select elements on the Excalidraw canvas

**Independent Test**: Render any plan, then verify zoom (scroll/pinch), pan (click-drag), and selection work

### Implementation for User Story 2

- [x] T012 [US2] Configure Excalidraw component with viewModeEnabled=false to enable interactions in `src/features/plan-visualizer/components/ExcalidrawCanvas.tsx`
- [x] T013 [US2] Add zoom controls UI (optional buttons for zoom in/out/reset) in `src/features/plan-visualizer/components/ExcalidrawCanvas.tsx`
- [x] T014 [US2] Verify pan and selection behaviors work with Excalidraw defaults

**Checkpoint**: User Story 2 complete - canvas is fully interactive

---

## Phase 5: User Story 3 - Handle Invalid Input Gracefully (Priority: P2)

**Goal**: Users see clear error messages when plan conversion fails, previous visualization preserved

**Independent Test**: Enter invalid plan text, verify error message appears and previous diagram (if any) remains

### Implementation for User Story 3

- [x] T015 [US3] Add try-catch error handling in usePlanConverter hook in `src/features/plan-visualizer/hooks/usePlanConverter.ts`
- [x] T016 [US3] Store previousElements in conversion state to preserve last valid visualization in `src/features/plan-visualizer/hooks/usePlanConverter.ts`
- [x] T017 [US3] Display error toast via useNotifications hook when conversion fails in `src/features/plan-visualizer/components/PlanVisualizerPage.tsx`
- [x] T018 [US3] Add inline error banner below input area showing error details in `src/features/plan-visualizer/components/PlanInput.tsx`
- [x] T019 [US3] Ensure input text is preserved on error for user correction in `src/features/plan-visualizer/components/PlanInput.tsx`
- [x] T019a [US3] Add performance warning for plans exceeding 100 nodes in `src/features/plan-visualizer/hooks/usePlanConverter.ts` - count nodes before rendering and show warning toast if threshold exceeded

**Checkpoint**: User Story 3 complete - graceful error handling works

---

## Phase 6: User Story 4 - Access Plan Visualizer from Navigation (Priority: P3)

**Goal**: Users can access Plan Visualizer from the sidebar navigation

**Independent Test**: Click "Plan Visualizer" in sidebar, verify navigation to /plan-visualizer

### Implementation for User Story 4

- [x] T020 [US4] Add Plan Visualizer navigation item to navigation config in `src/features/navigation/hooks/useNavigation.ts`
- [x] T021 [US4] Add Workflow icon import from lucide-react for navigation item
- [x] T022 [US4] Verify navigation item appears in sidebar and links to correct route

**Checkpoint**: User Story 4 complete - feature accessible from navigation

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Theme support, responsive layout, and final polish

- [x] T023 [P] Add theme synchronization to ExcalidrawCanvas in `src/features/plan-visualizer/components/ExcalidrawCanvas.tsx` reading from theme store
- [x] T024 [P] Implement responsive layout (stacked on mobile, side-by-side on desktop) in `src/features/plan-visualizer/components/PlanVisualizerPage.tsx`
- [x] T025 [P] Add sample plan preset button for quick testing in `src/features/plan-visualizer/components/PlanInput.tsx`
- [x] T026 Style input area and canvas container with Tailwind classes matching admin template design
- [x] T027 Add page title and description header to PlanVisualizerPage
- [x] T028 Create component barrel export at `src/features/plan-visualizer/components/index.ts`
- [x] T029 Run quickstart.md validation: verify all setup steps work
- [x] T030 Verify bundle size impact is <500KB gzipped for the new feature

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phases 3-6)**: All depend on Foundational phase completion
- **Polish (Phase 7)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories ✅
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Enhances US1 but independently testable ✅
- **User Story 3 (P2)**: Can start after Foundational (Phase 2) - Enhances US1 but independently testable ✅
- **User Story 4 (P3)**: Can start after Foundational (Phase 2) - Completely independent ✅

### Within Each User Story

- Types/models before hooks
- Hooks before components
- Components before page assembly
- Core implementation before polish

### Parallel Opportunities

- T002, T003 (Setup phase) can run in parallel
- T006, T007 (US1 components) can run in parallel
- T023, T024, T025 (Polish phase) can run in parallel
- Once Foundational completes, US1-US4 can theoretically start in parallel

---

## Parallel Example: User Story 1

```bash
# Launch component creation in parallel:
Task T006: "Create PlanInput component in src/features/plan-visualizer/components/PlanInput.tsx"
Task T007: "Create ExcalidrawCanvas component in src/features/plan-visualizer/components/ExcalidrawCanvas.tsx"

# Then sequential assembly:
Task T008: "Create PlanVisualizerPage orchestrating both components"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T003)
2. Complete Phase 2: Foundational (T004-T005)
3. Complete Phase 3: User Story 1 (T006-T011)
4. **STOP and VALIDATE**: Test plan input and visualization independently
5. Deploy/demo if ready - core value delivered!

### Incremental Delivery

1. **MVP**: Setup + Foundational + User Story 1 → Basic plan visualization works
2. **+Interaction**: Add User Story 2 → Full canvas interaction
3. **+Error Handling**: Add User Story 3 → Graceful failure handling
4. **+Navigation**: Add User Story 4 → Discoverable from sidebar
5. **+Polish**: Theme, responsiveness, sample data

---

## Summary

| Metric | Count |
|--------|-------|
| Total Tasks | 32 |
| Setup Tasks | 3 |
| Foundational Tasks | 2 |
| User Story 1 Tasks | 7 |
| User Story 2 Tasks | 3 |
| User Story 3 Tasks | 6 |
| User Story 4 Tasks | 3 |
| Polish Tasks | 8 |
| Parallel Opportunities | 9 tasks marked [P] |

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story is independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- MVP = User Story 1 only (Phases 1-3)

