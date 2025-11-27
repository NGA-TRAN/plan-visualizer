# Implementation Plan: Plan Visualizer

**Branch**: `002-plan-visualizer` | **Date**: 2025-11-26 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-plan-visualizer/spec.md`

## Summary

Add a Plan Visualizer feature that allows users to input DataFusion Physical Execution Plan text and visualize it as an interactive Excalidraw diagram. The feature integrates the `plan-viz` library for conversion and `@excalidraw/excalidraw` for rendering, following the existing admin template architecture.

## Technical Context

**Language/Version**: TypeScript 5.x with React 18+  
**Primary Dependencies**: React 18, plan-viz, @excalidraw/excalidraw, Zustand  
**Storage**: N/A (in-memory state only)  
**Testing**: Vitest + React Testing Library  
**Target Platform**: Web (Modern browsers: Chrome, Firefox, Safari, Edge)  
**Project Type**: Web SPA (extending existing admin template)  
**Performance Goals**: Plan conversion and rendering <3s, smooth 60fps canvas interactions  
**Constraints**: Client-side only, no backend; bundle size impact <500KB gzipped for new feature  
**Scale/Scope**: Plans with up to 100 nodes; single-page feature integrated into existing app

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Check | Status |
|-----------|-------|--------|
| I. Deep Module Architecture | PlanVisualizer component has ≤5 props; ExcalidrawCanvas encapsulates all canvas logic | ✅ |
| II. Render-as-You-Fetch | No server data fetching required; conversion is synchronous/local | ✅ (N/A) |
| III. State Colocation | UI state (input text, error) local; visualization state local to canvas | ✅ |
| IV. Feature-Based Organization | All code in `src/features/plan-visualizer/` | ✅ |
| V. Logic Extraction | Conversion logic extracted to `usePlanConverter` hook | ✅ |

**Technology Stack (Required):**
- React 18+ (functional components only) ✅
- TanStack Query v5+ for server state ✅ (Not needed - no server state)
- Tailwind CSS or zero-runtime CSS solution ✅

**Constitution Compliance Note**: This feature has NO server data fetching, so Principle II (Render-as-You-Fetch) is not applicable. All state is UI/client state managed locally.

## Project Structure

### Documentation (this feature)

```text
specs/002-plan-visualizer/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
└── tasks.md             # Phase 2 output (created by /speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── features/
│   ├── plan-visualizer/           # NEW: Plan Visualizer feature
│   │   ├── components/
│   │   │   ├── PlanVisualizerPage.tsx    # Main page component
│   │   │   ├── PlanInput.tsx             # Text input area
│   │   │   └── ExcalidrawCanvas.tsx      # Excalidraw wrapper
│   │   ├── hooks/
│   │   │   └── usePlanConverter.ts       # Conversion logic hook
│   │   └── types/
│   │       └── index.ts                  # Feature-specific types
│   ├── navigation/                # EXISTING: Add nav item
│   └── theme/                     # EXISTING: Theme support
├── shared/
│   └── components/                # Reuse existing Button, Card, etc.
└── app/
    └── router.tsx                 # Add /plan-visualizer route
```

**Structure Decision**: Feature-based organization following Constitution Principle IV. The plan-visualizer feature is self-contained in its own folder with components, hooks, and types co-located.

## Complexity Tracking

> No Constitution Check violations. All principles satisfied.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| (none) | - | - |

## Key Design Decisions

### 1. State Management
- **Input text**: Local `useState` in PlanInput component
- **Conversion result**: Local state in PlanVisualizerPage, passed to ExcalidrawCanvas
- **Error state**: Local `useState` for error messages
- **Canvas state**: Managed internally by Excalidraw component

### 2. Component Boundaries
- **PlanVisualizerPage**: Orchestrates layout, holds converted data state
- **PlanInput**: Controlled textarea with "Visualize" button
- **ExcalidrawCanvas**: Wraps @excalidraw/excalidraw, handles theme sync

### 3. Error Handling Strategy
- Catch conversion errors in `usePlanConverter` hook
- Display user-friendly error toast via existing notification system
- Preserve last valid visualization when conversion fails

### 4. Theme Integration
- Subscribe to existing theme store for dark/light mode
- Pass theme to Excalidraw via `theme` prop
- Ensure proper contrast in both modes

### 5. Navigation Integration
- Add "Plan Visualizer" item to existing navigation config
- Icon: Use Lucide `Workflow` or similar icon
- Route: `/plan-visualizer`

