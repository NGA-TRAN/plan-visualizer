// Centralized Zustand Store
// Single source of truth for: navigation, notifications, theme

import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type {
  AppStore,
  Notification,
  ThemeMode,
  ThemePreference,
} from '@/types'
import { generateSeedData } from '@/data/seed'

// =============================================================================
// Theme Helpers
// =============================================================================

function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function getInitialTheme(): ThemePreference {
  if (typeof window === 'undefined') {
    return { mode: 'system', resolved: 'light' }
  }
  
  const stored = localStorage.getItem('admin-template-theme') as ThemeMode | null
  const mode = stored || 'system'
  const resolved = mode === 'system' ? getSystemTheme() : mode
  
  return { mode, resolved }
}

function getInitialSidebarCollapsed(): boolean {
  if (typeof window === 'undefined') {
    return false
  }
  
  const stored = localStorage.getItem('admin-template-sidebar-collapsed')
  return stored === 'true'
}

function applyTheme(resolved: 'light' | 'dark') {
  if (typeof document === 'undefined') return
  
  if (resolved === 'dark') {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}

// =============================================================================
// ID Generator
// =============================================================================

function generateId(): string {
  return Math.random().toString(36).substring(2, 11)
}

// =============================================================================
// Store Creation
// =============================================================================

export const useAppStore = create<AppStore>()(
  devtools(
    (set, get) => ({
      // Initial state (empty, populated by initializeStore)
      navigationItems: [],
      sidebarCollapsed: getInitialSidebarCollapsed(),
      notifications: [],
      theme: { mode: 'system', resolved: 'light' },

      // =======================================================================
      // Navigation Actions
      // =======================================================================

      toggleSidebar: () => {
        set(
          (state) => {
            const newCollapsed = !state.sidebarCollapsed
            // Persist to localStorage
            if (typeof localStorage !== 'undefined') {
              localStorage.setItem('admin-template-sidebar-collapsed', String(newCollapsed))
            }
            return {
              sidebarCollapsed: newCollapsed,
            }
          },
          false,
          'toggleSidebar'
        )
      },

      // =======================================================================
      // Notification Actions
      // =======================================================================

      addNotification: (notificationData) => {
        const newNotification: Notification = {
          ...notificationData,
          id: generateId(),
          createdAt: Date.now(),
        }
        
        set(
          (state) => ({
            notifications: [...state.notifications, newNotification].slice(-5), // Keep last 5
          }),
          false,
          'addNotification'
        )
        
        // Auto-dismiss after duration
        if (notificationData.duration > 0) {
          setTimeout(() => {
            get().dismissNotification(newNotification.id)
          }, notificationData.duration)
        }
      },

      dismissNotification: (id) => {
        set(
          (state) => ({
            notifications: state.notifications.filter((n) => n.id !== id),
          }),
          false,
          'dismissNotification'
        )
      },

      // =======================================================================
      // Theme Actions
      // =======================================================================

      setThemeMode: (mode) => {
        const resolved = mode === 'system' ? getSystemTheme() : mode
        
        // Persist to localStorage
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem('admin-template-theme', mode)
        }
        
        // Apply to DOM
        applyTheme(resolved)
        
        set(
          { theme: { mode, resolved } },
          false,
          'setThemeMode'
        )
      },

      // =======================================================================
      // Initialization
      // =======================================================================

      initializeStore: () => {
        const seedData = generateSeedData()
        const theme = getInitialTheme()
        const sidebarCollapsed = getInitialSidebarCollapsed()
        
        // Apply initial theme
        applyTheme(theme.resolved)
        
        set(
          {
            navigationItems: seedData.navigationItems,
            theme,
            sidebarCollapsed,
          },
          false,
          'initializeStore'
        )
      },
    }),
    { name: 'admin-template-store' }
  )
)

// =============================================================================
// Selector Hooks (for convenience)
// =============================================================================

export const useNavigationItems = () => useAppStore((state) => state.navigationItems)
export const useSidebarCollapsed = () => useAppStore((state) => state.sidebarCollapsed)
export const useNotifications = () => useAppStore((state) => state.notifications)
export const useTheme = () => useAppStore((state) => state.theme)

