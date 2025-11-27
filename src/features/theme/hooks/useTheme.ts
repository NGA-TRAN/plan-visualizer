// Theme Hook
// Manages theme state with localStorage persistence and system preference detection

import { useEffect } from 'react'
import { useAppStore, useTheme as useThemeState } from '@/store'
import type { ThemeMode } from '@/types'

export function useTheme() {
  const theme = useThemeState()
  const setThemeMode = useAppStore((state) => state.setThemeMode)

  // Listen for system preference changes
  useEffect(() => {
    if (theme.mode !== 'system') return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

    const handleChange = () => {
      // Re-apply theme when system preference changes
      setThemeMode('system')
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [theme.mode, setThemeMode])

  const toggleTheme = () => {
    const nextMode: ThemeMode = theme.resolved === 'light' ? 'dark' : 'light'
    setThemeMode(nextMode)
  }

  const cycleTheme = () => {
    const modes: ThemeMode[] = ['light', 'dark', 'system']
    const currentIndex = modes.indexOf(theme.mode)
    const nextIndex = (currentIndex + 1) % modes.length
    setThemeMode(modes[nextIndex])
  }

  return {
    mode: theme.mode,
    resolved: theme.resolved,
    isDark: theme.resolved === 'dark',
    isLight: theme.resolved === 'light',
    isSystem: theme.mode === 'system',
    setThemeMode,
    toggleTheme,
    cycleTheme,
  }
}

