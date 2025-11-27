// Dashboard Data Hook
// Provides metrics and activities for the dashboard

import { useMetrics, useActivities } from '@/store'

export function useDashboardData() {
  const metrics = useMetrics()
  const activities = useActivities()

  return {
    metrics,
    activities,
    isLoading: false, // Data is always available from seed
  }
}

