// useResizablePanels Hook
// Manages resizable panel layout with localStorage persistence

import { useState, useCallback, useRef, useEffect } from 'react'

const DEFAULT_INPUT_HEIGHT = 0.4 // 40%
const MIN_INPUT_HEIGHT = 0.2 // 20%
const MAX_INPUT_HEIGHT = 0.8 // 80%
const STORAGE_KEY = 'plan-visualizer-panel-input-height'

export interface UseResizablePanelsReturn {
  /** Ref to attach to container element */
  containerRef: React.RefObject<HTMLDivElement | null>
  /** Input panel height ratio (0.0 to 1.0) */
  inputHeight: number
  /** Whether user is currently dragging */
  isDragging: boolean
  /** Mouse down handler for resizer handle */
  handleMouseDown: (e: React.MouseEvent) => void
}

/**
 * Hook for managing resizable input/output panels.
 * Persists panel size preference to localStorage.
 */
export function useResizablePanels(): UseResizablePanelsReturn {
  const containerRef = useRef<HTMLDivElement>(null)
  const [inputHeight, setInputHeight] = useState(() => {
    if (typeof window === 'undefined') return DEFAULT_INPUT_HEIGHT
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const parsed = parseFloat(saved)
      // Validate saved value is within bounds
      if (!isNaN(parsed) && parsed >= MIN_INPUT_HEIGHT && parsed <= MAX_INPUT_HEIGHT) {
        return parsed
      }
    }
    return DEFAULT_INPUT_HEIGHT
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
      // Clamp between min and max
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

