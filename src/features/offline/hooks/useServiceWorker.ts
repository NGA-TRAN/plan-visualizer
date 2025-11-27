// useServiceWorker Hook
// Manages Service Worker registration and lifecycle

import { useState, useEffect } from 'react'

export interface UseServiceWorkerReturn {
  isRegistered: boolean
  isUpdateAvailable: boolean
  registration: ServiceWorkerRegistration | null
  error: Error | null
  update: () => Promise<void>
}

/**
 * Hook to manage Service Worker registration and updates
 * Works with vite-plugin-pwa generated Service Worker
 */
export function useServiceWorker(): UseServiceWorkerReturn {
  const [state, setState] = useState<UseServiceWorkerReturn>({
    isRegistered: false,
    isUpdateAvailable: false,
    registration: null,
    error: null,
    update: async () => {},
  })

  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      setState((prev) => ({
        ...prev,
        error: new Error('Service Workers are not supported in this browser'),
      }))
      return
    }

    let registration: ServiceWorkerRegistration | null = null

    const registerServiceWorker = async () => {
      try {
        // vite-plugin-pwa registers the service worker automatically
        // We can check if it's registered and listen for updates
        const reg = await navigator.serviceWorker.getRegistration()
        registration = reg || null
        
        if (registration) {
          setState({
            isRegistered: true,
            isUpdateAvailable: false,
            registration,
            error: null,
            update: async () => {
              if (registration) {
                await registration.update()
              }
            },
          })

          // Listen for updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration!.installing
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  setState((prev) => ({
                    ...prev,
                    isUpdateAvailable: true,
                  }))
                }
              })
            }
          })
        } else {
          // Service Worker will be registered by vite-plugin-pwa
          // Just mark as registered when it becomes available
          navigator.serviceWorker.ready.then((reg) => {
            setState({
              isRegistered: true,
              isUpdateAvailable: false,
              registration: reg,
              error: null,
              update: async () => {
                await reg.update()
              },
            })
          })
        }
      } catch (err) {
        setState((prev) => ({
          ...prev,
          error: err instanceof Error ? err : new Error('Failed to register Service Worker'),
        }))
      }
    }

    registerServiceWorker()

    // Listen for controller changes (new service worker activated)
    const handleControllerChange = () => {
      navigator.serviceWorker.getRegistration().then((reg) => {
        if (reg) {
          setState((prev) => ({
            ...prev,
            registration: reg,
            isUpdateAvailable: false,
          }))
        }
      })
    }

    navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange)

    return () => {
      navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange)
    }
  }, [])

  return state
}

