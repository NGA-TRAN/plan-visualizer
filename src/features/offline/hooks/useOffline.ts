// useOffline Hook
// Detects network connectivity status using Navigator.onLine API and network events

import { useState, useEffect } from 'react'
import type { ConnectivityStatus } from '../types'

export interface UseOfflineReturn {
  isOnline: boolean
  isOffline: boolean
  lastOnlineAt: Date | null
  lastOfflineAt: Date | null
}

/**
 * Hook to track network connectivity status
 * Uses Navigator.onLine API and online/offline events for real-time updates
 */
export function useOffline(): UseOfflineReturn {
  const [status, setStatus] = useState<ConnectivityStatus>(() => ({
    isOnline: navigator.onLine,
    lastOnlineAt: navigator.onLine ? new Date() : null,
    lastOfflineAt: navigator.onLine ? null : new Date(),
  }))

  useEffect(() => {
    const handleOnline = () => {
      setStatus({
        isOnline: true,
        lastOnlineAt: new Date(),
        lastOfflineAt: status.lastOfflineAt,
      })
    }

    const handleOffline = () => {
      setStatus({
        isOnline: false,
        lastOnlineAt: status.lastOnlineAt,
        lastOfflineAt: new Date(),
      })
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [status.lastOfflineAt, status.lastOnlineAt])

  return {
    isOnline: status.isOnline,
    isOffline: !status.isOnline,
    lastOnlineAt: status.lastOnlineAt,
    lastOfflineAt: status.lastOfflineAt,
  }
}

