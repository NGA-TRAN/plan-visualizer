# Quickstart: Plan Visualizer

**Feature**: 002-plan-visualizer  
**Date**: 2025-11-26

## Prerequisites

- Node.js 18+ installed
- Existing admin template running (from 001-admin-template)
- npm or yarn package manager

## Setup Steps

### 1. Install Dependencies

```bash
cd /Users/hoabinhnga.tran/plan-visualizer

# Install the new packages
npm install @excalidraw/excalidraw plan-viz
```

### 2. Verify Installation

```bash
# Check packages are installed
npm ls @excalidraw/excalidraw plan-viz
```

Expected output:
```
plan-visualizer@1.0.0
├── @excalidraw/excalidraw@0.17.x
└── plan-viz@x.x.x
```

### 3. Start Development Server

```bash
npm run dev
```

### 4. Access the Feature

Navigate to: `http://localhost:5173/plan-visualizer`

## Testing the Feature

### Sample DataFusion Plan

Use this sample plan to test the visualizer:

```text
ProjectionExec: expr=[id@0 as id, name@1 as name]
  FilterExec: id@0 > 100
    ParquetExec: file_groups={1 group: [[file.parquet]]}, projection=[id, name, created_at]
```

### Expected Behavior

1. Paste the sample plan into the input area
2. Click "Visualize" button
3. See an interactive diagram with:
   - Three connected nodes (ProjectionExec → FilterExec → ParquetExec)
   - Arrows showing data flow direction
   - Node labels with operation details

### Verification Checklist

- [ ] Plan Visualizer page loads at `/plan-visualizer`
- [ ] Navigation sidebar shows "Plan Visualizer" link
- [ ] Input area accepts text input
- [ ] "Visualize" button triggers conversion
- [ ] Valid plan shows interactive diagram
- [ ] Invalid plan shows error message
- [ ] Diagram supports zoom (scroll/pinch)
- [ ] Diagram supports pan (click and drag)
- [ ] Theme toggle switches diagram colors
- [ ] Responsive layout works on mobile (< 768px)

## Troubleshooting

### "Module not found: plan-viz"

```bash
# Verify plan-viz is installed
npm install plan-viz

# If using a custom registry, ensure it's configured
npm config list
```

### "Excalidraw canvas is blank"

1. Check browser console for errors
2. Ensure elements array is not empty
3. Verify the plan text is valid (try the sample above)

### "Theme not syncing"

1. Verify theme store is properly imported
2. Check that Excalidraw receives the `theme` prop
3. Toggle theme and verify console logs

### Build Errors

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Rebuild
npm run build
```

## Development Tips

### Hot Reload

Changes to components in `src/features/plan-visualizer/` will hot-reload automatically.

### Testing Conversion

```typescript
// In browser console or test file
import { convertPlanToExcalidraw } from 'plan-viz';

const result = convertPlanToExcalidraw(`
ProjectionExec: expr=[id@0]
  TableScanExec: table=users
`);

console.log(result.elements);
```

### Debugging Excalidraw

```typescript
// Add ref to get Excalidraw API
const excalidrawRef = useRef(null);

// Access scene data
console.log(excalidrawRef.current?.getSceneElements());
```

## File Structure After Implementation

```text
src/features/plan-visualizer/
├── components/
│   ├── PlanVisualizerPage.tsx    # Main page
│   ├── PlanInput.tsx             # Text input component
│   └── ExcalidrawCanvas.tsx      # Excalidraw wrapper
├── hooks/
│   └── usePlanConverter.ts       # Conversion logic
└── types/
    └── index.ts                  # TypeScript types
```

## Next Steps

After basic implementation:

1. Add sample plan presets for quick testing
2. Add "Copy to clipboard" for Excalidraw JSON export
3. Add loading skeleton for better UX
4. Consider Web Worker for large plan conversion

