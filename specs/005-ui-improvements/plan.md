# Implementation Plan: UI Improvements and Header Redesign

**Branch**: `005-ui-improvements` | **Date**: 2025-01-27 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/005-ui-improvements/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

This feature implements UI improvements including header redesign with app branding, addition of a second sample plan, centered plan visualization, and resizable input/output panels. The changes enhance user experience by providing better application identity, more sample options, improved visualization layout, and customizable workspace configuration.

## Technical Context

**Language/Version**: TypeScript 5.9+  
**Primary Dependencies**: React 18.3+, Tailwind CSS 4.1+, @excalidraw/excalidraw 0.18+, plan-viz 0.1.4, Zustand 5.0+  
**Storage**: Browser localStorage (for panel size preferences), IndexedDB (existing offline storage)  
**Testing**: Manual testing, browser DevTools  
**Target Platform**: Web browsers (Chrome, Firefox, Safari, Edge - last 2 versions), Progressive Web App  
**Project Type**: Web application (frontend-only SPA)  
**Performance Goals**: Panel resizing responds within 16ms (60fps), header renders within 100ms, panel preferences load instantly  
**Constraints**: Must work offline (PWA), responsive from 320px to 1920px width, maintain accessibility standards  
**Scale/Scope**: Single-page application, 4 user stories, 14 functional requirements, affects 3-4 component files

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Check | Status |
|-----------|-------|--------|
| I. Deep Module Architecture | Components have ≤5 props, encapsulate complexity internally | ✅ |
| II. Render-as-You-Fetch | No fetch waterfalls; data loading parallelized via TanStack Query | ✅ N/A (no server state) |
| III. State Colocation | UI state local, server state in TanStack Query, global state justified | ✅ |
| IV. Feature-Based Organization | Code organized by feature in `src/features/<name>/` | ✅ |
| V. Logic Extraction | Components >150 lines have logic extracted to hooks | ✅ |

**Technology Stack (Required):**
- React 18+ (functional components only) ✅
- TanStack Query v5+ for server state ✅ N/A (frontend-only, no server state)
- Tailwind CSS or zero-runtime CSS solution ✅

**Constitution Compliance Notes:**
- All components follow feature-based organization in `src/features/`
- Panel resizing logic will be extracted to a custom hook (`useResizablePanels`)
- Header component will have ≤5 props (appName, infoLinks, etc.)
- Panel size preference state stored in localStorage (justified: user preference persistence)
- No server state involved, so TanStack Query not applicable

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── App.tsx
│   └── router.tsx                    # RootLayout with header (modify)
├── features/
│   ├── navigation/
│   │   ├── components/
│   │   │   ├── Sidebar.tsx          # Replace "Admin" with icon (modify)
│   │   │   ├── NavGroup.tsx
│   │   │   └── NavItem.tsx
│   │   └── hooks/
│   │       └── useNavigation.ts
│   ├── plan-visualizer/
│   │   ├── components/
│   │   │   ├── PlanVisualizerPage.tsx  # Add resizable panels (modify)
│   │   │   ├── PlanInput.tsx           # Add Sample 2 button (modify)
│   │   │   └── ExcalidrawCanvas.tsx    # Center visualization (modify)
│   │   ├── hooks/
│   │   │   ├── usePlanConverter.ts
│   │   │   └── useResizablePanels.ts   # New hook for panel resizing
│   │   └── types/
│   │       └── index.ts                # Add SAMPLE_PLAN_2 constant
│   └── theme/
│       └── components/
│           └── ThemeToggle.tsx         # Remove from header (no change)
├── shared/
│   └── components/
│       └── [existing shared components]
└── store/
    └── index.ts                        # Add panel size preference state (modify)
```

**Structure Decision**: Web application structure with feature-based organization. Changes span:
- `src/app/router.tsx`: Header component modifications
- `src/features/navigation/components/Sidebar.tsx`: App icon replacement
- `src/features/plan-visualizer/`: Multiple component and hook updates
- `src/store/index.ts`: Panel preference state addition

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations - all changes comply with Constitution principles.

---

## Phase 0: Research Complete ✅

**Output**: `research.md` - All technical decisions resolved:
- App icon implementation pattern
- Header responsive layout design
- Panel resizing approach
- Excalidraw centering method
- Sample Plan 2 content
- Offline capability description
- Application name recommendation

---

## Phase 1: Design Complete ✅

**Outputs**:
- `data-model.md` - Entities: PanelSizePreference, SamplePlan, HeaderInfoLink
- `contracts/README.md` - Component interfaces and localStorage contracts
- `quickstart.md` - Step-by-step implementation guide

**Agent Context**: Updated with new technologies/patterns from this plan.

---

## Next Steps

Ready for `/speckit.tasks` to generate implementation tasks organized by user story.
