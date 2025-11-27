// Sample Data Generator
// Generates 100 users, 20 activities, 4 metrics for demonstration

import type { User, Activity, MetricCard, NavigationItem, UserRole, UserStatus, ActivityType } from '@/types'

// =============================================================================
// Helper Functions
// =============================================================================

function generateId(): string {
  return Math.random().toString(36).substring(2, 11)
}

function randomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function randomDate(daysAgo: number): Date {
  const date = new Date()
  date.setDate(date.getDate() - Math.floor(Math.random() * daysAgo))
  return date
}

// =============================================================================
// User Data
// =============================================================================

const firstNames = [
  'James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda',
  'William', 'Elizabeth', 'David', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica',
  'Thomas', 'Sarah', 'Charles', 'Karen', 'Emma', 'Oliver', 'Ava', 'Liam', 'Sophia',
  'Noah', 'Isabella', 'Ethan', 'Mia', 'Lucas', 'Charlotte', 'Mason', 'Amelia', 'Logan'
]

const lastNames = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
  'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson',
  'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson', 'White',
  'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker', 'Young'
]

const roles: UserRole[] = ['admin', 'editor', 'viewer']
const statuses: UserStatus[] = ['active', 'inactive', 'pending']

export function generateUsers(count: number = 100): User[] {
  return Array.from({ length: count }, (_, i) => {
    const firstName = randomElement(firstNames)
    const lastName = randomElement(lastNames)
    const name = `${firstName} ${lastName}`
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@example.com`
    
    return {
      id: generateId(),
      name,
      email,
      role: randomElement(roles),
      status: randomElement(statuses),
      createdAt: randomDate(365),
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${firstName}${lastName}${i}`,
    }
  })
}

// =============================================================================
// Activity Data
// =============================================================================

const activityTypes: ActivityType[] = [
  'user_created',
  'user_updated',
  'user_deleted',
  'login',
  'settings_changed'
]

const activityDescriptions: Record<ActivityType, string[]> = {
  user_created: [
    'New user account created',
    'User registration completed',
    'New team member added'
  ],
  user_updated: [
    'User profile updated',
    'User role changed',
    'User status modified'
  ],
  user_deleted: [
    'User account removed',
    'User deactivated',
    'Account deleted by admin'
  ],
  login: [
    'User logged in',
    'New session started',
    'Authentication successful'
  ],
  settings_changed: [
    'System settings updated',
    'Preferences modified',
    'Configuration changed'
  ]
}

export function generateActivities(count: number = 20, users: User[]): Activity[] {
  return Array.from({ length: count }, () => {
    const type = randomElement(activityTypes)
    const user = randomElement(users)
    
    return {
      id: generateId(),
      type,
      description: `${randomElement(activityDescriptions[type])} - ${user.name}`,
      timestamp: randomDate(7),
      userId: user.id,
    }
  }).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
}

// =============================================================================
// Metric Cards
// =============================================================================

export function generateMetrics(users: User[]): MetricCard[] {
  const activeUsers = users.filter(u => u.status === 'active').length
  const adminCount = users.filter(u => u.role === 'admin').length
  
  return [
    {
      id: 'metric-users',
      title: 'Total Users',
      value: users.length,
      trend: 'up',
      changePercent: 12.5,
      icon: 'users',
    },
    {
      id: 'metric-active',
      title: 'Active Sessions',
      value: Math.floor(activeUsers * 0.7),
      trend: 'up',
      changePercent: 8.2,
      icon: 'activity',
    },
    {
      id: 'metric-revenue',
      title: 'Revenue',
      value: '$48,352',
      trend: 'up',
      changePercent: 15.3,
      icon: 'dollar-sign',
    },
    {
      id: 'metric-growth',
      title: 'Growth Rate',
      value: `${(adminCount / users.length * 100).toFixed(1)}%`,
      trend: 'neutral',
      changePercent: 0.5,
      icon: 'trending-up',
    },
  ]
}

// =============================================================================
// Navigation Items
// =============================================================================

export function generateNavigationItems(): NavigationItem[] {
  return [
    {
      id: 'nav-dashboard',
      label: 'Dashboard',
      icon: 'layout-dashboard',
      route: '/',
    },
    {
      id: 'nav-management',
      label: 'Management',
      icon: 'folder',
      children: [
        {
          id: 'nav-users',
          label: 'Users',
          icon: 'users',
          route: '/users',
        },
        {
          id: 'nav-products',
          label: 'Products',
          icon: 'package',
          route: '/products',
          badge: 5,
        },
      ],
    },
    {
      id: 'nav-forms',
      label: 'Form Demo',
      icon: 'file-text',
      route: '/forms',
    },
    {
      id: 'nav-plan-visualizer',
      label: 'Plan Visualizer',
      icon: 'workflow',
      route: '/plan-visualizer',
    },
    {
      id: 'nav-settings',
      label: 'Settings',
      icon: 'settings',
      children: [
        {
          id: 'nav-profile',
          label: 'Profile',
          icon: 'user',
          route: '/settings/profile',
        },
        {
          id: 'nav-preferences',
          label: 'Preferences',
          icon: 'sliders',
          route: '/settings/preferences',
        },
      ],
    },
  ]
}

// =============================================================================
// Combined Seed Function
// =============================================================================

export interface SeedData {
  users: User[]
  activities: Activity[]
  metrics: MetricCard[]
  navigationItems: NavigationItem[]
}

export function generateSeedData(): SeedData {
  const users = generateUsers(100)
  const activities = generateActivities(20, users)
  const metrics = generateMetrics(users)
  const navigationItems = generateNavigationItems()

  return {
    users,
    activities,
    metrics,
    navigationItems,
  }
}

