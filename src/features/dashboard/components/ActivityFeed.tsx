// Activity Feed Component
// Displays recent activity events

import { 
  UserPlus, 
  UserCog, 
  UserMinus, 
  LogIn, 
  Settings,
  type LucideIcon 
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/components'
import { formatRelativeTime } from '@/shared/utils/formatters'
import { cn } from '@/shared/utils/cn'
import type { Activity, ActivityType } from '@/types'

// Activity type configuration
const activityConfig: Record<ActivityType, { icon: LucideIcon; color: string; bgColor: string }> = {
  user_created: {
    icon: UserPlus,
    color: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-100 dark:bg-green-900/30',
  },
  user_updated: {
    icon: UserCog,
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30',
  },
  user_deleted: {
    icon: UserMinus,
    color: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-100 dark:bg-red-900/30',
  },
  login: {
    icon: LogIn,
    color: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-100 dark:bg-purple-900/30',
  },
  settings_changed: {
    icon: Settings,
    color: 'text-orange-600 dark:text-orange-400',
    bgColor: 'bg-orange-100 dark:bg-orange-900/30',
  },
}

export interface ActivityFeedProps {
  activities: Activity[]
  maxItems?: number
}

export function ActivityFeed({ activities, maxItems = 10 }: ActivityFeedProps) {
  const displayedActivities = activities.slice(0, maxItems)

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {displayedActivities.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
              No recent activity
            </div>
          ) : (
            displayedActivities.map((activity) => {
              const config = activityConfig[activity.type]
              const Icon = config.icon

              return (
                <div
                  key={activity.id}
                  className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={cn(
                        'flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center',
                        config.bgColor
                      )}
                    >
                      <Icon className={cn('w-5 h-5', config.color)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 dark:text-gray-100">
                        {activity.description}
                      </p>
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        {formatRelativeTime(activity.timestamp)}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </CardContent>
    </Card>
  )
}

