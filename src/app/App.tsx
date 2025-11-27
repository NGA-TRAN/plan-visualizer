// Root App Component
// Contains main layout with providers

import { Suspense } from 'react'
import { RouterProvider } from 'react-router-dom'
import { router } from './router'
import { LoadingOverlay } from '@/shared/components'
import { ToastContainer } from '@/features/notifications/components/ToastContainer'

export function App() {
  return (
    <>
      <Suspense fallback={<LoadingOverlay message="Loading application..." />}>
        <RouterProvider
          router={router}
          future={{
            v7_startTransition: true,
          }}
        />
      </Suspense>
      <ToastContainer />
    </>
  )
}
