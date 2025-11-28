// Route Definitions with Lazy Loading
// Implements code splitting for optimal bundle size

import { lazy, Suspense } from 'react'
import { createBrowserRouter, Outlet } from 'react-router-dom'
import { LoadingSpinner } from '@/shared/components'
import { Sidebar, MobileMenuButton } from '@/features/navigation/components/Sidebar'
import { useAppStore } from '@/store'
import { cn } from '@/shared/utils/cn'

// Lazy load pages for code splitting
const PlanVisualizerPage = lazy(() => import('@/features/plan-visualizer/components/PlanVisualizerPage').then(m => ({ default: m.PlanVisualizerPage })))

// Layout component with Sidebar
function RootLayout() {
  const sidebarCollapsed = useAppStore((state) => state.sidebarCollapsed)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content area */}
      <div
        className={cn(
          'transition-all duration-300',
          sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'
        )}
      >
        {/* Top header */}
        <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
          {/* Left: App Name */}
          <div className="flex items-center gap-2">
            <MobileMenuButton />
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-gray-900 dark:text-gray-100">
              DataFusion Plan Visualizer
            </h1>
          </div>
          
          {/* Right: Info Links */}
          <div className="flex flex-col sm:flex-row items-end sm:items-center gap-1 sm:gap-3 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
            <span>
              Powered by{' '}
              <a 
                href="https://www.npmjs.com/package/plan-viz" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 underline"
              >
                plan-viz
              </a>
            </span>
            <span className="hidden sm:inline">•</span>
            <a 
              href="https://github.com/NGA-TRAN/plan-visualizer" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 underline"
            >
              Report bugs
            </a>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6">
          <Suspense
            fallback={
              <div className="flex items-center justify-center h-64">
                <LoadingSpinner size="lg" />
              </div>
            }
          >
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  )
}

// Base path for GitHub Pages (repository name)
const basename = import.meta.env.BASE_URL.replace(/\/$/, '') || undefined

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <PlanVisualizerPage />,
      },
      {
        path: 'settings/*',
        element: (
          <div className="flex items-center justify-center h-64 text-gray-500">
            Settings page coming soon...
          </div>
        ),
      },
    ],
  },
], {
  basename,
})
