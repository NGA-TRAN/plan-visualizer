# Data Model: Plan Visualizer

**Feature**: 002-plan-visualizer  
**Date**: 2025-11-26

## Overview

The Plan Visualizer feature operates entirely client-side with no persistent storage. All data is transient, held in React component state during the user session.

## Entities

### 1. ExecutionPlanInput

The raw text input from the user representing a DataFusion Physical Execution Plan.

```typescript
interface ExecutionPlanInput {
  /** Raw plan text entered by user */
  text: string;
  
  /** Timestamp when input was last modified */
  lastModified: Date;
}
```

**Validation Rules**:
- Text must not be empty for conversion attempt
- No maximum length enforced (handled by browser)
- Whitespace-only input treated as empty

---

### 2. ExcalidrawElements

The converted diagram data compatible with the Excalidraw library.

```typescript
import type { ExcalidrawElement } from '@excalidraw/excalidraw/types/element/types';

interface ConversionResult {
  /** Array of Excalidraw elements (shapes, text, connectors) */
  elements: ExcalidrawElement[];
  
  /** Optional app state (zoom, scroll position) */
  appState?: {
    viewBackgroundColor?: string;
    zoom?: { value: number };
    scrollX?: number;
    scrollY?: number;
  };
}
```

**Note**: The `ExcalidrawElement` type is imported from the @excalidraw/excalidraw package. It includes shapes (rectangles, ellipses), text, arrows, and other diagram primitives.

---

### 3. ConversionState

The state machine representing the conversion process.

```typescript
type ConversionStatus = 
  | 'idle'           // No conversion attempted yet
  | 'converting'     // Conversion in progress
  | 'success'        // Conversion completed successfully
  | 'error';         // Conversion failed

interface ConversionState {
  status: ConversionStatus;
  
  /** Error message if status is 'error' */
  errorMessage: string | null;
  
  /** Converted elements if status is 'success' */
  elements: ExcalidrawElement[] | null;
  
  /** Previous successful elements (preserved on error) */
  previousElements: ExcalidrawElement[] | null;
}
```

**State Transitions**:
```
idle → converting (user clicks Visualize)
converting → success (conversion completes)
converting → error (conversion fails)
success → converting (user modifies input and re-visualizes)
error → converting (user modifies input and re-visualizes)
```

---

### 4. VisualizerUIState

Local UI state for the Plan Visualizer page.

```typescript
interface VisualizerUIState {
  /** Current input text */
  inputText: string;
  
  /** Conversion state machine */
  conversion: ConversionState;
  
  /** Whether input panel is collapsed (mobile) */
  isInputCollapsed: boolean;
}
```

---

## State Management Strategy

Following Constitution Principle III (State Colocation):

| State | Location | Rationale |
|-------|----------|-----------|
| `inputText` | `useState` in PlanInput | UI state, local to input component |
| `conversion` | `useState` in PlanVisualizerPage | Shared between input and canvas |
| `isInputCollapsed` | `useState` in PlanVisualizerPage | Layout UI state |
| Canvas zoom/pan | Internal to Excalidraw | Managed by library |
| Theme | Global Zustand store | Shared across app |

**No new global state needed**. All visualizer state is local to the feature.

---

## Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    PlanVisualizerPage                           │
│                                                                 │
│  ┌──────────────┐     ┌────────────────┐     ┌──────────────┐  │
│  │  PlanInput   │────▶│ usePlanConvert │────▶│ Excalidraw   │  │
│  │              │     │     Hook       │     │   Canvas     │  │
│  │ inputText    │     │                │     │              │  │
│  │ onVisualize  │     │ convert()      │     │ elements     │  │
│  └──────────────┘     └────────────────┘     └──────────────┘  │
│         │                     │                     ▲          │
│         │                     ▼                     │          │
│         │              ┌────────────┐               │          │
│         └──────────────│ Conversion │───────────────┘          │
│                        │   State    │                          │
│                        └────────────┘                          │
└─────────────────────────────────────────────────────────────────┘
```

1. User enters text in PlanInput
2. User clicks "Visualize" button
3. PlanVisualizerPage calls `usePlanConverter.convert(text)`
4. Hook calls `plan-viz.convertPlanToExcalidraw(text)`
5. On success: elements stored in ConversionState, passed to ExcalidrawCanvas
6. On error: error message shown, previous elements preserved

---

## Types Export

All types are exported from `src/features/plan-visualizer/types/index.ts`:

```typescript
// src/features/plan-visualizer/types/index.ts

export type ConversionStatus = 'idle' | 'converting' | 'success' | 'error';

export interface ConversionState {
  status: ConversionStatus;
  errorMessage: string | null;
  elements: ExcalidrawElement[] | null;
  previousElements: ExcalidrawElement[] | null;
}

export interface VisualizerUIState {
  inputText: string;
  conversion: ConversionState;
  isInputCollapsed: boolean;
}
```

---

## API Contracts

This feature has **no backend APIs**. All operations are client-side:

| Operation | Implementation |
|-----------|----------------|
| Convert plan | `plan-viz.convertPlanToExcalidraw(text)` |
| Render diagram | `<Excalidraw initialData={{ elements }} />` |
| Theme sync | `useStore(state => state.theme)` |

No `/contracts/` folder needed for this feature.

