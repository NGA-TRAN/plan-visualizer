// Toast Container Component
// Stacks and manages toast notifications

import { createPortal } from 'react-dom'
import { Toast } from './Toast'
import { useNotifications } from '../hooks/useNotifications'

export function ToastContainer() {
  const { notifications, dismissNotification } = useNotifications()

  if (notifications.length === 0) {
    return null
  }

  return createPortal(
    <div
      className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full"
      aria-live="polite"
      aria-label="Notifications"
    >
      {notifications.map((notification) => (
        <Toast
          key={notification.id}
          notification={notification}
          onDismiss={dismissNotification}
        />
      ))}
    </div>,
    document.body
  )
}

