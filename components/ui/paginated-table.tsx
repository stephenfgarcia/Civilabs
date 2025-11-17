/**
 * PaginatedTable Component
 * Data table with pagination support
 */

'use client'

import { useState, useMemo } from 'react'
import { DataTable, Column } from './data-table'
import { Button } from './button'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

export interface PaginatedTableProps<T> {
  data: T[]
  columns: Column<T>[]
  pageSize?: number
  searchable?: boolean
  searchPlaceholder?: string
  onRowClick?: (row: T) => void
  emptyMessage?: string
  className?: string
  striped?: boolean
  hoverable?: boolean
}

export function PaginatedTable<T extends Record<string, any>>({
  data,
  columns,
  pageSize = 10,
  ...tableProps
}: PaginatedTableProps<T>) {
  const [currentPage, setCurrentPage] = useState(1)

  const totalPages = Math.ceil(data.length / pageSize)

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    const endIndex = startIndex + pageSize
    return data.slice(startIndex, endIndex)
  }, [data, currentPage, pageSize])

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)))
  }

  const goToFirstPage = () => goToPage(1)
  const goToLastPage = () => goToPage(totalPages)
  const goToPreviousPage = () => goToPage(currentPage - 1)
  const goToNextPage = () => goToPage(currentPage + 1)

  // Generate page numbers to display
  const getPageNumbers = () => {
    const delta = 2 // Number of pages to show on each side of current page
    const pages: (number | string)[] = []

    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - delta && i <= currentPage + delta)
      ) {
        pages.push(i)
      } else if (pages[pages.length - 1] !== '...') {
        pages.push('...')
      }
    }

    return pages
  }

  return (
    <div className="space-y-4">
      <DataTable data={paginatedData} columns={columns} {...tableProps} />

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-neutral-600 font-medium">
            Page {currentPage} of {totalPages} ({data.length} total items)
          </div>

          <div className="flex items-center gap-2">
            {/* First Page */}
            <Button
              variant="outline"
              size="sm"
              onClick={goToFirstPage}
              disabled={currentPage === 1}
              className="w-10 h-10 p-0"
            >
              <ChevronsLeft size={16} />
            </Button>

            {/* Previous Page */}
            <Button
              variant="outline"
              size="sm"
              onClick={goToPreviousPage}
              disabled={currentPage === 1}
              className="w-10 h-10 p-0"
            >
              <ChevronLeft size={16} />
            </Button>

            {/* Page Numbers */}
            {getPageNumbers().map((page, index) => (
              <Button
                key={index}
                variant={page === currentPage ? 'default' : 'outline'}
                size="sm"
                onClick={() => typeof page === 'number' && goToPage(page)}
                disabled={typeof page === 'string'}
                className={cn(
                  'w-10 h-10 p-0',
                  page === currentPage && 'bg-gradient-to-r from-primary to-blue-600'
                )}
              >
                {page}
              </Button>
            ))}

            {/* Next Page */}
            <Button
              variant="outline"
              size="sm"
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
              className="w-10 h-10 p-0"
            >
              <ChevronRight size={16} />
            </Button>

            {/* Last Page */}
            <Button
              variant="outline"
              size="sm"
              onClick={goToLastPage}
              disabled={currentPage === totalPages}
              className="w-10 h-10 p-0"
            >
              <ChevronsRight size={16} />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
