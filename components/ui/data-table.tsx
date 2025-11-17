/**
 * DataTable Component
 * Reusable data table with sorting, filtering, and pagination
 */

'use client'

import { useState, useMemo } from 'react'
import { ChevronUp, ChevronDown, ChevronsUpDown, Search } from 'lucide-react'
import { Input } from './input'
import { Button } from './button'
import { cn } from '@/lib/utils/cn'

export interface Column<T> {
  key: string
  label: string
  sortable?: boolean
  render?: (value: any, row: T) => React.ReactNode
  width?: string
}

export interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  searchable?: boolean
  searchPlaceholder?: string
  onRowClick?: (row: T) => void
  emptyMessage?: string
  className?: string
  striped?: boolean
  hoverable?: boolean
}

type SortDirection = 'asc' | 'desc' | null

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  searchable = false,
  searchPlaceholder = 'Search...',
  onRowClick,
  emptyMessage = 'No data available',
  className,
  striped = true,
  hoverable = true,
}: DataTableProps<T>) {
  const [searchQuery, setSearchQuery] = useState('')
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<SortDirection>(null)

  // Filter data based on search query
  const filteredData = useMemo(() => {
    if (!searchQuery) return data

    return data.filter((row) => {
      return columns.some((column) => {
        const value = row[column.key]
        if (value == null) return false
        return String(value).toLowerCase().includes(searchQuery.toLowerCase())
      })
    })
  }, [data, searchQuery, columns])

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortKey || !sortDirection) return filteredData

    return [...filteredData].sort((a, b) => {
      const aValue = a[sortKey]
      const bValue = b[sortKey]

      if (aValue == null) return 1
      if (bValue == null) return -1

      let comparison = 0
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        comparison = aValue.localeCompare(bValue)
      } else if (typeof aValue === 'number' && typeof bValue === 'number') {
        comparison = aValue - bValue
      } else {
        comparison = String(aValue).localeCompare(String(bValue))
      }

      return sortDirection === 'asc' ? comparison : -comparison
    })
  }, [filteredData, sortKey, sortDirection])

  const handleSort = (columnKey: string) => {
    const column = columns.find((col) => col.key === columnKey)
    if (!column?.sortable) return

    if (sortKey === columnKey) {
      if (sortDirection === 'asc') {
        setSortDirection('desc')
      } else if (sortDirection === 'desc') {
        setSortKey(null)
        setSortDirection(null)
      }
    } else {
      setSortKey(columnKey)
      setSortDirection('asc')
    }
  }

  const getSortIcon = (columnKey: string) => {
    if (sortKey !== columnKey) {
      return <ChevronsUpDown size={16} className="text-neutral-400" />
    }
    if (sortDirection === 'asc') {
      return <ChevronUp size={16} className="text-primary" />
    }
    return <ChevronDown size={16} className="text-primary" />
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Search */}
      {searchable && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" size={20} />
          <Input
            type="text"
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border-2 border-neutral-200">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-neutral-50 to-neutral-100 border-b-2 border-neutral-200">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={cn(
                    'px-6 py-4 text-left text-sm font-black text-neutral-700 uppercase tracking-wider',
                    column.sortable && 'cursor-pointer select-none hover:bg-neutral-200/50',
                    column.width
                  )}
                  onClick={() => handleSort(column.key)}
                  style={{ width: column.width }}
                >
                  <div className="flex items-center gap-2">
                    <span>{column.label}</span>
                    {column.sortable && getSortIcon(column.key)}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-6 py-12 text-center text-neutral-500"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              sortedData.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className={cn(
                    'border-b border-neutral-200',
                    striped && rowIndex % 2 === 0 && 'bg-neutral-50/50',
                    hoverable && 'hover:bg-primary/5 transition-colors',
                    onRowClick && 'cursor-pointer'
                  )}
                  onClick={() => onRowClick?.(row)}
                >
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className="px-6 py-4 text-sm text-neutral-800"
                    >
                      {column.render
                        ? column.render(row[column.key], row)
                        : row[column.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Results count */}
      {sortedData.length > 0 && (
        <div className="text-sm text-neutral-600 font-medium">
          Showing {sortedData.length} of {data.length} results
          {searchQuery && ` for "${searchQuery}"`}
        </div>
      )}
    </div>
  )
}
