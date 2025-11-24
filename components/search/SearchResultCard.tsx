'use client'

import Image from 'next/image'
import { Clock, Users, BookOpen, Calendar } from 'lucide-react'
import type { SearchResult } from '@/lib/services'

interface SearchResultCardProps {
  result: SearchResult
  onClick: () => void
}

export default function SearchResultCard({ result, onClick }: SearchResultCardProps) {
  const getDifficultyColor = (level?: string | null) => {
    if (!level) return 'bg-gray-100 text-gray-700'
    switch (level.toLowerCase()) {
      case 'beginner':
        return 'bg-green-100 text-green-700'
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-700'
      case 'advanced':
        return 'bg-red-100 text-red-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div
      onClick={onClick}
      className="bg-white border-2 border-gray-200 rounded-lg p-4 hover:border-yellow-500 hover:shadow-md transition-all cursor-pointer"
    >
      <div className="flex gap-4">
        {/* Thumbnail/Avatar */}
        {(result.thumbnail || result.avatarUrl) && (
          <div className="flex-shrink-0">
            <div className="w-16 h-16 relative rounded-lg overflow-hidden bg-gray-100">
              <Image
                src={result.thumbnail || result.avatarUrl || ''}
                alt={result.title}
                fill
                className="object-cover"
              />
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Title */}
          <h3 className="text-lg font-bold text-gray-900 mb-1 truncate">{result.title}</h3>

          {/* Description */}
          <p className="text-sm text-gray-600 mb-2 line-clamp-2">{result.description}</p>

          {/* Metadata */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
            {/* Type Badge */}
            <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded font-medium">
              {result.type.charAt(0).toUpperCase() + result.type.slice(1)}
            </span>

            {/* Course-specific metadata */}
            {result.type === 'course' && (
              <>
                {result.difficultyLevel && (
                  <span className={`px-2 py-1 rounded font-medium ${getDifficultyColor(result.difficultyLevel)}`}>
                    {result.difficultyLevel}
                  </span>
                )}
                {result.category && (
                  <span className="flex items-center gap-1">
                    <BookOpen className="w-3 h-3" />
                    {result.category}
                  </span>
                )}
                {result.students !== undefined && (
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {result.students} student{result.students !== 1 ? 's' : ''}
                  </span>
                )}
                {result.duration && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {result.duration}
                  </span>
                )}
              </>
            )}

            {/* Lesson-specific metadata */}
            {result.type === 'lesson' && (
              <>
                {result.contentType && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded font-medium">
                    {result.contentType}
                  </span>
                )}
                {result.duration && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {result.duration}
                  </span>
                )}
              </>
            )}

            {/* Instructor-specific metadata */}
            {result.type === 'instructor' && result.role && (
              <span className="px-2 py-1 bg-green-100 text-green-700 rounded font-medium">
                {result.role}
              </span>
            )}

            {/* Certificate-specific metadata */}
            {result.type === 'certificate' && (
              <>
                {result.verificationCode && (
                  <span className="font-mono text-xs">
                    Code: {result.verificationCode}
                  </span>
                )}
                {result.issuedAt && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Issued {new Date(result.issuedAt).toLocaleDateString()}
                  </span>
                )}
              </>
            )}

            {/* General metadata */}
            {result.metadata && (
              <span className="text-gray-500">{result.metadata}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
