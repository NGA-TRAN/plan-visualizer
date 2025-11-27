// CSV Export Utility
// Exports user data to CSV format

import type { User } from '@/types'
import { formatDateISO } from '@/shared/utils/formatters'

/**
 * Converts users array to CSV string
 */
export function usersToCSV(users: User[]): string {
  const headers = ['id', 'name', 'email', 'role', 'status', 'createdAt']
  
  const rows = users.map((user) => [
    user.id,
    // Escape quotes in strings
    `"${user.name.replace(/"/g, '""')}"`,
    `"${user.email.replace(/"/g, '""')}"`,
    user.role,
    user.status,
    formatDateISO(user.createdAt),
  ])

  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.join(',')),
  ].join('\n')

  return csvContent
}

/**
 * Triggers a CSV file download
 */
export function downloadCSV(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  
  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'
  
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  
  URL.revokeObjectURL(url)
}

/**
 * Export users to CSV and trigger download
 */
export function exportUsersToCSV(users: User[]): void {
  const csvContent = usersToCSV(users)
  const date = new Date().toISOString().split('T')[0]
  const filename = `users-export-${date}.csv`
  
  downloadCSV(csvContent, filename)
}

