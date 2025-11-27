// Centralized Zustand Store
// Single source of truth for: users, activities, metrics, navigation, notifications, theme

import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type {
  AppStore,
  User,
  Activity,
  Notification,
  ThemeMode,
  ThemePreference,
} from '@/types'
import { generateSeedData, generateMetrics } from '@/data/seed'

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
      users: [],
      activities: [],
      metrics: [],
      navigationItems: [],
      sidebarCollapsed: false,
      notifications: [],
      theme: { mode: 'system', resolved: 'light' },

      // =======================================================================
      // User Actions
      // =======================================================================

      addUser: (userData) => {
        const newUser: User = {
          ...userData,
          id: generateId(),
          createdAt: new Date(),
        }
        
        set(
          (state) => ({
            users: [newUser, ...state.users],
          }),
          false,
          'addUser'
        )
        
        // Add activity
        get().addActivity({
          type: 'user_created',
          description: `New user created: ${newUser.name}`,
          userId: newUser.id,
        })
        
        // Update metrics
        get().updateMetrics()
      },

      updateUser: (id, updates) => {
        set(
          (state) => ({
            users: state.users.map((user) =>
              user.id === id ? { ...user, ...updates } : user
            ),
          }),
          false,
          'updateUser'
        )
        
        const user = get().users.find((u) => u.id === id)
        if (user) {
          get().addActivity({
            type: 'user_updated',
            description: `User updated: ${user.name}`,
            userId: id,
          })
        }
        
        get().updateMetrics()
      },

      deleteUser: (id) => {
        const user = get().users.find((u) => u.id === id)
        
        set(
          (state) => ({
            users: state.users.filter((user) => user.id !== id),
          }),
          false,
          'deleteUser'
        )
        
        if (user) {
          get().addActivity({
            type: 'user_deleted',
            description: `User deleted: ${user.name}`,
            userId: id,
          })
        }
        
        get().updateMetrics()
      },

      // =======================================================================
      // Activity Actions
      // =======================================================================

      addActivity: (activityData) => {
        const newActivity: Activity = {
          ...activityData,
          id: generateId(),
          timestamp: new Date(),
        }
        
        set(
          (state) => ({
            activities: [newActivity, ...state.activities].slice(0, 50), // Keep last 50
          }),
          false,
          'addActivity'
        )
      },

      // =======================================================================
      // Metrics Actions
      // =======================================================================

      updateMetrics: () => {
        const { users } = get()
        const newMetrics = generateMetrics(users)
        
        set({ metrics: newMetrics }, false, 'updateMetrics')
      },

      // =======================================================================
      // Navigation Actions
      // =======================================================================

      toggleSidebar: () => {
        set(
          (state) => ({
            sidebarCollapsed: !state.sidebarCollapsed,
          }),
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
        
        // Apply initial theme
        applyTheme(theme.resolved)
        
        set(
          {
            users: seedData.users,
            activities: seedData.activities,
            metrics: seedData.metrics,
            navigationItems: seedData.navigationItems,
            theme,
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

export const useUsers = () => useAppStore((state) => state.users)
export const useActivities = () => useAppStore((state) => state.activities)
export const useMetrics = () => useAppStore((state) => state.metrics)
export const useNavigationItems = () => useAppStore((state) => state.navigationItems)
export const useSidebarCollapsed = () => useAppStore((state) => state.sidebarCollapsed)
export const useNotifications = () => useAppStore((state) => state.notifications)
export const useTheme = () => useAppStore((state) => state.theme)

