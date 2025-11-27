// Navigation Group Component
// Accordion menu group with expandable children

import { useState } from 'react'
import * as LucideIcons from 'lucide-react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/shared/utils/cn'
import { NavItem } from './NavItem'
import type { NavigationItem } from '@/types'

// Dynamic icon component
function NavIcon({ name, className }: { name: string; className?: string }) {
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

export interface NavGroupProps {
  item: NavigationItem
  isActiveRoute: (route?: string) => boolean
  collapsed?: boolean
  defaultOpen?: boolean
}

export function NavGroup({
  item,
  isActiveRoute,
  collapsed,
  defaultOpen = false,
}: NavGroupProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  // Auto-open if any child is active
  const hasActiveChild = item.children?.some((child) => isActiveRoute(child.route))
  const isExpanded = isOpen || hasActiveChild

  if (!item.children || item.children.length === 0) {
    return <NavItem item={item} isActive={isActiveRoute(item.route)} collapsed={collapsed} />
  }

  if (collapsed) {
    // In collapsed mode, show only the icon with a tooltip
    return (
      <div className="relative group">
        <button
          className={cn(
            'flex items-center justify-center w-full p-2 rounded-lg text-gray-700 dark:text-gray-300',
            'hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors'
          )}
          title={item.label}
        >
          <NavIcon name={item.icon} className="w-5 h-5" />
        </button>
        
        {/* Tooltip with children */}
        <div className="absolute left-full top-0 ml-2 hidden group-hover:block z-50">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-1 min-w-[160px]">
            <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
              {item.label}
            </div>
            {item.children.map((child) => (
              <NavItem
                key={child.id}
                item={child}
                isActive={isActiveRoute(child.route)}
              />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <button
        onClick={() => setIsOpen(!isExpanded)}
        className={cn(
          'flex items-center w-full gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
          'hover:bg-gray-100 dark:hover:bg-gray-800',
          hasActiveChild
            ? 'text-gray-900 dark:text-gray-100'
            : 'text-gray-700 dark:text-gray-300'
        )}
      >
        <NavIcon name={item.icon} className="w-5 h-5 flex-shrink-0" />
        <span className="flex-1 text-left">{item.label}</span>
        <ChevronDown
          className={cn(
            'w-4 h-4 transition-transform',
            isExpanded && 'rotate-180'
          )}
        />
      </button>

      {/* Children */}
      <div
        className={cn(
          'overflow-hidden transition-all',
          isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        )}
      >
        <div className="ml-4 mt-1 space-y-1 border-l-2 border-gray-200 dark:border-gray-700 pl-2">
          {item.children.map((child) => (
            <NavItem
              key={child.id}
              item={child}
              isActive={isActiveRoute(child.route)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

