# Data Model: UI Improvements and Header Redesign

**Feature**: 005-ui-improvements  
**Date**: 2025-01-27

## Overview

This feature involves UI state management and user preferences. No new persistent data entities are introduced, but existing state structures are extended.

## Entities

### PanelSizePreference

**Purpose**: Stores user's preferred division of space between input and output panels.

**Storage**: Browser localStorage (key: `plan-visualizer-panel-input-height`)

**Attributes**:
- `inputHeightRatio` (number): Ratio of input panel height to total container height (0.0 to 1.0)
- `timestamp` (number, optional): When preference was last updated (for future analytics)

**Validation Rules**:
- Must be between 0.2 and 0.8 (20% to 80% of container)
- Default: 0.4 (40% input, 60% output)
- Stored as string in localStorage, parsed to float on read

**State Transitions**:
- **Initial**: Load from localStorage or use default (0.4)
- **Updated**: When user drags panel divider, update ratio and persist to localStorage
- **Reset**: If invalid value in localStorage, reset to default

**Example**:
```typescript
// Stored in localStorage
localStorage.setItem('plan-visualizer-panel-input-height', '0.45')

// Retrieved and used
const ratio = parseFloat(localStorage.getItem('plan-visualizer-panel-input-height') || '0.4')
```

---

### SamplePlan

**Purpose**: Pre-configured execution plans for demonstration.

**Storage**: In-memory constants (TypeScript)

**Attributes**:
- `id` (string): Identifier ("sample-1" or "sample-2")
- `text` (string): Full execution plan text
- `description` (string, optional): Human-readable description

**Validation Rules**:
- Must be valid DataFusion Physical Execution Plan format
- Text must be non-empty
- IDs must be unique

**Instances**:
- **Sample 1**: Existing sample plan (simple projection/filter/scan)
- **Sample 2**: New sample plan (join with multiple file groups)

**Example**:
```typescript
export const SAMPLE_PLAN_1 = `ProjectionExec: expr=[id@0 as id, name@1 as name]
  FilterExec: amount@2 > 100
    DataSourceExec: file_groups={1 group: [[orders.parquet]]}`

export const SAMPLE_PLAN_2 = `ProjectionExec: expr=[f_dkey@1 as f_dkey, ...]
  CoalesceBatchesExec: target_batch_size=8192
    HashJoinExec: mode=CollectLeft, join_type=Inner, ...
      DataSourceExec: file_groups={2 groups: [[d1.parquet], [d2.parquet]]}
      DataSourceExec: file_groups={3 groups: [[f1.parquet], [f2.parquet], [f3.parquet]]}`
```

---

### HeaderInfoLink

**Purpose**: Information links displayed in the header.

**Storage**: In-memory configuration (TypeScript)

**Attributes**:
- `label` (string): Display text
- `url` (string): Link destination
- `type` (string): "library" | "github" | "info"
- `openInNewTab` (boolean): Whether to open in new tab

**Instances**:
- Library link: "Built using plan-viz" → https://www.npmjs.com/package/plan-viz
- GitHub link: "Report bugs" → https://github.com/NGA-TRAN/plan-visualize
- Offline info: "Works offline" → (no link, informational text)

**Example**:
```typescript
const headerInfoLinks: HeaderInfoLink[] = [
  {
    label: 'Built using plan-viz',
    url: 'https://www.npmjs.com/package/plan-viz',
    type: 'library',
    openInNewTab: true,
  },
  {
    label: 'Report bugs',
    url: 'https://github.com/NGA-TRAN/plan-visualize',
    type: 'github',
    openInNewTab: true,
  },
  {
    label: 'Works offline - This app runs without internet using service workers and local storage.',
    url: '',
    type: 'info',
    openInNewTab: false,
  },
]
```

---

## State Management

### App Store Extensions

**Current Store**: `src/store/index.ts` (Zustand)

**New State** (if needed):
- Panel size preference can be stored in Zustand store OR managed locally in component
- **Decision**: Manage locally in `useResizablePanels` hook, persist to localStorage directly
- **Rationale**: Panel preference is UI-only state, doesn't need global access, simpler implementation

**Existing State Used**:
- `theme`: For header theming (already exists)
- `sidebarCollapsed`: For sidebar icon display (already exists)

---

## Relationships

- **PanelSizePreference** ↔ **PlanVisualizerPage**: One preference per user, applied to page layout
- **SamplePlan** ↔ **PlanInput**: Multiple sample plans available, one loaded at a time
- **HeaderInfoLink** ↔ **RootLayout Header**: Multiple links displayed in header

---

## Data Flow

1. **Panel Resizing**:
   ```
   User drags divider → handleDrag updates state → 
   localStorage.setItem() → Component re-renders with new height
   ```

2. **Sample Plan Loading**:
   ```
   User clicks "Load Sample N" → onClick handler → 
   setInputText(SAMPLE_PLAN_N) → PlanInput displays plan text
   ```

3. **Header Info Display**:
   ```
   RootLayout renders → Reads headerInfoLinks config → 
   Renders links with proper styling and behavior
   ```

---

## Validation & Constraints

- **Panel Height Ratio**: Clamped between 0.2 and 0.8 (enforced in `useResizablePanels` hook)
- **Sample Plan Text**: Must be valid when passed to `convertPlanToExcalidraw()` (existing validation applies)
- **Header Links**: URLs must be valid (checked at render time, invalid URLs don't render as links)

---

## Migration Notes

- **Panel Preferences**: New feature, no migration needed
- **Sample Plans**: Adding Sample 2, no migration needed (backward compatible)
- **Header**: Removing theme toggle, no migration needed (preference stored separately)

---

## Future Considerations

- **Panel Preferences**: Could extend to store multiple layout presets
- **Sample Plans**: Could be loaded from a configuration file or API in future
- **Header Links**: Could be made configurable via settings page

