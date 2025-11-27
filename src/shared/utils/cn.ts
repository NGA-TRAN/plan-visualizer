// Tailwind Class Merge Utility
// Combines clsx and tailwind-merge for conflict-free class merging

import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merges Tailwind CSS classes intelligently, resolving conflicts.
 * 
 * @example
 * cn('px-2 py-1', 'px-4') // => 'py-1 px-4'
 * cn('bg-red-500', condition && 'bg-blue-500') // => 'bg-blue-500' if condition is true
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

