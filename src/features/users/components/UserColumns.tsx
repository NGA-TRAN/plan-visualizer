// User Table Column Definitions
// Defines columns for TanStack Table

import { createColumnHelper } from '@tanstack/react-table'
import { ArrowUpDown, Edit, Trash2 } from 'lucide-react'
import { Button } from '@/shared/components'
import { formatDate } from '@/shared/utils/formatters'
import { cn } from '@/shared/utils/cn'
import type { User, UserRole, UserStatus } from '@/types'

const columnHelper = createColumnHelper<User>()

// Status badge colors
const statusColors: Record<UserStatus, string> = {
  active: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  inactive: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400',
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
}

// Role badge colors
const roleColors: Record<UserRole, string> = {
  admin: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  editor: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  viewer: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400',
}

export function getUserColumns(
  onEdit?: (user: User) => void,
  onDelete?: (user: User) => void
) {
  return [
    columnHelper.accessor('name', {
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          className="-ml-3 h-8"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <img
            src={row.original.avatar}
            alt={row.original.name}
            className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700"
          />
          <div>
            <div className="font-medium text-gray-900 dark:text-gray-100">
              {row.original.name}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {row.original.email}
            </div>
          </div>
        </div>
      ),
    }),
    columnHelper.accessor('email', {
      header: 'Email',
      cell: ({ getValue }) => (
        <span className="text-gray-600 dark:text-gray-300">{getValue()}</span>
      ),
      enableGlobalFilter: true,
    }),
    columnHelper.accessor('role', {
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          className="-ml-3 h-8"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Role
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ getValue }) => {
        const role = getValue()
        return (
          <span
            className={cn(
              'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize',
              roleColors[role]
            )}
          >
            {role}
          </span>
        )
      },
    }),
    columnHelper.accessor('status', {
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          className="-ml-3 h-8"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Status
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ getValue }) => {
        const status = getValue()
        return (
          <span
            className={cn(
              'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize',
              statusColors[status]
            )}
          >
            {status}
          </span>
        )
      },
    }),
    columnHelper.accessor('createdAt', {
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          className="-ml-3 h-8"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Created
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ getValue }) => (
        <span className="text-gray-600 dark:text-gray-300">
          {formatDate(getValue())}
        </span>
      ),
    }),
    columnHelper.display({
      id: 'actions',
      header: () => <span className="sr-only">Actions</span>,
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-2">
          {onEdit && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(row.original)}
              aria-label={`Edit ${row.original.name}`}
            >
              <Edit className="h-4 w-4" />
            </Button>
          )}
          {onDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(row.original)}
              aria-label={`Delete ${row.original.name}`}
              className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      ),
    }),
  ]
}

