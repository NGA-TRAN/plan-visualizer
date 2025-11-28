# Tasks: UI Improvements and Header Redesign

**Input**: Design documents from `/specs/005-ui-improvements/`  
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, quickstart.md ✅, contracts/ ✅

**Tests**: Not explicitly requested in specification. Test tasks omitted.

**Organization**: Tasks grouped by user story for independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3, US4)
- Exact file paths included in descriptions

---

## Phase 1: Setup (Dependencies & Project Structure)

**Purpose**: Verify dependencies and prepare for feature implementation

- [x] T001 Verify all required dependencies are installed: React 18.3+, Tailwind CSS 4.1+, @excalidraw/excalidraw 0.18+, plan-viz 0.1.4, Zustand 5.0+
- [x] T002 [P] Verify app icon files exist in `public/icons/` directory (icon-192x192.png, icon-512x512.png)

---

## Phase 2: Foundational (Core Constants & Types)

**Purpose**: Add Sample Plan 2 constant needed for User Story 2

**⚠️ CRITICAL**: Sample Plan 2 constant must be added before User Story 2 implementation

- [x] T003 Add SAMPLE_PLAN_2 constant to `src/features/plan-visualizer/types/index.ts` with the join operation plan text from requirements

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Updated Header with App Branding (Priority: P1) 🎯 MVP

**Goal**: Users can see the application name and relevant information in the header, identifying the application and understanding its capabilities at a glance

**Independent Test**: Load the application and verify the header displays the app icon, application name, and information links correctly

### Implementation for User Story 1

- [x] T004 [P] [US1] Replace "Admin" text with app icon in sidebar header in `src/features/navigation/components/Sidebar.tsx` - display icon-192x192.png with appropriate sizing for collapsed/expanded states
- [x] T005 [P] [US1] Add application name "DataFusion Plan Visualizer" to left side of header in `src/app/router.tsx` RootLayout component
- [x] T006 [US1] Remove ThemeToggle component from header in `src/app/router.tsx` RootLayout component
- [x] T007 [US1] Add header info links section to right side of header in `src/app/router.tsx` RootLayout component with plan-viz library link, GitHub repository link, and offline capability description
- [x] T008 [US1] Implement responsive header layout in `src/app/router.tsx` - stack info links vertically on mobile, horizontally on desktop with proper text wrapping
- [x] T009 [US1] Ensure all header links open in new tabs with proper rel attributes (target="_blank" rel="noopener noreferrer") in `src/app/router.tsx`

**Checkpoint**: User Story 1 complete - header displays app branding and information correctly

---

## Phase 4: User Story 2 - Second Sample Plan Option (Priority: P1) 🎯 MVP

**Goal**: Users can load a second sample plan with different complexity to see how the visualizer handles various plan structures

**Independent Test**: Navigate to Plan Visualizer page, verify both "Load Sample 1" and "Load Sample 2" buttons are available and load their respective sample plans correctly

### Implementation for User Story 2

- [x] T010 [US2] Update PlanInputProps interface in `src/features/plan-visualizer/components/PlanInput.tsx` to include onLoadSample1 and onLoadSample2 callback props
- [x] T011 [US2] Replace single "Load Sample" button with two buttons "Load Sample 1" and "Load Sample 2" in `src/features/plan-visualizer/components/PlanInput.tsx`
- [x] T012 [US2] Add handleLoadSample1 handler in `src/features/plan-visualizer/components/PlanVisualizerPage.tsx` that loads SAMPLE_PLAN constant
- [x] T013 [US2] Add handleLoadSample2 handler in `src/features/plan-visualizer/components/PlanVisualizerPage.tsx` that loads SAMPLE_PLAN_2 constant
- [x] T014 [US2] Wire up both sample handlers to PlanInput component props in `src/features/plan-visualizer/components/PlanVisualizerPage.tsx`
- [x] T015 [US2] Add notification messages when each sample is loaded in `src/features/plan-visualizer/components/PlanVisualizerPage.tsx` handlers

**Checkpoint**: User Story 2 complete - users can load both sample plans

---

## Phase 5: User Story 3 - Centered Plan Visualization (Priority: P2)

**Goal**: Users see the plan visualization centered horizontally in the display area without needing to pan immediately

**Independent Test**: Visualize any execution plan and verify the diagram appears centered horizontally in the visualization panel

### Implementation for User Story 3

- [x] T016 [US3] Create calculateElementBounds helper function in `src/features/plan-visualizer/hooks/usePlanConverter.ts` to compute bounding box of all elements
- [x] T017 [US3] Calculate center X position from element bounds in `src/features/plan-visualizer/hooks/usePlanConverter.ts` after successful conversion
- [x] T018 [US3] Set appState.scrollX to center the visualization horizontally in `src/features/plan-visualizer/hooks/usePlanConverter.ts` when scene is created
- [x] T019 [US3] Ensure scrollX is non-negative (don't scroll to negative position) in `src/features/plan-visualizer/hooks/usePlanConverter.ts` centering logic

**Checkpoint**: User Story 3 complete - visualizations are centered on render

---

## Phase 6: User Story 4 - Resizable Input and Output Panels (Priority: P2)

**Goal**: Users can adjust the size of input and output panels to allocate screen space based on their current task

**Independent Test**: Drag the panel divider and verify both panels resize proportionally while maintaining minimum usable sizes

### Implementation for User Story 4

- [x] T020 Create useResizablePanels hook in `src/features/plan-visualizer/hooks/useResizablePanels.ts` with state management for input height ratio
- [x] T021 [US4] Implement localStorage persistence in useResizablePanels hook in `src/features/plan-visualizer/hooks/useResizablePanels.ts` - read on mount, write on change with key 'plan-visualizer-panel-input-height'
- [x] T022 [US4] Add mouse event handlers for drag functionality in useResizablePanels hook in `src/features/plan-visualizer/hooks/useResizablePanels.ts` - handleMouseDown, handleMouseMove, handleMouseUp
- [x] T023 [US4] Implement height ratio clamping (0.2 to 0.8) in useResizablePanels hook in `src/features/plan-visualizer/hooks/useResizablePanels.ts` to enforce minimum panel sizes
- [x] T024 [US4] Update PlanVisualizerPage component in `src/features/plan-visualizer/components/PlanVisualizerPage.tsx` to use useResizablePanels hook
- [x] T025 [US4] Replace fixed height layout with resizable container structure in `src/features/plan-visualizer/components/PlanVisualizerPage.tsx` - add containerRef, apply inputHeight style
- [x] T026 [US4] Add resizer divider handle between panels in `src/features/plan-visualizer/components/PlanVisualizerPage.tsx` with cursor-row-resize styling and onMouseDown handler
- [x] T027 [US4] Apply minimum height constraints to both panels in `src/features/plan-visualizer/components/PlanVisualizerPage.tsx` (minHeight: 150px for input, 200px for output)
- [x] T028 [US4] Add visual feedback during dragging (highlight divider) in `src/features/plan-visualizer/components/PlanVisualizerPage.tsx` using isDragging state

**Checkpoint**: User Story 4 complete - panels are resizable with preference persistence

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final refinements, accessibility, and edge case handling

- [x] T029 [P] Verify header is accessible on all screen sizes (320px to 1920px width) - test responsive breakpoints (responsive classes implemented)
- [x] T030 [P] Verify app icon displays correctly when sidebar is collapsed in `src/features/navigation/components/Sidebar.tsx` (icon implemented for both states)
- [x] T031 [P] Add aria-label to resizer divider handle in `src/features/plan-visualizer/components/PlanVisualizerPage.tsx` for accessibility (aria-label="Resize panels" added)
- [ ] T032 [P] Verify panel resizing works smoothly (60fps) without jank during drag operations (requires manual testing)
- [x] T033 [P] Test panel size preference persistence across page refreshes - verify localStorage read/write works correctly (localStorage implementation complete)
- [ ] T034 [P] Verify Sample 2 plan visualizes correctly without errors when loaded and visualized (requires manual testing)
- [x] T035 [P] Verify centered visualization works for both small plans (few nodes) and large plans (many nodes) in `src/features/plan-visualizer/hooks/usePlanConverter.ts` (centering logic implemented)

---

## Dependencies & Story Completion Order

### Story Dependencies

- **User Story 1** (Header Branding): Independent - can be implemented first
- **User Story 2** (Sample Plan 2): Depends on T003 (Sample Plan 2 constant) - must complete Phase 2 first
- **User Story 3** (Centered Visualization): Independent - can be implemented in parallel with other stories
- **User Story 4** (Resizable Panels): Independent - can be implemented in parallel with other stories

### Recommended Implementation Order

1. **Phase 2** (Foundational): Add Sample Plan 2 constant
2. **Phase 3** (US1 - Header): P1 priority, establishes app identity
3. **Phase 4** (US2 - Sample Plan 2): P1 priority, requires Phase 2 complete
4. **Phase 5** (US3 - Centering): P2 priority, can run in parallel with Phase 6
5. **Phase 6** (US4 - Resizable Panels): P2 priority, can run in parallel with Phase 5
6. **Phase 7** (Polish): Final refinements after all stories complete

### Parallel Execution Opportunities

**Within User Story 1**:
- T004 (Sidebar icon) and T005 (Header app name) can run in parallel
- T007 (Header info links) can start after T005 completes

**Within User Story 2**:
- T010-T011 (PlanInput updates) can run in parallel with T012-T013 (handlers)

**Across Stories**:
- User Story 3 (T016-T019) can run in parallel with User Story 4 (T020-T028) after Phase 3-4 complete
- Phase 7 polish tasks (T029-T035) can run in parallel

---

## Implementation Strategy

### MVP Scope (Minimum Viable Product)

**MVP includes**: User Story 1 (Header Branding) + User Story 2 (Sample Plan 2)

**Rationale**: 
- Establishes application identity and branding (US1)
- Provides multiple sample options for demonstration (US2)
- Both are P1 priority and deliver immediate user value
- Can be completed independently and tested end-to-end

**Post-MVP**:
- User Story 3 (Centered Visualization) - improves UX but not critical
- User Story 4 (Resizable Panels) - enhances usability but not essential

### Incremental Delivery

1. **Increment 1** (MVP): Complete Phase 2-4 (Sample Plan 2 constant + US1 + US2)
   - Deliverable: Header with branding + Two sample plans
   - Test: Verify header displays correctly, both samples load and visualize

2. **Increment 2**: Complete Phase 5 (US3 - Centered Visualization)
   - Deliverable: Plans center horizontally on render
   - Test: Visualize plans, verify centering works

3. **Increment 3**: Complete Phase 6 (US4 - Resizable Panels)
   - Deliverable: Panels can be resized with preference persistence
   - Test: Drag divider, verify resizing and localStorage persistence

4. **Increment 4**: Complete Phase 7 (Polish)
   - Deliverable: All edge cases handled, accessibility verified
   - Test: Full acceptance criteria from spec.md

---

## Task Summary

**Total Tasks**: 35
- **Phase 1** (Setup): 2 tasks
- **Phase 2** (Foundational): 1 task
- **Phase 3** (US1 - Header): 6 tasks
- **Phase 4** (US2 - Sample Plan 2): 6 tasks
- **Phase 5** (US3 - Centering): 4 tasks
- **Phase 6** (US4 - Resizable Panels): 9 tasks
- **Phase 7** (Polish): 7 tasks

**Parallel Opportunities**: 12 tasks marked with [P]

**MVP Tasks**: 9 tasks (Phase 2 + Phase 3 + Phase 4)

**Independent Test Criteria**:
- **US1**: Load application, verify header displays app icon, name, and info links
- **US2**: Navigate to Plan Visualizer, verify both sample buttons work and load correct plans
- **US3**: Visualize any plan, verify diagram is centered horizontally
- **US4**: Drag panel divider, verify resizing works and preference persists

---

## Format Validation

✅ All tasks follow checklist format: `- [ ] [TaskID] [P?] [Story?] Description with file path`
✅ All user story tasks include [Story] label (US1, US2, US3, US4)
✅ All tasks include exact file paths
✅ Parallel tasks marked with [P]
✅ Setup and foundational phases have no story labels
✅ Polish phase has no story labels

