// InstallPrompt Component
// Shows installation prompt UI when app is installable

import { useState, useEffect } from 'react'
import { useInstallPrompt } from '../hooks/useInstallPrompt'
import { Download, X } from 'lucide-react'
import { Button } from '@/shared/components'

export function InstallPrompt() {
  const { canInstall, isInstalled, prompt, dismiss } = useInstallPrompt()
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Show prompt after a delay to avoid being too aggressive
    if (canInstall && !isInstalled) {
      const timer = setTimeout(() => {
        setIsVisible(true)
      }, 3000) // Show after 3 seconds

      return () => clearTimeout(timer)
    } else {
      setIsVisible(false)
    }
  }, [canInstall, isInstalled])

  if (!isVisible || !canInstall || isInstalled) {
    return null
  }

  const handleInstall = async () => {
    await prompt()
    setIsVisible(false)
  }

  const handleDismiss = () => {
    dismiss()
    setIsVisible(false)
  }

  return (
    <div className="fixed bottom-4 right-4 bg-blue-600 text-white p-4 rounded-lg shadow-lg max-w-sm z-50 animate-in slide-in-from-bottom-5">
      <div className="flex items-start gap-3">
        <Download className="w-5 h-5 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="font-semibold mb-1">Install Plan Visualizer</h3>
          <p className="text-sm text-blue-100 mb-3">
            Install for quick access and offline use
          </p>
          <div className="flex gap-2">
            <Button
              onClick={handleInstall}
              className="px-4 py-2 bg-white text-blue-600 rounded hover:bg-blue-50 text-sm font-medium"
            >
              Install
            </Button>
            <button
              onClick={handleDismiss}
              className="px-4 py-2 text-white hover:text-blue-100 text-sm"
              aria-label="Dismiss install prompt"
            >
              Not now
            </button>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="text-white hover:text-blue-100 flex-shrink-0"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

