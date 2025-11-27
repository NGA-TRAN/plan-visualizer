// Route Definitions with Lazy Loading
// Implements code splitting for optimal bundle size

import { lazy, Suspense } from 'react'
import { createBrowserRouter, Outlet } from 'react-router-dom'
import { LoadingSpinner } from '@/shared/components'
import { Sidebar, MobileMenuButton } from '@/features/navigation/components/Sidebar'
import { ThemeToggle } from '@/features/theme/components/ThemeToggle'
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
          <MobileMenuButton />
          <div className="flex-1" />
          <ThemeToggle />
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
])
