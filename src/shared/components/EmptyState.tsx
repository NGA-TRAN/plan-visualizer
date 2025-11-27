// Empty State Component
// Displays when no data is available

import { type ReactNode } from 'react'
import { Inbox } from 'lucide-react'
import { cn } from '@/shared/utils/cn'

export interface EmptyStateProps {
  icon?: ReactNode
  title?: string
  description?: string
  action?: ReactNode
  className?: string
}

export function EmptyState({
  icon,
  title = 'No data available',
  description = 'There are no items to display at this time.',
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-12 px-4 text-center',
        className
      )}
    >
      <div className="flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-gray-100 dark:bg-gray-800">
        {icon || (
          <Inbox className="w-8 h-8 text-gray-400 dark:text-gray-500" />
        )}
      </div>
      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">
        {title}
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mb-4">
        {description}
      </p>
      {action}
    </div>
  )
}

