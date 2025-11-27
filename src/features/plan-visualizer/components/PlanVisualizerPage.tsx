// PlanVisualizerPage Component
// Main page orchestrating plan input, conversion, and visualization

import { useState, useCallback } from 'react'
import { Card } from '@/shared/components'
import { useAppStore } from '@/store'
import { useNotifications } from '@/features/notifications/hooks/useNotifications'
import { PlanInput } from './PlanInput'
import { ExcalidrawCanvas } from './ExcalidrawCanvas'
import { usePlanConverter, shouldShowPerformanceWarning } from '../hooks/usePlanConverter'
import { SAMPLE_PLAN } from '../types'

export function PlanVisualizerPage() {
  // State
  const [inputText, setInputText] = useState('')
  const theme = useAppStore((state) => state.theme.resolved)
  const { notify } = useNotifications()
  
  // Conversion hook
  const { state, convert, displayScene } = usePlanConverter()
  
  // Handle visualization
  const handleVisualize = useCallback(() => {
    // T010: Empty input validation
    if (!inputText.trim()) {
      notify.warning('Please enter an execution plan to visualize.')
      return
    }
    
    // T009: Wire up conversion
    const result = convert(inputText)
    
    if (result.success) {
      // Check for performance warning
      if (result.nodeCount && shouldShowPerformanceWarning(result.nodeCount)) {
        notify.warning(
          `This plan has ${result.nodeCount} nodes. Performance may be affected for very large plans.`
        )
      } else {
        notify.success('Plan visualized successfully!')
      }
    } else {
      // Error is already stored in state, also show toast
      notify.error(result.error || 'Failed to convert plan')
    }
  }, [inputText, convert, notify])

  // Handle loading sample plan
  const handleLoadSample = useCallback(() => {
    setInputText(SAMPLE_PLAN)
    notify.info('Sample plan loaded. Click Visualize to see the diagram.')
  }, [notify])

  // T011: Loading state is tracked via state.status === 'converting'
  const isLoading = state.status === 'converting'

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Plan Visualizer
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Visualize DataFusion Physical Execution Plans as interactive diagrams
        </p>
      </div>

      {/* Main Content - Vertical Layout */}
      <div className="flex flex-col gap-6">
        {/* Input Panel (Top) */}
        <Card className="p-4">
          <PlanInput
            value={inputText}
            onChange={setInputText}
            onVisualize={handleVisualize}
            isLoading={isLoading}
            error={state.status === 'error' ? state.errorMessage : null}
            onLoadSample={handleLoadSample}
          />
        </Card>

        {/* Visualization Panel (Bottom) */}
        <div className="h-[600px] min-h-[500px]">
          <ExcalidrawCanvas
            scene={displayScene}
            theme={theme}
          />
        </div>
      </div>

      {/* Help Text */}
      <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
        <p>
          <strong>Tip:</strong> Paste your DataFusion EXPLAIN output directly into the input area.
        </p>
        <p>
          The visualizer supports Physical Execution Plans from Apache DataFusion.
        </p>
      </div>
    </div>
  )
}

