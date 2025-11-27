// Chart Widget Component
// Interactive chart using Recharts

import { useMemo } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts'
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/components'

// Generate sample chart data
function generateChartData() {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul']
  return months.map((month) => ({
    name: month,
    users: Math.floor(Math.random() * 500) + 200,
    revenue: Math.floor(Math.random() * 10000) + 5000,
    sessions: Math.floor(Math.random() * 1000) + 300,
  }))
}

export type ChartType = 'line' | 'bar'

export interface ChartWidgetProps {
  title?: string
  type?: ChartType
}

export function ChartWidget({ 
  title = 'Overview', 
  type = 'line' 
}: ChartWidgetProps) {
  const data = useMemo(() => generateChartData(), [])

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
            {type === 'line' ? (
              <LineChart data={data}>
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke="currentColor" 
                  className="text-gray-200 dark:text-gray-700" 
                />
                <XAxis 
                  dataKey="name" 
                  stroke="currentColor"
                  className="text-gray-500 dark:text-gray-400"
                  fontSize={12}
                />
                <YAxis 
                  stroke="currentColor"
                  className="text-gray-500 dark:text-gray-400"
                  fontSize={12}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--tooltip-bg, #fff)',
                    borderColor: 'var(--tooltip-border, #e5e7eb)',
                    borderRadius: '0.5rem',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="users"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ fill: '#3b82f6', strokeWidth: 2 }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="sessions"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={{ fill: '#10b981', strokeWidth: 2 }}
                />
              </LineChart>
            ) : (
              <BarChart data={data}>
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke="currentColor"
                  className="text-gray-200 dark:text-gray-700"
                />
                <XAxis 
                  dataKey="name" 
                  stroke="currentColor"
                  className="text-gray-500 dark:text-gray-400"
                  fontSize={12}
                />
                <YAxis 
                  stroke="currentColor"
                  className="text-gray-500 dark:text-gray-400"
                  fontSize={12}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--tooltip-bg, #fff)',
                    borderColor: 'var(--tooltip-border, #e5e7eb)',
                    borderRadius: '0.5rem',
                  }}
                />
                <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

