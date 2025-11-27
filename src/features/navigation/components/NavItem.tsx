// Navigation Item Component
// Single navigation link

import { Link } from 'react-router-dom'
import * as LucideIcons from 'lucide-react'
import { cn } from '@/shared/utils/cn'
import type { NavigationItem } from '@/types'

// Dynamic icon component
function NavIcon({ name, className }: { name: string; className?: string }) {
  // Convert kebab-case to PascalCase (e.g., "layout-dashboard" -> "LayoutDashboard")
  const iconName = name
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('') as keyof typeof LucideIcons

  const Icon = LucideIcons[iconName] as React.ComponentType<{ className?: string }>
  
  if (!Icon) {
    return <LucideIcons.Circle className={className} />
  }

  return <Icon className={className} />
}

export interface NavItemProps {
  item: NavigationItem
  isActive?: boolean
  collapsed?: boolean
}

export function NavItem({ item, isActive, collapsed }: NavItemProps) {
  if (!item.route) return null

  return (
    <Link
      to={item.route}
      className={cn(
        'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
        'hover:bg-gray-100 dark:hover:bg-gray-800',
        isActive
          ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'
          : 'text-gray-700 dark:text-gray-300',
        collapsed && 'justify-center px-2'
      )}
      title={collapsed ? item.label : undefined}
    >
      <NavIcon name={item.icon} className="w-5 h-5 flex-shrink-0" />
      {!collapsed && (
        <span className="flex-1">{item.label}</span>
      )}
      {!collapsed && item.badge !== undefined && (
        <span className="flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-medium rounded-full bg-primary-100 text-primary-700 dark:bg-primary-900/50 dark:text-primary-400">
          {item.badge}
        </span>
      )}
    </Link>
  )
}

