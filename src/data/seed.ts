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

