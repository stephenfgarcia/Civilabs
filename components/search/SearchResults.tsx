'use client'

import { BookOpen, FileText, User, Award } from 'lucide-react'
import SearchResultCard from './SearchResultCard'
import type { SearchResponse } from '@/lib/services'

interface SearchResultsProps {
  results: SearchResponse
  onResultClick: (url: string) => void
}

export default function SearchResults({ results, onResultClick }: SearchResultsProps) {
  return (
    <div className="space-y-8">
      {/* Courses */}
      {results.courses.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="w-5 h-5 text-yellow-600" />
            <h2 className="text-lg font-bold text-gray-800">
              Courses ({results.courses.length})
            </h2>
          </div>
          <div className="space-y-3">
            {results.courses.map((course) => (
              <SearchResultCard
                key={course.id}
                result={course}
                onClick={() => onResultClick(course.url)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Lessons */}
      {results.lessons.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-bold text-gray-800">
              Lessons ({results.lessons.length})
            </h2>
          </div>
          <div className="space-y-3">
            {results.lessons.map((lesson) => (
              <SearchResultCard
                key={lesson.id}
                result={lesson}
                onClick={() => onResultClick(lesson.url)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Instructors */}
      {results.instructors.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <User className="w-5 h-5 text-green-600" />
            <h2 className="text-lg font-bold text-gray-800">
              Instructors ({results.instructors.length})
            </h2>
          </div>
          <div className="space-y-3">
            {results.instructors.map((instructor) => (
              <SearchResultCard
                key={instructor.id}
                result={instructor}
                onClick={() => onResultClick(instructor.url)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Certificates */}
      {results.certificates.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Award className="w-5 h-5 text-purple-600" />
            <h2 className="text-lg font-bold text-gray-800">
              Certificates ({results.certificates.length})
            </h2>
          </div>
          <div className="space-y-3">
            {results.certificates.map((certificate) => (
              <SearchResultCard
                key={certificate.id}
                result={certificate}
                onClick={() => onResultClick(certificate.url)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
