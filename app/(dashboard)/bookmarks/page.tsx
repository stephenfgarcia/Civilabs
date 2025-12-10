'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Bookmark as BookmarkIcon, Trash2, BookOpen, Clock, Users } from 'lucide-react'
import { bookmarksService, type Bookmark } from '@/lib/services'
import { useToast } from '@/lib/hooks'

export default function BookmarksPage() {
  const { toast } = useToast()
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadBookmarks()
  }, [])

  const loadBookmarks = async () => {
    setIsLoading(true)
    try {
      const data = await bookmarksService.getBookmarks()
      setBookmarks(data)
    } catch (error) {
      console.error('Failed to load bookmarks:', error)
      toast({
        title: 'Error',
        description: 'Failed to load bookmarks',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemove = async (bookmarkId: string) => {
    const confirmed = window.confirm('Are you sure you want to remove this bookmark?')
    if (!confirmed) return

    try {
      await bookmarksService.removeBookmark(bookmarkId)
      setBookmarks(bookmarks.filter((b) => b.id !== bookmarkId))
      toast({
        title: 'Removed',
        description: 'Bookmark removed successfully',
      })
    } catch (error) {
      console.error('Failed to remove bookmark:', error)
      toast({
        title: 'Error',
        description: 'Failed to remove bookmark',
        variant: 'destructive',
      })
    }
  }

  // Also used for deleted courses
  const handleRemoveBookmark = handleRemove

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Bookmarked Courses</h1>
        <p className="text-gray-600">
          Courses you've saved for later ({bookmarks.length})
        </p>
      </div>

      {bookmarks.length === 0 ? (
        <div className="text-center py-16">
          <BookmarkIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No bookmarks yet</h3>
          <p className="text-gray-500 mb-6">
            Start bookmarking courses to access them quickly later
          </p>
          <Link
            href="/courses"
            className="inline-block bg-yellow-500 hover:bg-yellow-600 text-white font-medium px-6 py-3 rounded-lg transition-colors"
          >
            Browse Courses
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bookmarks.map((bookmark) => (
            <div
              key={bookmark.id}
              className="bg-white rounded-lg border-2 border-gray-200 overflow-hidden hover:border-yellow-500 hover:shadow-lg transition-all"
            >
              {!bookmark.course ? (
                <div className="p-6 text-center">
                  <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                  <p className="text-gray-600 font-semibold">Course Unavailable</p>
                  <p className="text-sm text-gray-500 mt-1">This course has been deleted</p>
                  <button
                    onClick={() => handleRemoveBookmark(bookmark.id)}
                    className="mt-3 text-sm text-red-600 hover:text-red-700 font-semibold"
                  >
                    Remove Bookmark
                  </button>
                </div>
              ) : (
                <>
                  {/* Course Thumbnail */}
                  <Link href={`/courses/${bookmark.courseId}`}>
                    <div className="relative h-48 bg-gray-200">
                      {bookmark.course.thumbnail ? (
                        <Image
                          src={bookmark.course.thumbnail}
                          alt={bookmark.course.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
                          <BookOpen className="w-16 h-16 text-white opacity-50" />
                        </div>
                      )}
                    </div>
                  </Link>

                  {/* Course Info */}
                  <div className="p-4">
                    <Link href={`/courses/${bookmark.courseId}`}>
                      <h3 className="text-lg font-bold text-gray-900 mb-2 hover:text-yellow-600 transition-colors line-clamp-2">
                        {bookmark.course.title}
                      </h3>
                    </Link>

                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {bookmark.course.description}
                    </p>

                    {/* Metadata */}
                    <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                      {bookmark.course.duration && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {bookmark.course.duration}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    Students
                  </span>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Link
                    href={`/courses/${bookmark.courseId}`}
                    className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white text-sm font-medium py-2 rounded-lg text-center transition-colors"
                  >
                    View Course
                  </Link>
                  <button
                    onClick={() => handleRemove(bookmark.id)}
                    className="p-2 border-2 border-gray-300 hover:border-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="Remove bookmark"
                  >
                    <Trash2 className="w-4 h-4 text-gray-600 hover:text-red-600" />
                  </button>
                </div>
              </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
