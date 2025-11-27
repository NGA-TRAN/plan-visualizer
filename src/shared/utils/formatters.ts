// Date and Number Formatting Utilities

/**
 * Format a date to a human-readable string
 */
export function formatDate(date: Date | string, options?: Intl.DateTimeFormatOptions): string {
  const d = typeof date === 'string' ? new Date(date) : date
  
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options,
  }
  
  return d.toLocaleDateString('en-US', defaultOptions)
}

/**
 * Format a date to a relative time string (e.g., "2 hours ago")
 */
export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHour = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHour / 24)
  const diffWeek = Math.floor(diffDay / 7)
  const diffMonth = Math.floor(diffDay / 30)

  if (diffSec < 60) {
    return 'just now'
  } else if (diffMin < 60) {
    return `${diffMin} minute${diffMin !== 1 ? 's' : ''} ago`
  } else if (diffHour < 24) {
    return `${diffHour} hour${diffHour !== 1 ? 's' : ''} ago`
  } else if (diffDay < 7) {
    return `${diffDay} day${diffDay !== 1 ? 's' : ''} ago`
  } else if (diffWeek < 4) {
    return `${diffWeek} week${diffWeek !== 1 ? 's' : ''} ago`
  } else if (diffMonth < 12) {
    return `${diffMonth} month${diffMonth !== 1 ? 's' : ''} ago`
  } else {
    return formatDate(d)
  }
}

/**
 * Format a number with commas for thousands
 */
export function formatNumber(num: number): string {
  return num.toLocaleString('en-US')
}

/**
 * Format a number as currency
 */
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount)
}

/**
 * Format a number as a percentage
 */
export function formatPercent(value: number, decimals: number = 1): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(decimals)}%`
}

/**
 * Format bytes to human-readable size
 */
export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`
}

/**
 * Truncate a string to a maximum length
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str
  return `${str.slice(0, maxLength - 3)}...`
}

/**
 * Format a date to ISO string for CSV export
 */
export function formatDateISO(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toISOString()
}

