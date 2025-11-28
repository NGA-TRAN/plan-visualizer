# Research: UI Improvements and Header Redesign

**Feature**: 005-ui-improvements  
**Date**: 2025-01-27  
**Purpose**: Resolve technical decisions for header redesign, sample plans, visualization centering, and resizable panels

---

## 1. App Icon Display in Sidebar

**Question**: How to replace "Admin" text with app icon in sidebar header?

**Decision**: Use `<img>` tag with icon from `public/icons/` directory, maintaining responsive behavior for collapsed/expanded states.

**Rationale**:
- Icon files already exist in `public/icons/` (icon-192x192.png, icon-512x512.png)
- Simple implementation using standard HTML img element
- Icon remains visible when sidebar is collapsed (icon-only mode)
- Consistent with PWA icon usage

**Implementation Pattern**:
```tsx
// In Sidebar.tsx header section
{!sidebarCollapsed ? (
  <img 
    src="/icons/icon-192x192.png" 
    alt="Plan Visualizer" 
    className="h-8 w-8"
  />
) : (
  <img 
    src="/icons/icon-192x192.png" 
    alt="Plan Visualizer" 
    className="h-6 w-6 mx-auto"
  />
)}
```

**Alternatives Considered**:
- **SVG icon component**: Rejected - adds complexity, PNG icons already available
- **CSS background-image**: Rejected - less semantic, harder to maintain alt text

---

## 2. Header Layout and Responsive Design

**Question**: How to layout header with app name on left and info links on right, responsive across screen sizes?

**Decision**: Use flexbox layout with responsive text sizing and wrapping. Stack info links vertically on small screens, horizontally on larger screens.

**Rationale**:
- Tailwind's responsive utilities handle breakpoints elegantly
- Flexbox provides natural alignment and spacing
- Text wrapping ensures readability on all screen sizes
- Links can be grouped logically (library info, GitHub, offline capability)

**Implementation Pattern**:
```tsx
<header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 bg-white dark:bg-gray-900 border-b">
  {/* Left: App Name */}
  <div className="flex items-center gap-2">
    <h1 className="text-lg sm:text-xl font-semibold">DataFusion Plan Visualizer</h1>
  </div>
  
  {/* Right: Info Links */}
  <div className="flex flex-col sm:flex-row items-end sm:items-center gap-1 sm:gap-3 text-xs sm:text-sm">
    <span>Built with <a href="..." className="link">plan-viz</a></span>
    <span>•</span>
    <a href="..." className="link">Report bugs</a>
    <span>•</span>
    <span>Works offline</span>
  </div>
</header>
```

**Alternatives Considered**:
- **Single line layout**: Rejected - too cramped on mobile devices
- **Dropdown menu for info**: Rejected - adds unnecessary complexity, reduces discoverability

---

## 3. Panel Resizing Implementation

**Question**: How to implement resizable panels for input/output areas?

**Decision**: Use React state with mouse/touch event handlers. Store panel height ratio in localStorage. Use CSS `height` or `flex-basis` for sizing.

**Rationale**:
- No external library needed (reduces bundle size)
- Standard drag pattern familiar to users
- localStorage persistence aligns with existing preference storage pattern
- Minimum sizes prevent unusable panels

**Implementation Pattern**:
```tsx
// Hook: useResizablePanels.ts
function useResizablePanels() {
  const [inputHeight, setInputHeight] = useState(() => {
    const saved = localStorage.getItem('panel-input-height')
    return saved ? parseFloat(saved) : 0.4 // 40% default
  })
  
  const handleDrag = useCallback((e: MouseEvent) => {
    const containerHeight = containerRef.current?.clientHeight || 0
    const newHeight = e.clientY / containerHeight
    const clamped = Math.max(0.2, Math.min(0.8, newHeight)) // 20-80% range
    setInputHeight(clamped)
    localStorage.setItem('panel-input-height', String(clamped))
  }, [])
  
  return { inputHeight, handleDrag }
}

// Component usage
<div className="flex flex-col h-full">
  <div style={{ height: `${inputHeight * 100}%`, minHeight: '150px' }}>
    <PlanInput ... />
  </div>
  <div className="h-1 bg-gray-200 cursor-row-resize" onMouseDown={startDrag} />
  <div style={{ flex: 1, minHeight: '200px' }}>
    <ExcalidrawCanvas ... />
  </div>
</div>
```

**Alternatives Considered**:
- **react-resizable-panels library**: Considered but rejected - adds dependency, simple use case doesn't justify it
- **CSS Grid with grid-template-rows**: Considered but rejected - harder to persist user preference, less flexible

---

## 4. Excalidraw Visualization Centering

**Question**: How to center the plan visualization horizontally in the Excalidraw canvas?

**Decision**: Use Excalidraw's `appState` to set initial scroll position. Calculate center based on element bounds and set `scrollX` accordingly.

**Rationale**:
- Excalidraw provides `appState.scrollX` and `scrollY` for viewport control
- Can calculate center from element bounding box
- Works for both small and large plans
- Maintains user's ability to pan after initial centering

**Implementation Pattern**:
```tsx
// In ExcalidrawCanvas.tsx or usePlanConverter hook
useEffect(() => {
  if (scene?.elements && scene.elements.length > 0) {
    // Calculate bounding box of all elements
    const bounds = calculateBounds(scene.elements)
    const centerX = bounds.minX + (bounds.maxX - bounds.minX) / 2
    const canvasWidth = 800 // or get from container
    
    // Center horizontally
    const scrollX = centerX - canvasWidth / 2
    
    const centeredScene = {
      ...scene,
      appState: {
        ...scene.appState,
        scrollX,
      }
    }
    // Update scene
  }
}, [scene])
```

**Alternatives Considered**:
- **CSS centering**: Rejected - Excalidraw manages its own viewport, CSS won't affect internal scroll
- **Manual pan after render**: Considered but rejected - causes visual jump, better to set initial state

---

## 5. Sample Plan 2 Content

**Question**: What is the exact content for Sample Plan 2?

**Decision**: Extract the physical plan from the EXPLAIN output provided in requirements. Use the `physical_plan` section, which contains the join operation with multiple file groups.

**Rationale**:
- Requirements specify the exact EXPLAIN output
- Physical plan is what the visualizer processes
- Contains join operation demonstrating more complex visualization
- Multiple file groups show distributed data source handling

**Implementation Pattern**:
```tsx
// In plan-visualizer/types/index.ts
export const SAMPLE_PLAN_2 = `ProjectionExec: expr=[f_dkey@1 as f_dkey, timestamp@2 as timestamp, value@3 as value, service@0 as service]
  CoalesceBatchesExec: target_batch_size=8192
    HashJoinExec: mode=CollectLeft, join_type=Inner, on=[(d_dkey@0, f_dkey@0)], projection=[service@1, f_dkey@2, timestamp@3, value@4]
      CoalescePartitionsExec
        DataSourceExec: file_groups={2 groups: [[d1.parquet], [d2.parquet]]}, projection=[d_dkey, service], file_type=parquet
      DataSourceExec: file_groups={3 groups: [[f1.parquet], [f2.parquet], [f3.parquet]]}, projection=[f_dkey, timestamp, value], output_ordering=[f_dkey@0 ASC NULLS LAST, timestamp@1 ASC NULLS LAST], file_type=parquet, predicate=DynamicFilter [ empty ]`
```

**Alternatives Considered**:
- **Include full EXPLAIN output**: Rejected - visualizer processes physical plan only, extra text unnecessary
- **Simplified version**: Rejected - loses complexity that demonstrates join visualization

---

## 6. Offline Capability Description

**Question**: What concise description explains offline capability to users?

**Decision**: "Works offline - This app runs without internet using service workers and local storage."

**Rationale**:
- Concise (under 15 words)
- Explains the "how" briefly (service workers + local storage)
- User-friendly language
- Fits in header without overwhelming

**Alternatives Considered**:
- **"PWA - Works offline"**: Rejected - "PWA" is technical jargon
- **"Offline-capable"**: Rejected - doesn't explain how it works
- **Longer explanation**: Rejected - too verbose for header

---

## 7. Application Name Recommendation

**Question**: What should the application be named, considering future expansion?

**Decision**: "DataFusion Plan Visualizer" is acceptable, but recommend "DataFusion Studio" for future expansion.

**Rationale**:
- Current name is descriptive and accurate
- "Studio" suggests a suite of tools (tables, queries, visualizations)
- Shorter, more memorable
- Aligns with future features (table definition, query execution)

**Recommendation**: Start with "DataFusion Plan Visualizer" for clarity, consider rebranding to "DataFusion Studio" when additional features are added.

**Alternatives Considered**:
- **"Plan Visualizer"**: Rejected - loses DataFusion context
- **"DataFusion Explorer"**: Considered but "Studio" better suggests authoring capabilities

---

## Summary of Technical Decisions

1. **App Icon**: Use `<img>` with existing PNG icons from `public/icons/`
2. **Header Layout**: Flexbox with responsive stacking, text wrapping
3. **Panel Resizing**: Custom React hook with mouse events, localStorage persistence
4. **Visualization Centering**: Use Excalidraw `appState.scrollX` to center on element bounds
5. **Sample Plan 2**: Extract physical plan from provided EXPLAIN output
6. **Offline Description**: "Works offline - This app runs without internet using service workers and local storage."
7. **App Name**: Use "DataFusion Plan Visualizer" (consider "DataFusion Studio" for future)

All decisions align with existing codebase patterns and Constitution principles.

