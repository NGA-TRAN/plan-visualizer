// Sidebar Component
// Collapsible navigation sidebar

import { Menu, X, PanelLeftClose, PanelLeft } from 'lucide-react'
import { cn } from '@/shared/utils/cn'
import { Button } from '@/shared/components'
import { NavGroup } from './NavGroup'
import { NavItem } from './NavItem'
import { useNavigation } from '../hooks/useNavigation'

export function Sidebar() {
  const {
    navigationItems,
    sidebarCollapsed,
    toggleSidebar,
    isActiveRoute,
  } = useNavigation()

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={cn(
          'fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity',
          !sidebarCollapsed ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={toggleSidebar}
        aria-hidden="true"
      />

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 z-40 h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-all duration-300',
          // Desktop: collapsed = narrow, expanded = wide
          'lg:translate-x-0',
          sidebarCollapsed ? 'lg:w-16' : 'lg:w-64',
          // Mobile: slide in/out (collapsed means hidden on mobile)
          sidebarCollapsed ? '-translate-x-full lg:translate-x-0' : 'translate-x-0 w-64'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-800">
          {!sidebarCollapsed && (
            <img 
              src={`${import.meta.env.BASE_URL}icons/icon-192x192.png`}
              alt="Plan Visualizer" 
              className="h-16 w-16"
            />
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleSidebar}
            className={cn(sidebarCollapsed && 'mx-auto')}
            aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {sidebarCollapsed ? (
              <PanelLeft className="h-5 w-5" />
            ) : (
              <PanelLeftClose className="h-5 w-5 hidden lg:block" />
            )}
            <X className="h-5 w-5 lg:hidden" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="p-3 space-y-1 overflow-y-auto h-[calc(100vh-4rem)]">
          {navigationItems.map((item) => {
            if (item.children && item.children.length > 0) {
              return (
                <NavGroup
                  key={item.id}
                  item={item}
                  isActiveRoute={isActiveRoute}
                  collapsed={sidebarCollapsed}
                />
              )
            }
            return (
              <NavItem
                key={item.id}
                item={item}
                isActive={isActiveRoute(item.route)}
                collapsed={sidebarCollapsed}
              />
            )
          })}
        </nav>
      </aside>
    </>
  )
}

// Mobile menu button (for use in header)
export function MobileMenuButton() {
  const { toggleSidebar } = useNavigation()

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleSidebar}
      className="lg:hidden"
      aria-label="Toggle menu"
    >
      <Menu className="h-5 w-5" />
    </Button>
  )
}

