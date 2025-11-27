// Navigation Items Generator
// Generates navigation items for the sidebar

import type { NavigationItem } from '@/types'

// =============================================================================
// Navigation Items
// =============================================================================

export function generateNavigationItems(): NavigationItem[] {
  return [
    {
      id: 'nav-plan-visualizer',
      label: 'Plan Visualizer',
      icon: 'workflow',
      route: '/',
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
  navigationItems: NavigationItem[]
}

export function generateSeedData(): SeedData {
  const navigationItems = generateNavigationItems()

  return {
    navigationItems,
  }
}

