// Entity Types for Admin Template
// Based on data-model.md specifications

// =============================================================================
// User Entity
// =============================================================================

export type UserRole = 'admin' | 'editor' | 'viewer'
export type UserStatus = 'active' | 'inactive' | 'pending'

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  status: UserStatus
  createdAt: Date
  avatar: string
}

// =============================================================================
// Metric Card Entity (Dashboard KPI Widget)
// =============================================================================

export type TrendDirection = 'up' | 'down' | 'neutral'

export interface MetricCard {
  id: string
  title: string
  value: string | number
  trend: TrendDirection
  changePercent: number
  icon: string
}

// =============================================================================
// Navigation Entity
// =============================================================================

export interface NavigationItem {
  id: string
  label: string
  icon: string
  route?: string
  children?: NavigationItem[]
  badge?: number
}

// =============================================================================
// Notification (Toast) Entity
// =============================================================================

export type NotificationType = 'success' | 'error' | 'warning' | 'info'

export interface Notification {
  id: string
  type: NotificationType
  message: string
  duration: number
  dismissible: boolean
  createdAt: number
}

// =============================================================================
// Activity Entity (Dashboard Feed)
// =============================================================================

export type ActivityType =
  | 'user_created'
  | 'user_updated'
  | 'user_deleted'
  | 'login'
  | 'settings_changed'

export interface Activity {
  id: string
  type: ActivityType
  description: string
  timestamp: Date
  userId?: string
  metadata?: Record<string, unknown>
}

// =============================================================================
// Theme Entity
// =============================================================================

export type ThemeMode = 'light' | 'dark' | 'system'
export type ResolvedTheme = 'light' | 'dark'

export interface ThemePreference {
  mode: ThemeMode
  resolved: ResolvedTheme
}

// =============================================================================
// Store Types
// =============================================================================

export interface AppStore {
  // Navigation
  navigationItems: NavigationItem[]
  sidebarCollapsed: boolean
  toggleSidebar: () => void

  // Notifications
  notifications: Notification[]
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => void
  dismissNotification: (id: string) => void

  // Theme
  theme: ThemePreference
  setThemeMode: (mode: ThemeMode) => void

  // Initialization
  initializeStore: () => void
}

