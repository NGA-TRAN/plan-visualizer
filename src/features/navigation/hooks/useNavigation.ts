// Navigation Hook
// Provides navigation state and actions

import { useAppStore, useNavigationItems, useSidebarCollapsed } from '@/store'
import { useLocation } from 'react-router-dom'

export function useNavigation() {
  const location = useLocation()
  const navigationItems = useNavigationItems()
  const sidebarCollapsed = useSidebarCollapsed()
  const toggleSidebar = useAppStore((state) => state.toggleSidebar)

  // Check if a route is active
  const isActiveRoute = (route?: string) => {
    if (!route) return false
    return location.pathname === route
  }

  // Check if any child route is active
  const hasActiveChild = (item: { children?: Array<{ route?: string }> }) => {
    if (!item.children) return false
    return item.children.some((child) => isActiveRoute(child.route))
  }

  return {
    navigationItems,
    sidebarCollapsed,
    toggleSidebar,
    isActiveRoute,
    hasActiveChild,
    currentPath: location.pathname,
  }
}

