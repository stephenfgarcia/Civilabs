import { Metadata } from 'next'
import GlobalSearch from '@/components/search/GlobalSearch'

export const metadata: Metadata = {
  title: 'Search | Civilabs LMS',
  description: 'Search for courses, lessons, instructors, and certificates',
}

export default function SearchPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Search</h1>
          <p className="text-gray-600">
            Find courses, lessons, instructors, and certificates across the platform
          </p>
        </div>

        {/* Search Component */}
        <GlobalSearch />
      </div>
    </div>
  )
}
