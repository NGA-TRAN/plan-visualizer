// Notifications Hook
// Provides notification actions and utilities

import { useAppStore, useNotifications as useNotificationsState } from '@/store'
import type { NotificationType } from '@/types'

export function useNotifications() {
  const notifications = useNotificationsState()
  const addNotification = useAppStore((state) => state.addNotification)
  const dismissNotification = useAppStore((state) => state.dismissNotification)

  // Convenience methods for different notification types
  const notify = {
    success: (message: string, duration = 5000) => {
      addNotification({
        type: 'success',
        message,
        duration,
        dismissible: true,
      })
    },
    error: (message: string, duration = 5000) => {
      addNotification({
        type: 'error',
        message,
        duration,
        dismissible: true,
      })
    },
    warning: (message: string, duration = 5000) => {
      addNotification({
        type: 'warning',
        message,
        duration,
        dismissible: true,
      })
    },
    info: (message: string, duration = 5000) => {
      addNotification({
        type: 'info',
        message,
        duration,
        dismissible: true,
      })
    },
    custom: (type: NotificationType, message: string, duration = 5000, dismissible = true) => {
      addNotification({
        type,
        message,
        duration,
        dismissible,
      })
    },
  }

  return {
    notifications,
    notify,
    dismissNotification,
  }
}

