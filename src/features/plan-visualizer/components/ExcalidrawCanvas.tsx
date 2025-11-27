// ExcalidrawCanvas Component
// Wrapper for @excalidraw/excalidraw with error boundary and theme support

import { Component, type ReactNode, useEffect, useState } from 'react'
import { Excalidraw } from '@excalidraw/excalidraw'
import '@excalidraw/excalidraw/index.css'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import { Button } from '@/shared/components'
import { cn } from '@/shared/utils/cn'
import type { ExcalidrawCanvasProps } from '../types'

// Error Boundary for catching Excalidraw render failures
interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

interface ErrorBoundaryProps {
  children: ReactNode
  onReset?: () => void
}

class ExcalidrawErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
    this.props.onReset?.()
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-full p-8 text-center">
          <div className="w-16 h-16 mb-4 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-amber-600 dark:text-amber-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Visualization Error
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 max-w-md">
            The diagram failed to render. This might be due to a browser compatibility issue or invalid data.
          </p>
          {this.state.error && (
            <p className="text-xs text-gray-500 dark:text-gray-500 mb-4 font-mono bg-gray-100 dark:bg-gray-800 p-2 rounded max-w-md overflow-auto">
              {this.state.error.message}
            </p>
          )}
          <Button onClick={this.handleReset} variant="secondary" className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Try Again
          </Button>
        </div>
      )
    }

    return this.props.children
  }
}

// Empty state component
function EmptyCanvas() {
  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center">
      <div className="w-20 h-20 mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
        <svg
          className="w-10 h-10 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"
          />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
        No Plan Visualized
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm">
        Enter a DataFusion Physical Execution Plan in the input area and click "Visualize" to see it as an interactive diagram.
      </p>
    </div>
  )
}

export function ExcalidrawCanvas({ scene: propScene = null, theme = 'light' }: ExcalidrawCanvasProps) {
  // Support both prop-based scene (from plan-viz) and fallback to loading sample.excalidraw
  const [loadedScene, setLoadedScene] = useState<any | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Use prop scene if provided, otherwise load sample.excalidraw
  const scene = propScene || loadedScene

  useEffect(() => {
    // Only fetch sample if no scene prop is provided
    if (propScene) {
      return
    }

    let isMounted = true

    fetch('/sample.excalidraw')
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load sample.excalidraw: ${res.status}`)
        return res.json()
      })
      .then((data) => {
        if (isMounted) {
          setLoadedScene(data)
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.error('Error loading sample.excalidraw', err)
          setError('Failed to load sample visualization data.')
        }
      })

    return () => {
      isMounted = false
    }
  }, [propScene])

  const elements = (scene as any)?.elements as any[] | undefined

  // Show error state if sample scene failed to load
  if (error) {
    return (
      <div className={cn(
        'h-full min-h-[400px] rounded-lg border',
        'bg-white dark:bg-gray-800',
        'border-red-200 dark:border-red-700'
      )}>
        <div className="flex flex-col items-center justify-center h-full p-6 text-center">
          <AlertTriangle className="w-8 h-8 text-red-500 mb-2" />
          <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
        </div>
      </div>
    )
  }

  // While loading, or if no elements yet, show empty state
  if (!scene || !elements || elements.length === 0) {
    return (
      <div className={cn(
        'h-full min-h-[400px] rounded-lg border',
        'bg-white dark:bg-gray-800',
        'border-gray-200 dark:border-gray-700'
      )}>
        <EmptyCanvas />
      </div>
    )
  }

  // Use the scene as returned by plan-viz / sample.excalidraw,
  // only adjusting the background color to match the app theme.
  const mergedScene = {
    ...(scene as any),
    appState: {
      ...(scene as any)?.appState,
      viewBackgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
    },
  }

  return (
    <div 
      className={cn(
        'rounded-lg border overflow-hidden planviz-excalidraw',
        'border-gray-200 dark:border-gray-700',
        'h-full w-full flex flex-col'
      )}
    >
      <ExcalidrawErrorBoundary>
        <div className="flex-1 min-h-0">
          <Excalidraw
            initialData={mergedScene}
            theme={theme}
            // Keep sidebar non-docked so it doesn't permanently occupy a large column
            // and rely on Excalidraw's default horizontal top menu layout.
            UIOptions={{
              dockedSidebarBreakpoint: 10000,
            } as any}
          />
        </div>
      </ExcalidrawErrorBoundary>
    </div>
  )
}
