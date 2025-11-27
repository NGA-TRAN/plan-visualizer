// Dashboard Page Component
// Composes metric cards, charts, and activity feed

import { MetricCard } from './MetricCard'
import { ChartWidget } from './ChartWidget'
import { ActivityFeed } from './ActivityFeed'
import { useDashboardData } from '../hooks/useDashboardData'

export function Dashboard() {
  const { metrics, activities } = useDashboardData()

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Welcome back! Here's what's happening with your project.
        </p>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric) => (
          <MetricCard key={metric.id} metric={metric} />
        ))}
      </div>

      {/* Charts and Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart - spans 2 columns on large screens */}
        <div className="lg:col-span-2">
          <ChartWidget title="User Growth & Sessions" type="line" />
        </div>

        {/* Activity Feed */}
        <div className="lg:col-span-1">
          <ActivityFeed activities={activities} maxItems={5} />
        </div>
      </div>

      {/* Secondary Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartWidget title="Monthly Revenue" type="bar" />
        <ChartWidget title="Traffic Overview" type="line" />
      </div>
    </div>
  )
}

