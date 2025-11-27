// usePlanConverter Hook
// Handles conversion of DataFusion execution plans to Excalidraw format

import { useState, useCallback } from 'react'
import { convertPlanToExcalidraw } from 'plan-viz'
import { 
  type ExcalidrawElement,
  type ConversionState, 
  type ConversionResult, 
  initialConversionState,
  NODE_WARNING_THRESHOLD 
} from '../types'

/** Return type for the usePlanConverter hook */
export interface UsePlanConverterReturn {
  /** Current conversion state */
  state: ConversionState
  
  /** Convert plan text to Excalidraw elements */
  convert: (planText: string) => ConversionResult
  
  /** Reset to initial state */
  reset: () => void
  
  /** Check if there are elements to display (current or previous) */
  hasElements: boolean
  
  /** Get elements to display (current or fallback to previous) */
  displayElements: readonly ExcalidrawElement[] | null

  /** Get scene (elements + appState) to display (current or fallback to previous) */
  displayScene: any | null
}

/**
 * Hook for converting DataFusion execution plans to Excalidraw format.
 * Handles error states and preserves previous successful visualizations.
 */
export function usePlanConverter(): UsePlanConverterReturn {
  const [state, setState] = useState<ConversionState>(initialConversionState)

  const convert = useCallback((planText: string): ConversionResult => {
    // Set converting state
    setState(prev => ({
      ...prev,
      status: 'converting',
      errorMessage: null,
    }))

    try {
      // Validate input
      const trimmedPlan = planText.trim()
      if (!trimmedPlan) {
        const error = 'Please enter an execution plan to visualize.'
        setState(prev => ({
          ...prev,
          status: 'error',
          errorMessage: error,
        }))
        return { success: false, error }
      }

      // Convert using plan-viz library (returns full Excalidraw JSON scene)
      const result = convertPlanToExcalidraw(trimmedPlan)
      const scene = result as any
      
      // Extract elements from scene (use any to handle plan-viz types)
      const elements = (scene.elements ?? []) as readonly ExcalidrawElement[]
      const nodeCount = elements.length

      // Update state with success
      setState({
        status: 'success',
        errorMessage: null,
        elements,
        previousElements: elements, // Update previous on success
        scene,
        previousScene: scene,
      })

      return { 
        success: true, 
        elements,
        nodeCount,
      }
    } catch (err) {
      // Handle conversion error
      const errorMessage = err instanceof Error 
        ? err.message 
        : 'Failed to parse execution plan. Please check the format.'

      setState(prev => ({
        ...prev,
        status: 'error',
        errorMessage,
        // Keep previousElements for fallback display
      }))

      return { success: false, error: errorMessage }
    }
  }, [])

  const reset = useCallback(() => {
    setState(initialConversionState)
  }, [])

  // Determine which elements to display (current or previous as fallback)
  const displayElements = state.elements ?? state.previousElements
  const displayScene = state.scene ?? state.previousScene ?? null

  return {
    state,
    convert,
    reset,
    hasElements: displayElements !== null && displayElements.length > 0,
    displayElements,
    displayScene,
  }
}

/**
 * Check if the node count exceeds the warning threshold
 */
export function shouldShowPerformanceWarning(nodeCount: number): boolean {
  return nodeCount > NODE_WARNING_THRESHOLD
}

