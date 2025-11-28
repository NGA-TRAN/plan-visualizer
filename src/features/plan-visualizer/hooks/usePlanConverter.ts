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

      // Calculate center and translate elements to the right to center them
      let centeredScene = scene
      if (elements.length > 0) {
        const bounds = calculateElementBounds(elements)
        
        if (bounds) {
          // Calculate the center X of all elements
          const centerX = bounds.minX + (bounds.maxX - bounds.minX) / 2
          
          // Target center position - move elements so their center is at this X position
          // Using a fixed large value to ensure elements are moved well to the right
          const targetCenterX = 800
          
          // Calculate how much to move elements to the right
          const offsetX = targetCenterX - centerX
          
          // Only translate if offset is significant (more than 50px)
          if (Math.abs(offsetX) > 50) {
            // Translate all elements to the right to center them
            const translatedElements = (elements as any[]).map((el: any) => {
              if (el.x !== undefined && typeof el.x === 'number') {
                return {
                  ...el,
                  x: el.x + offsetX,
                }
              }
              return el
            })
            
            // Update scene with translated elements
            centeredScene = {
              ...scene,
              elements: translatedElements,
            }
          }
        }
      }

      // Update state with success
      setState({
        status: 'success',
        errorMessage: null,
        elements,
        previousElements: elements, // Update previous on success
        scene: centeredScene,
        previousScene: centeredScene,
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
 * Calculate bounding box of all elements
 */
function calculateElementBounds(elements: readonly ExcalidrawElement[]): { minX: number; maxX: number; minY: number; maxY: number } | null {
  if (!elements || elements.length === 0) return null
  
  let minX = Infinity
  let maxX = -Infinity
  let minY = Infinity
  let maxY = -Infinity
  
  elements.forEach(el => {
    if (el.x !== undefined && typeof el.x === 'number') {
      const elementWidth = (el.width && typeof el.width === 'number') ? el.width : 0
      const elementHeight = (el.height && typeof el.height === 'number') ? el.height : 0
      minX = Math.min(minX, el.x)
      maxX = Math.max(maxX, el.x + elementWidth)
      if (el.y !== undefined && typeof el.y === 'number') {
        minY = Math.min(minY, el.y)
        maxY = Math.max(maxY, el.y + elementHeight)
      }
    }
  })
  
  if (minX === Infinity || maxX === -Infinity || minY === Infinity || maxY === -Infinity) return null
  
  return { minX, maxX, minY, maxY }
}

/**
 * Check if the node count exceeds the warning threshold
 */
export function shouldShowPerformanceWarning(nodeCount: number): boolean {
  return nodeCount > NODE_WARNING_THRESHOLD
}

