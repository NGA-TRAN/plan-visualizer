# Contracts: UI Improvements and Header Redesign

**Feature**: 005-ui-improvements  
**Date**: 2025-01-27

## Overview

This feature is frontend-only and does not introduce any new API endpoints or external service contracts. All changes are within the React application's component layer.

## Component Contracts

### Header Component Interface

**Component**: `RootLayout` header section  
**Location**: `src/app/router.tsx`

**Props**: None (uses internal state and configuration)

**Expected Behavior**:
- Displays app name on left side
- Displays info links on right side
- Responsive layout (stacks on mobile, horizontal on desktop)
- All external links open in new tabs

---

### Resizable Panels Hook Interface

**Hook**: `useResizablePanels`  
**Location**: `src/features/plan-visualizer/hooks/useResizablePanels.ts`

**Returns**:
```typescript
{
  containerRef: RefObject<HTMLDivElement>
  inputHeight: number // 0.0 to 1.0
  isDragging: boolean
  handleMouseDown: (e: React.MouseEvent) => void
}
```

**Side Effects**:
- Reads from localStorage on mount
- Writes to localStorage on resize

---

### PlanInput Component Interface

**Component**: `PlanInput`  
**Location**: `src/features/plan-visualizer/components/PlanInput.tsx`

**Updated Props**:
```typescript
interface PlanInputProps {
  // ... existing props
  onLoadSample1?: () => void
  onLoadSample2?: () => void
}
```

**Behavior**:
- Renders two "Load Sample" buttons when both handlers provided
- Calls respective handler when button clicked

---

## Data Contracts

### localStorage Keys

- `plan-visualizer-panel-input-height`: Stores panel height ratio (string, parse to float)

### Sample Plan Constants

- `SAMPLE_PLAN`: Existing sample plan (unchanged)
- `SAMPLE_PLAN_2`: New sample plan with join operation

---

## No External API Contracts

This feature does not interact with any external APIs or services. All functionality is self-contained within the browser application.

