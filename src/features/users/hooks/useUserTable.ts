// User Table Hook
// Manages table state: sorting, filtering, pagination using TanStack Table

import { useState, useMemo } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  type SortingState,
  type ColumnFiltersState,
  type PaginationState,
} from '@tanstack/react-table'
import type { User } from '@/types'
import { useUsers } from './useUserSelectors'
import { getUserColumns } from '../components/UserColumns'

export interface UseUserTableOptions {
  initialPageSize?: number
}

export function useUserTable(options: UseUserTableOptions = {}) {
  const { initialPageSize = 10 } = options
  const users = useUsers()

  // Table state
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: initialPageSize,
  })

  // Memoize columns
  const columns = useMemo(() => getUserColumns(), [])

  // Create table instance
  const table = useReactTable<User>({
    data: users,
    columns,
    state: {
      sorting,
      columnFilters,
      globalFilter,
      pagination,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  return {
    table,
    globalFilter,
    setGlobalFilter,
    pagination,
    setPagination,
  }
}

