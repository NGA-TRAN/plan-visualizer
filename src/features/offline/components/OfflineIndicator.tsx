// OfflineIndicator Component
// Displays connectivity status to users

import { useOffline } from '../hooks/useOffline'
import { WifiOff } from 'lucide-react'

export function OfflineIndicator() {
  const { isOffline } = useOffline()

  if (!isOffline) {
    return null
  }

  return (
    <div className="fixed top-0 left-0 right-0 bg-amber-500 text-white px-4 py-2 text-center text-sm z-50 flex items-center justify-center gap-2">
      <WifiOff className="w-4 h-4" />
      <span>You are currently offline. Some features may be limited.</span>
    </div>
  )
}

