# Quickstart: UI Improvements and Header Redesign

**Feature**: 005-ui-improvements  
**Date**: 2025-01-27

## Overview

This guide helps developers quickly implement UI improvements including:
1. Header redesign with app branding
2. Second sample plan option
3. Centered plan visualization
4. Resizable input/output panels

## Implementation Order

### Step 1: Add Sample Plan 2 Constant

**File**: `src/features/plan-visualizer/types/index.ts`

Add the new sample plan constant:

```typescript
export const SAMPLE_PLAN_2 = `ProjectionExec: expr=[f_dkey@1 as f_dkey, timestamp@2 as timestamp, value@3 as value, service@0 as service]
  CoalesceBatchesExec: target_batch_size=8192
    HashJoinExec: mode=CollectLeft, join_type=Inner, on=[(d_dkey@0, f_dkey@0)], projection=[service@1, f_dkey@2, timestamp@3, value@4]
      CoalescePartitionsExec
        DataSourceExec: file_groups={2 groups: [[d1.parquet], [d2.parquet]]}, projection=[d_dkey, service], file_type=parquet
      DataSourceExec: file_groups={3 groups: [[f1.parquet], [f2.parquet], [f3.parquet]]}, projection=[f_dkey, timestamp, value], output_ordering=[f_dkey@0 ASC NULLS LAST, timestamp@1 ASC NULLS LAST], file_type=parquet, predicate=DynamicFilter [ empty ]`
```

---

### Step 2: Update PlanInput Component

**File**: `src/features/plan-visualizer/components/PlanInput.tsx`

Modify the sample loading section to support two buttons:

```typescript
// Update props interface
export interface PlanInputProps {
  // ... existing props
  onLoadSample1?: () => void
  onLoadSample2?: () => void
}

// In component JSX, replace single "Load Sample" button:
<div className="flex items-center gap-2">
  <button
    type="button"
    onClick={onLoadSample1}
    className="text-xs text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 flex items-center gap-1"
  >
    <FileText className="w-3 h-3" />
    Load Sample 1
  </button>
  <button
    type="button"
    onClick={onLoadSample2}
    className="text-xs text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 flex items-center gap-1"
  >
    <FileText className="w-3 h-3" />
    Load Sample 2
  </button>
</div>
```

---

### Step 3: Update PlanVisualizerPage Component

**File**: `src/features/plan-visualizer/components/PlanVisualizerPage.tsx`

Add handlers for both sample plans:

```typescript
import { SAMPLE_PLAN, SAMPLE_PLAN_2 } from '../types'

// Add handlers
const handleLoadSample1 = useCallback(() => {
  setInputText(SAMPLE_PLAN)
  notify.info('Sample plan 1 loaded. Click Visualize to see the diagram.')
}, [notify])

const handleLoadSample2 = useCallback(() => {
  setInputText(SAMPLE_PLAN_2)
  notify.info('Sample plan 2 loaded. Click Visualize to see the diagram.')
}, [notify])

// Update PlanInput props
<PlanInput
  // ... existing props
  onLoadSample1={handleLoadSample1}
  onLoadSample2={handleLoadSample2}
/>
```

---

### Step 4: Create Resizable Panels Hook

**File**: `src/features/plan-visualizer/hooks/useResizablePanels.ts` (NEW)

```typescript
import { useState, useCallback, useRef, useEffect } from 'react'

const DEFAULT_INPUT_HEIGHT = 0.4 // 40%
const MIN_INPUT_HEIGHT = 0.2 // 20%
const MAX_INPUT_HEIGHT = 0.8 // 80%
const STORAGE_KEY = 'plan-visualizer-panel-input-height'

export function useResizablePanels() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [inputHeight, setInputHeight] = useState(() => {
    if (typeof window === 'undefined') return DEFAULT_INPUT_HEIGHT
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? parseFloat(saved) : DEFAULT_INPUT_HEIGHT
  })
  const [isDragging, setIsDragging] = useState(false)

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  useEffect(() => {
    if (!isDragging) return

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return
      
      const containerRect = containerRef.current.getBoundingClientRect()
      const containerHeight = containerRect.height
      const mouseY = e.clientY - containerRect.top
      
      let newHeight = mouseY / containerHeight
      newHeight = Math.max(MIN_INPUT_HEIGHT, Math.min(MAX_INPUT_HEIGHT, newHeight))
      
      setInputHeight(newHeight)
      localStorage.setItem(STORAGE_KEY, String(newHeight))
    }

    const handleMouseUp = () => {
      setIsDragging(false)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging])

  return {
    containerRef,
    inputHeight,
    isDragging,
    handleMouseDown,
  }
}
```

---

### Step 5: Update PlanVisualizerPage with Resizable Panels

**File**: `src/features/plan-visualizer/components/PlanVisualizerPage.tsx`

Integrate the resizable panels hook:

```typescript
import { useResizablePanels } from '../hooks/useResizablePanels'

export function PlanVisualizerPage() {
  // ... existing state
  const { containerRef, inputHeight, isDragging, handleMouseDown } = useResizablePanels()

  return (
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-0">
      {/* ... page header ... */}

      {/* Main Content - Resizable Layout */}
      <div ref={containerRef} className="flex flex-col gap-0 h-[calc(100vh-200px)]">
        {/* Input Panel */}
        <div 
          style={{ 
            height: `${inputHeight * 100}%`,
            minHeight: '150px',
            maxHeight: '80%',
          }}
          className="flex-shrink-0"
        >
          <Card className="p-3 sm:p-4 h-full">
            <PlanInput
              value={inputText}
              onChange={setInputText}
              onVisualize={handleVisualize}
              isLoading={isLoading}
              error={state.status === 'error' ? state.errorMessage : null}
              onLoadSample1={handleLoadSample1}
              onLoadSample2={handleLoadSample2}
            />
          </Card>
        </div>

        {/* Resizer Handle */}
        <div
          className={cn(
            'h-1 bg-gray-200 dark:bg-gray-700 cursor-row-resize hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors',
            isDragging && 'bg-primary-500'
          )}
          onMouseDown={handleMouseDown}
          aria-label="Resize panels"
        />

        {/* Visualization Panel */}
        <div 
          style={{ 
            flex: 1,
            minHeight: '200px',
          }}
          className="flex-shrink-0"
        >
          <ExcalidrawCanvas
            scene={displayScene}
            theme={theme}
          />
        </div>
      </div>

      {/* ... help text ... */}
    </div>
  )
}
```

---

### Step 6: Center Excalidraw Visualization

**File**: `src/features/plan-visualizer/hooks/usePlanConverter.ts`

Add centering logic to the conversion result:

```typescript
// After conversion succeeds, calculate center
if (result.success && scene?.elements) {
  const bounds = calculateElementBounds(scene.elements)
  if (bounds) {
    const centerX = bounds.minX + (bounds.maxX - bounds.minX) / 2
    const canvasWidth = 800 // Approximate, or get from container
    const scrollX = centerX - canvasWidth / 2
    
    scene.appState = {
      ...scene.appState,
      scrollX: Math.max(0, scrollX), // Don't scroll negative
    }
  }
}

// Helper function
function calculateElementBounds(elements: any[]) {
  if (!elements || elements.length === 0) return null
  
  let minX = Infinity
  let maxX = -Infinity
  
  elements.forEach(el => {
    if (el.x !== undefined) {
      minX = Math.min(minX, el.x)
      maxX = Math.max(maxX, el.x + (el.width || 0))
    }
  })
  
  return { minX, maxX }
}
```

---

### Step 7: Update Sidebar with App Icon

**File**: `src/features/navigation/components/Sidebar.tsx`

Replace "Admin" text with icon:

```typescript
{/* Header */}
<div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-800">
  {!sidebarCollapsed ? (
    <div className="flex items-center gap-2">
      <img 
        src="/icons/icon-192x192.png" 
        alt="Plan Visualizer" 
        className="h-8 w-8"
      />
    </div>
  ) : (
    <img 
      src="/icons/icon-192x192.png" 
      alt="Plan Visualizer" 
      className="h-6 w-6 mx-auto"
    />
  )}
  <Button
    variant="ghost"
    size="sm"
    onClick={toggleSidebar}
    className={cn(sidebarCollapsed && 'mx-auto')}
    aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
  >
    {/* ... existing button content ... */}
  </Button>
</div>
```

---

### Step 8: Update Header in RootLayout

**File**: `src/app/router.tsx`

Replace header content:

```typescript
{/* Top header */}
<header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
  {/* Left: App Name */}
  <div className="flex items-center gap-2">
    <h1 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100">
      DataFusion Plan Visualizer
    </h1>
  </div>
  
  {/* Right: Info Links */}
  <div className="flex flex-col sm:flex-row items-end sm:items-center gap-1 sm:gap-3 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
    <span>
      Built using{' '}
      <a 
        href="https://www.npmjs.com/package/plan-viz" 
        target="_blank" 
        rel="noopener noreferrer"
        className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 underline"
      >
        plan-viz
      </a>
    </span>
    <span className="hidden sm:inline">•</span>
    <a 
      href="https://github.com/NGA-TRAN/plan-visualize" 
      target="_blank" 
      rel="noopener noreferrer"
      className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 underline"
    >
      Report bugs
    </a>
    <span className="hidden sm:inline">•</span>
    <span className="text-xs">
      Works offline - This app runs without internet using service workers and local storage.
    </span>
  </div>
</header>
```

**Note**: Remove `<ThemeToggle />` from header (line 35 in current router.tsx).

---

## Testing Checklist

- [ ] App icon displays in sidebar (both collapsed and expanded states)
- [ ] Header shows app name and info links
- [ ] Theme toggle removed from header
- [ ] "Load Sample 1" and "Load Sample 2" buttons work
- [ ] Sample 2 plan visualizes correctly
- [ ] Plan visualization is centered horizontally
- [ ] Panels can be resized by dragging divider
- [ ] Panel size preference persists after page refresh
- [ ] Minimum panel sizes are enforced
- [ ] Header is responsive on mobile (320px) and desktop (1920px)
- [ ] All header links open in new tabs
- [ ] Offline capability description displays correctly

---

## Common Issues & Solutions

**Issue**: Panel resizing doesn't work on mobile
- **Solution**: Add touch event handlers or disable resizing on mobile (< 768px)

**Issue**: Visualization not centered
- **Solution**: Ensure `calculateElementBounds` handles all element types, check `scrollX` is set correctly

**Issue**: Panel preference not persisting
- **Solution**: Check localStorage key matches, verify value is valid number

**Issue**: Header links break layout on small screens
- **Solution**: Adjust flex-wrap and gap values, consider hiding less critical info on mobile

---

## Next Steps

After implementation:
1. Test all user stories from spec.md
2. Verify accessibility (keyboard navigation, screen readers)
3. Check performance (panel resizing should be smooth)
4. Validate responsive design across breakpoints

