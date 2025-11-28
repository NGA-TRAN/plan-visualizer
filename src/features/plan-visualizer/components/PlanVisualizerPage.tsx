// PlanVisualizerPage Component
// Main page orchestrating plan input, conversion, and visualization

import { useState, useCallback } from 'react'
import { Card } from '@/shared/components'
import { useAppStore } from '@/store'
import { useNotifications } from '@/features/notifications/hooks/useNotifications'
import { PlanInput } from './PlanInput'
import { ExcalidrawCanvas } from './ExcalidrawCanvas'
import { usePlanConverter } from '../hooks/usePlanConverter'
import { useResizablePanels } from '../hooks/useResizablePanels'
import { SAMPLE_PLAN, SAMPLE_PLAN_2 } from '../types'
import { savePlanToStorage } from '@/features/offline/services/storageManager'
import { cn } from '@/shared/utils/cn'

export function PlanVisualizerPage() {
  // State
  const [inputText, setInputText] = useState('')
  const theme = useAppStore((state) => state.theme.resolved)
  const { notify } = useNotifications()
  
  // Conversion hook
  const { state, convert, displayScene } = usePlanConverter()
  
  // Handle visualization
  const handleVisualize = useCallback(async () => {
    // T010: Empty input validation
    if (!inputText.trim()) {
      notify.warning('Please enter an execution plan to visualize.')
      return
    }
    
    // T009: Wire up conversion
    const result = convert(inputText)
    
    if (result.success) {
      // Save plan to IndexedDB for offline access
      try {
        if (displayScene) {
          await savePlanToStorage(inputText.trim(), displayScene)
        }
      } catch (error) {
        // Don't fail visualization if storage fails, just log it
        console.warn('Failed to save plan to local storage:', error)
      }
    } else {
      // Error is already stored in state, also show toast
      notify.error(result.error || 'Failed to convert plan')
    }
  }, [inputText, convert, notify, displayScene])

  // Handle loading sample plan (backward compatibility)
  const handleLoadSample = useCallback(() => {
    setInputText(SAMPLE_PLAN)
  }, [])

  // Handle loading sample plan 1
  const handleLoadSample1 = useCallback(() => {
    setInputText(SAMPLE_PLAN)
  }, [])

  // Handle loading sample plan 2
  const handleLoadSample2 = useCallback(() => {
    setInputText(SAMPLE_PLAN_2)
  }, [])

  // Resizable panels hook
  const { containerRef, inputHeight, isDragging, handleMouseDown } = useResizablePanels()

  return (
    <div className="px-2 sm:px-0">
      {/* Main Content - Resizable Layout */}
      <div ref={containerRef} className="flex flex-col gap-0 h-[calc(100vh-64px)]">
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
              error={state.status === 'error' ? state.errorMessage : null}
              onLoadSample={handleLoadSample}
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

      {/* Help Text */}
      <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
        <p>
          <strong>Tip:</strong> Paste your DataFusion EXPLAIN output (including or excluding the SQL query) directly into the input area.
        </p>
        <p>
          The visualizer supports Physical Execution Plans from Apache DataFusion.
        </p>
      </div>
    </div>
  )
}

