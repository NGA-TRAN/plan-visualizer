// Metric Card Component
// Displays a KPI summary with value, trend, and change percentage

import { 
  Users, 
  Activity, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Minus,
  type LucideIcon 
} from 'lucide-react'
import { cn } from '@/shared/utils/cn'
import type { MetricCard as MetricCardType, TrendDirection } from '@/types'

// Icon mapping
const iconMap: Record<string, LucideIcon> = {
  users: Users,
  activity: Activity,
  'dollar-sign': DollarSign,
  'trending-up': TrendingUp,
}

// Trend icons and colors
const trendConfig: Record<TrendDirection, { icon: LucideIcon; color: string }> = {
  up: { icon: TrendingUp, color: 'text-green-600 dark:text-green-400' },
  down: { icon: TrendingDown, color: 'text-red-600 dark:text-red-400' },
  neutral: { icon: Minus, color: 'text-gray-500 dark:text-gray-400' },
}

export interface MetricCardProps {
  metric: MetricCardType
}

export function MetricCard({ metric }: MetricCardProps) {
  const Icon = iconMap[metric.icon] || Activity
  const TrendIcon = trendConfig[metric.trend].icon
  const trendColor = trendConfig[metric.trend].color

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {metric.title}
          </p>
          <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-gray-100">
            {metric.value}
          </p>
        </div>
        <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary-100 dark:bg-primary-900/30">
          <Icon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
        </div>
      </div>
      
      <div className="mt-4 flex items-center">
        <TrendIcon className={cn('w-4 h-4 mr-1', trendColor)} />
        <span className={cn('text-sm font-medium', trendColor)}>
          {metric.changePercent >= 0 ? '+' : ''}
          {metric.changePercent.toFixed(1)}%
        </span>
        <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
          from last month
        </span>
      </div>
    </div>
  )
}

