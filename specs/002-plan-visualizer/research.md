# Research: Plan Visualizer

**Feature**: 002-plan-visualizer  
**Date**: 2025-11-26  
**Status**: Complete

## Research Tasks

### 1. Excalidraw React Integration

**Question**: How to integrate @excalidraw/excalidraw as a React component with programmatic control?

**Decision**: Use the `Excalidraw` component with `initialData` prop for initial elements, and `updateScene` API ref for updates.

**Rationale**: 
- The official Excalidraw React package provides a straightforward component API
- `initialData` accepts `{ elements, appState }` for setting initial diagram content
- The component exposes a ref with `updateScene()` for dynamic updates
- Theme can be controlled via `theme` prop ("light" | "dark")

**Implementation Pattern**:
```tsx
import { Excalidraw } from "@excalidraw/excalidraw";

function ExcalidrawCanvas({ elements, theme }) {
  return (
    <div style={{ height: "500px", width: "100%" }}>
      <Excalidraw
        initialData={{ elements }}
        theme={theme}
        viewModeEnabled={false}
      />
    </div>
  );
}
```

**Alternatives Considered**:
- **Direct canvas manipulation**: Rejected - Excalidraw handles all canvas logic internally
- **Exporting to SVG/PNG and displaying**: Rejected - loses interactivity (zoom, pan, select)

---

### 2. plan-viz Library Integration

**Question**: How does the plan-viz library's `convertPlanToExcalidraw()` function work?

**Decision**: Import and call `convertPlanToExcalidraw(planText: string)` which returns Excalidraw-compatible JSON.

**Rationale**:
- The function is the primary API of the plan-viz package
- Takes a raw DataFusion Physical Execution Plan string as input
- Returns an object containing Excalidraw elements (shapes, connectors, text)
- Throws an error if the plan text is invalid or malformed

**Implementation Pattern**:
```tsx
import { convertPlanToExcalidraw } from 'plan-viz';

function usePlanConverter() {
  const convert = useCallback((planText: string) => {
    try {
      const result = convertPlanToExcalidraw(planText);
      return { elements: result.elements, error: null };
    } catch (e) {
      return { elements: null, error: e.message };
    }
  }, []);
  
  return { convert };
}
```

**Alternatives Considered**:
- **Custom parser**: Rejected - plan-viz already handles the complex parsing logic
- **Server-side conversion**: Rejected - adds latency and infrastructure; client-side is sufficient

---

### 3. Error Handling Strategy

**Question**: How to handle conversion failures gracefully?

**Decision**: Use try-catch in the conversion hook, display errors via toast notifications, preserve last valid visualization.

**Rationale**:
- Users should see clear error messages when input is invalid
- The previous visualization should remain visible for reference
- Error messages should be actionable (indicate what went wrong)

**Implementation Pattern**:
```tsx
const handleVisualize = async () => {
  const { elements, error } = convert(inputText);
  
  if (error) {
    notify.error(`Invalid plan: ${error}`);
    // Don't clear previous visualization
    return;
  }
  
  setElements(elements);
};
```

**Alternatives Considered**:
- **Inline error display**: Also implemented - error banner in the input area
- **Clear canvas on error**: Rejected - confusing UX, loses previous reference

---

### 4. Theme Synchronization

**Question**: How to sync Excalidraw theme with the app's light/dark mode?

**Decision**: Pass the current theme from the app's theme store to Excalidraw's `theme` prop.

**Rationale**:
- Excalidraw natively supports "light" and "dark" themes
- The app already has a theme store with the current theme value
- Simple prop passing achieves consistent theming

**Implementation Pattern**:
```tsx
function ExcalidrawCanvas({ elements }) {
  const theme = useStore((state) => state.theme);
  
  return (
    <Excalidraw
      initialData={{ elements }}
      theme={theme}
    />
  );
}
```

**Alternatives Considered**:
- **CSS variable overrides**: Rejected - Excalidraw's theme prop is cleaner
- **Separate theme toggle for canvas**: Rejected - inconsistent UX

---

### 5. Responsive Layout

**Question**: How to make the visualizer responsive across screen sizes?

**Decision**: Use a vertically stacked layout on mobile, side-by-side on desktop, with flexible canvas sizing.

**Rationale**:
- Mobile users need adequate space for both input and visualization
- Excalidraw canvas should fill available width
- Tailwind's responsive utilities handle breakpoints

**Implementation Pattern**:
```tsx
<div className="flex flex-col lg:flex-row gap-4 h-full">
  <div className="w-full lg:w-1/3">
    <PlanInput ... />
  </div>
  <div className="flex-1 min-h-[400px] lg:min-h-0">
    <ExcalidrawCanvas ... />
  </div>
</div>
```

**Alternatives Considered**:
- **Fixed canvas size**: Rejected - poor UX on different screens
- **Resizable panels**: Deferred - adds complexity, can be added later

---

### 6. Performance Considerations

**Question**: How to handle large execution plans (100+ nodes)?

**Decision**: Render synchronously for plans up to ~100 nodes; add loading indicator for conversion phase.

**Rationale**:
- Most execution plans are <50 nodes
- Excalidraw handles rendering efficiently up to hundreds of elements
- Conversion is CPU-bound but typically fast (<500ms for 100 nodes)
- A brief loading state prevents UI freeze perception

**Implementation Pattern**:
```tsx
const [isConverting, setIsConverting] = useState(false);

const handleVisualize = async () => {
  setIsConverting(true);
  
  // Allow UI to update before blocking conversion
  await new Promise(r => setTimeout(r, 0));
  
  const { elements, error } = convert(inputText);
  setIsConverting(false);
  
  if (!error) setElements(elements);
};
```

**Alternatives Considered**:
- **Web Worker for conversion**: Deferred - overkill for typical use case
- **Virtualized rendering**: Not needed - Excalidraw handles large canvases well

---

## Dependencies Confirmed

| Package | Version | Purpose |
|---------|---------|---------|
| `@excalidraw/excalidraw` | ^0.17.x | Interactive diagram rendering |
| `plan-viz` | latest | DataFusion plan → Excalidraw conversion |

## Outstanding Questions

None. All technical decisions are resolved.

