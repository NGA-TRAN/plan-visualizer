// useInstallPrompt Hook
// Detects installability and handles installation prompt

import { useState, useEffect } from 'react'
import type { InstallationState } from '../types'

export interface UseInstallPromptReturn {
  canInstall: boolean
  isInstalled: boolean
  prompt: () => Promise<InstallPromptResult | null>
  dismiss: () => void
}

export interface InstallPromptResult {
  outcome: 'accepted' | 'dismissed'
  platform: string
}

const INSTALLATION_STATE_KEY = 'plan-visualizer-installation-state'

function getInitialInstallationState(): InstallationState {
  if (typeof window === 'undefined') {
    return {
      isInstalled: false,
      installedAt: null,
      installPromptDismissed: false,
      installPromptDismissedAt: null,
      platform: null,
    }
  }

  const stored = localStorage.getItem(INSTALLATION_STATE_KEY)
  if (stored) {
    try {
      return JSON.parse(stored)
    } catch {
      // Invalid JSON, return defaults
    }
  }

  return {
    isInstalled: false,
    installedAt: null,
    installPromptDismissed: false,
    installPromptDismissedAt: null,
    platform: null,
  }
}

function saveInstallationState(state: InstallationState): void {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(INSTALLATION_STATE_KEY, JSON.stringify(state))
  }
}

/**
 * Hook to detect installability and trigger installation
 */
export function useInstallPrompt(): UseInstallPromptReturn {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [installationState, setInstallationState] = useState<InstallationState>(
    getInitialInstallationState
  )

  useEffect(() => {
    // Check if already installed (standalone mode)
    if (window.matchMedia('(display-mode: standalone)').matches) {
      const newState: InstallationState = {
        ...installationState,
        isInstalled: true,
        platform: window.innerWidth >= 768 ? 'desktop' : 'mobile',
      }
      setInstallationState(newState)
      saveInstallationState(newState)
    }

    // Listen for install prompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [installationState])

  const prompt = async (): Promise<InstallPromptResult | null> => {
    if (!deferredPrompt) {
      return null
    }

    try {
      deferredPrompt.prompt()
      const { outcome, platform } = await deferredPrompt.userChoice

      const newState: InstallationState = {
        isInstalled: outcome === 'accepted',
        installedAt: outcome === 'accepted' ? Date.now() : installationState.installedAt,
        installPromptDismissed: false,
        installPromptDismissedAt: null,
        platform: outcome === 'accepted' ? (platform.includes('mobile') ? 'mobile' : 'desktop') : installationState.platform,
      }

      setInstallationState(newState)
      saveInstallationState(newState)
      setDeferredPrompt(null)

      return { outcome, platform }
    } catch (error) {
      console.error('Failed to show install prompt:', error)
      return null
    }
  }

  const dismiss = () => {
    const newState: InstallationState = {
      ...installationState,
      installPromptDismissed: true,
      installPromptDismissedAt: Date.now(),
    }
    setInstallationState(newState)
    saveInstallationState(newState)
    setDeferredPrompt(null)
  }

  return {
    canInstall: !!deferredPrompt && !installationState.isInstalled && !installationState.installPromptDismissed,
    isInstalled: installationState.isInstalled,
    prompt,
    dismiss,
  }
}

