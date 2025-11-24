'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Search, X, Loader2 } from 'lucide-react'
import { searchService, SearchType } from '@/lib/services'
import SearchResults from './SearchResults'
import type { SearchResponse } from '@/lib/services'

interface GlobalSearchProps {
  onClose?: () => void
  autoFocus?: boolean
}

export default function GlobalSearch({ onClose, autoFocus = true }: GlobalSearchProps) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [searchType, setSearchType] = useState<SearchType>('all')
  const [results, setResults] = useState<SearchResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Debounced search
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (query.trim().length === 0) {
        setResults(null)
        setError(null)
        return
      }

      if (query.trim().length < 2) {
        setError('Please enter at least 2 characters')
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        const searchResults = await searchService.search(query, searchType)
        setResults(searchResults)
      } catch (err) {
        console.error('Search error:', err)
        setError('Failed to search. Please try again.')
      } finally {
        setIsLoading(false)
      }
    }, 300)

    return () => clearTimeout(delayDebounceFn)
  }, [query, searchType])

  const handleClear = useCallback(() => {
    setQuery('')
    setResults(null)
    setError(null)
  }, [])

  const handleResultClick = useCallback(
    (url: string) => {
      router.push(url)
      onClose?.()
    },
    [router, onClose]
  )

  const totalResults = results
    ? results.courses.length +
      results.lessons.length +
      results.instructors.length +
      results.certificates.length
    : 0

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Search Input */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search courses, lessons, instructors, certificates..."
          className="w-full pl-12 pr-12 py-4 text-lg bg-white border-2 border-gray-200 rounded-lg focus:outline-none focus:border-yellow-500 transition-colors"
          autoFocus={autoFocus}
        />
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Clear search"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {[
          { value: 'all', label: 'All Results' },
          { value: 'course', label: 'Courses' },
          { value: 'lesson', label: 'Lessons' },
          { value: 'instructor', label: 'Instructors' },
          { value: 'certificate', label: 'Certificates' },
        ].map((type) => (
          <button
            key={type.value}
            onClick={() => setSearchType(type.value as SearchType)}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
              searchType === type.value
                ? 'bg-yellow-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {type.label}
          </button>
        ))}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-yellow-500 animate-spin" />
          <span className="ml-3 text-gray-600">Searching...</span>
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && query.trim().length >= 2 && totalResults === 0 && (
        <div className="text-center py-12">
          <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No results found</h3>
          <p className="text-gray-500">
            Try searching with different keywords or check your spelling
          </p>
        </div>
      )}

      {/* Results */}
      {!isLoading && !error && results && totalResults > 0 && (
        <SearchResults results={results} onResultClick={handleResultClick} />
      )}

      {/* Result Count */}
      {!isLoading && !error && results && totalResults > 0 && (
        <div className="mt-6 text-center text-sm text-gray-500">
          Found {totalResults} result{totalResults !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  )
}
