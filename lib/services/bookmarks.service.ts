/**
 * Bookmarks API Service
 * Handles course bookmarks
 */

import { apiClient } from './api-client'
import type { Course } from './courses.service'

export interface Bookmark {
  id: string
  userId: string
  courseId: string
  createdAt: Date
  course: Course
}

class BookmarksService {
  /**
   * Get all bookmarked courses
   */
  async getBookmarks(): Promise<Bookmark[]> {
    const response = await apiClient.get<{ bookmarks: Bookmark[] }>('/bookmarks')
    return response.data?.bookmarks || []
  }

  /**
   * Add a course to bookmarks
   */
  async addBookmark(courseId: string): Promise<Bookmark> {
    const response = await apiClient.post<Bookmark>('/bookmarks', { courseId })
    return response.data!
  }

  /**
   * Remove a bookmark
   */
  async removeBookmark(bookmarkId: string): Promise<void> {
    await apiClient.delete(`/bookmarks/${bookmarkId}`)
  }

  /**
   * Check if a course is bookmarked
   */
  async isBookmarked(courseId: string): Promise<boolean> {
    const bookmarks = await this.getBookmarks()
    return bookmarks.some((b) => b.courseId === courseId)
  }

  /**
   * Toggle bookmark status
   */
  async toggleBookmark(courseId: string, bookmarkId?: string): Promise<boolean> {
    if (bookmarkId) {
      await this.removeBookmark(bookmarkId)
      return false
    } else {
      await this.addBookmark(courseId)
      return true
    }
  }
}

export const bookmarksService = new BookmarksService()
export default bookmarksService
