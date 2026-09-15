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
import { SAMPLE_PLANS, getSamplePlan } from '../data/samples'
import { savePlanToStorage } from '@/features/offline/services/storageManager'
import { cn } from '@/shared/utils/cn'

export function PlanVisualizerPage() {
  // State
  const [inputText, setInputText] = useState('')
  const [selectedSampleId, setSelectedSampleId] = useState<string | null>(null)
  // Subscribe to theme changes from store - this ensures Excalidraw updates when theme toggle is clicked
  // The theme prop is passed to ExcalidrawCanvas which passes it to Excalidraw component
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

  const handleInputChange = useCallback((value: string) => {
    setInputText(value)
    setSelectedSampleId(null)
  }, [])

  const handleSelectSample = useCallback((id: string) => {
    const sample = getSamplePlan(id)
    if (!sample) return
    setSelectedSampleId(id)
    setInputText(sample.plan)
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
              onChange={handleInputChange}
              onVisualize={handleVisualize}
              error={state.status === 'error' ? state.errorMessage : null}
              samples={SAMPLE_PLANS}
              selectedSampleId={selectedSampleId}
              onSelectSample={handleSelectSample}
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

