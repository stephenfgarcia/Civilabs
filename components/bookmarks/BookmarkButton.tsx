'use client'

import { useState, useEffect } from 'react'
import { Bookmark } from 'lucide-react'
import { bookmarksService } from '@/lib/services'

interface BookmarkButtonProps {
  courseId: string
  variant?: 'icon' | 'button'
}

export default function BookmarkButton({ courseId, variant = 'icon' }: BookmarkButtonProps) {
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [bookmarkId, setBookmarkId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    checkBookmarkStatus()
  }, [courseId])

  const checkBookmarkStatus = async () => {
    try {
      const bookmarks = await bookmarksService.getBookmarks()
      const bookmark = bookmarks.find((b) => b.courseId === courseId)
      setIsBookmarked(!!bookmark)
      setBookmarkId(bookmark?.id || null)
    } catch (error) {
      console.error('Failed to check bookmark status:', error)
    }
  }

  const handleToggle = async () => {
    setIsLoading(true)
    try {
      if (isBookmarked && bookmarkId) {
        await bookmarksService.removeBookmark(bookmarkId)
        setIsBookmarked(false)
        setBookmarkId(null)
      } else {
        const bookmark = await bookmarksService.addBookmark(courseId)
        setIsBookmarked(true)
        setBookmarkId(bookmark.id)
      }
    } catch (error: any) {
      console.error('Failed to toggle bookmark:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (variant === 'button') {
    return (
      <button
        onClick={handleToggle}
        disabled={isLoading}
        className={`px-4 py-2 rounded-lg font-medium transition-all ${
          isBookmarked
            ? 'bg-yellow-100 text-yellow-700 border-2 border-yellow-500'
            : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-yellow-500'
        } disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        <div className="flex items-center gap-2">
          <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-yellow-500' : ''}`} />
          <span>{isBookmarked ? 'Bookmarked' : 'Bookmark'}</span>
        </div>
      </button>
    )
  }

  return (
    <button
      onClick={handleToggle}
      disabled={isLoading}
      className="p-2 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      title={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
    >
      <Bookmark
        className={`w-5 h-5 ${isBookmarked ? 'fill-yellow-500 text-yellow-500' : 'text-gray-600'}`}
      />
    </button>
  )
}
