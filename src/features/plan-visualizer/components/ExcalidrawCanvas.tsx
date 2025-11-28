// ExcalidrawCanvas Component
// Wrapper for @excalidraw/excalidraw with error boundary and theme support

import { Component, type ReactNode, useEffect, useRef } from 'react'
import { Excalidraw } from '@excalidraw/excalidraw'
import '@excalidraw/excalidraw/index.css'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import { Button } from '@/shared/components'
import { cn } from '@/shared/utils/cn'
import type { ExcalidrawCanvasProps } from '../types'

// Type for Excalidraw API - using any to avoid import issues
type ExcalidrawAPI = {
  updateScene: (sceneData: { elements?: any[]; appState?: any; files?: any }) => void
  scrollToContent: (elements: any[], appState?: any) => void
  getAppState: () => any
}

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
  // Use the scene prop directly from plan-viz conversion
  const scene = propScene
  const elements = (scene as any)?.elements as any[] | undefined
  const excalidrawAPIRef = useRef<ExcalidrawAPI | null>(null)

  // Generate a key based on scene content to help React detect changes
  const sceneKey = scene && elements 
    ? `scene-${elements.length}-${JSON.stringify(elements[0]?.id || '')}`
    : 'empty'

  // Update scene when propScene changes and center the view
  useEffect(() => {
    if (scene && excalidrawAPIRef.current && elements && elements.length > 0) {
      // Use the scene as returned by plan-viz conversion,
      // preserving scrollX/scrollY for centering and adjusting the background color to match the app theme.
      const mergedScene = {
        elements: (scene as any).elements || [],
        appState: {
          ...(scene as any)?.appState,
          viewBackgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
          // Preserve scrollX and scrollY for centering
          scrollX: (scene as any)?.appState?.scrollX ?? 0,
          scrollY: (scene as any)?.appState?.scrollY ?? 0,
          // Collapse sidebar by default
          sidebarOpen: false,
        },
        files: (scene as any).files || {},
      }
      
      // Update the scene using the API
      excalidrawAPIRef.current.updateScene(mergedScene)
      
    }
  }, [scene, theme, elements])

  // Show empty state if no scene or elements
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

  // Use the scene as returned by plan-viz conversion,
  // preserving scrollX/scrollY for centering and adjusting the background color to match the app theme.
  const mergedScene = {
    ...(scene as any),
    appState: {
      ...(scene as any)?.appState,
      viewBackgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
      // Preserve scrollX and scrollY for centering
      scrollX: (scene as any)?.appState?.scrollX ?? 0,
      scrollY: (scene as any)?.appState?.scrollY ?? 0,
      // Collapse sidebar by default
      sidebarOpen: false,
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
        <div className="flex-1 min-h-0" key={sceneKey}>
          <Excalidraw
            excalidrawAPI={(api) => {
              excalidrawAPIRef.current = api
              // If API becomes available and we have a scene, update it immediately
              if (scene && elements && elements.length > 0) {
                const mergedScene = {
                  elements: (scene as any).elements || [],
                  appState: {
                    ...(scene as any)?.appState,
                    viewBackgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
                    // Preserve scrollX and scrollY for centering
                    scrollX: (scene as any)?.appState?.scrollX ?? 0,
                    scrollY: (scene as any)?.appState?.scrollY ?? 0,
                    // Collapse sidebar by default
                    sidebarOpen: false,
                  },
                  files: (scene as any).files || {},
                }
                api.updateScene(mergedScene)
              }
            }}
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
