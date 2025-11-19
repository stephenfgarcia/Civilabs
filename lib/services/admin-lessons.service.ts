/**
 * Admin Lessons Service
 * Handles all lesson management operations for instructors and admins
 */

import { apiClient } from './api-client'

export interface AdminLesson {
  id: string
  courseId: string
  title: string
  description?: string | null
  contentType: 'VIDEO' | 'DOCUMENT' | 'SCORM' | 'QUIZ' | 'ASSIGNMENT' | 'TEXT' | 'INTERACTIVE'
  contentUrl?: string | null
  contentData?: any | null
  durationMinutes?: number | null
  order: number
  isRequired: boolean
  allowDownload: boolean
  createdAt: string
  updatedAt: string
  course: {
    id: string
    title: string
    slug: string
    instructorId: string
    instructor: {
      id: string
      firstName: string
      lastName: string
    }
  }
  quiz?: {
    id: string
    title: string
    passingScore: number
    timeLimitMinutes?: number | null
    attemptsAllowed?: number | null
    _count: {
      questions: number
    }
  } | null
  _count: {
    progress: number
  }
}

export interface CreateLessonData {
  courseId: string
  title: string
  description?: string
  contentType: 'VIDEO' | 'DOCUMENT' | 'SCORM' | 'QUIZ' | 'ASSIGNMENT' | 'TEXT' | 'INTERACTIVE'
  contentUrl?: string
  contentData?: any
  durationMinutes?: number
  order?: number
  isRequired?: boolean
  allowDownload?: boolean
}

export interface UpdateLessonData {
  title?: string
  description?: string
  contentType?: 'VIDEO' | 'DOCUMENT' | 'SCORM' | 'QUIZ' | 'ASSIGNMENT' | 'TEXT' | 'INTERACTIVE'
  contentUrl?: string
  contentData?: any
  durationMinutes?: number
  order?: number
  isRequired?: boolean
  allowDownload?: boolean
}

export interface LessonsListResponse {
  success: boolean
  data: AdminLesson[]
  count: number
}

export interface LessonResponse {
  success: boolean
  data: AdminLesson
  message?: string
}

class AdminLessonsService {
  /**
   * Get all lessons with filtering
   */
  async getLessons(params?: {
    courseId?: string
    contentType?: string
    search?: string
  }) {
    try {
      const queryParams = new URLSearchParams()
      if (params?.courseId) queryParams.append('courseId', params.courseId)

      const response = await apiClient.get<LessonsListResponse>(
        `/lessons?${queryParams.toString()}`
      )

      // Client-side filtering
      if (response.success && response.data) {
        let filtered = response.data.data

        // Filter by content type
        if (params?.contentType) {
          filtered = filtered.filter(lesson => lesson.contentType === params.contentType)
        }

        // Filter by search query
        if (params?.search) {
          const searchLower = params.search.toLowerCase()
          filtered = filtered.filter(lesson =>
            lesson.title.toLowerCase().includes(searchLower) ||
            lesson.description?.toLowerCase().includes(searchLower) ||
            lesson.course.title.toLowerCase().includes(searchLower)
          )
        }

        return {
          success: true,
          data: filtered,
          count: filtered.length,
        }
      }

      return response.data || { success: false, data: [], count: 0 }
    } catch (error) {
      console.error('Error fetching lessons:', error)
      return {
        success: false,
        data: [],
        count: 0,
        error: error instanceof Error ? error.message : 'Failed to fetch lessons',
      }
    }
  }

  /**
   * Get lesson by ID
   */
  async getLesson(id: string) {
    try {
      const response = await apiClient.get<LessonResponse>(`/lessons/${id}`)
      return response.data || { success: false, data: null }
    } catch (error) {
      console.error('Error fetching lesson:', error)
      return {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : 'Failed to fetch lesson',
      }
    }
  }

  /**
   * Create lesson (instructor/admin only)
   */
  async createLesson(data: CreateLessonData) {
    try {
      const response = await apiClient.post<LessonResponse>('/lessons', data)
      return response.data || { success: false, data: null }
    } catch (error) {
      console.error('Error creating lesson:', error)
      return {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : 'Failed to create lesson',
      }
    }
  }

  /**
   * Update lesson (instructor/admin only)
   */
  async updateLesson(id: string, data: UpdateLessonData) {
    try {
      const response = await apiClient.put<LessonResponse>(`/lessons/${id}`, data)
      return response.data || { success: false, data: null }
    } catch (error) {
      console.error('Error updating lesson:', error)
      return {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : 'Failed to update lesson',
      }
    }
  }

  /**
   * Delete lesson (instructor/admin only)
   */
  async deleteLesson(id: string) {
    try {
      const response = await apiClient.delete(`/lessons/${id}`)
      return response.data || { success: false }
    } catch (error) {
      console.error('Error deleting lesson:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete lesson',
      }
    }
  }

  /**
   * Reorder lessons in a course
   */
  async reorderLessons(courseId: string, lessonIds: string[]) {
    try {
      // Update each lesson's order
      const promises = lessonIds.map((id, index) =>
        this.updateLesson(id, { order: index + 1 })
      )
      await Promise.all(promises)
      return { success: true }
    } catch (error) {
      console.error('Error reordering lessons:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to reorder lessons',
      }
    }
  }

  /**
   * Get lesson statistics for a course
   */
  async getLessonStats(courseId: string) {
    try {
      const response = await this.getLessons({ courseId })
      if (!response.success) {
        return {
          total: 0,
          byType: {},
          required: 0,
          optional: 0,
          withQuiz: 0,
          totalDuration: 0,
        }
      }

      const stats = {
        total: response.data.length,
        byType: response.data.reduce((acc: Record<string, number>, lesson) => {
          acc[lesson.contentType] = (acc[lesson.contentType] || 0) + 1
          return acc
        }, {}),
        required: response.data.filter(l => l.isRequired).length,
        optional: response.data.filter(l => !l.isRequired).length,
        withQuiz: response.data.filter(l => l.quiz).length,
        totalDuration: response.data.reduce((sum, lesson) => sum + (lesson.durationMinutes || 0), 0),
      }

      return stats
    } catch (error) {
      console.error('Error fetching lesson stats:', error)
      return {
        total: 0,
        byType: {},
        required: 0,
        optional: 0,
        withQuiz: 0,
        totalDuration: 0,
      }
    }
  }

  /**
   * Get content type display name
   */
  getContentTypeLabel(contentType: string): string {
    const labels: Record<string, string> = {
      VIDEO: 'Video',
      DOCUMENT: 'Document',
      SCORM: 'SCORM Package',
      QUIZ: 'Quiz',
      ASSIGNMENT: 'Assignment',
      TEXT: 'Text',
      INTERACTIVE: 'Interactive',
    }
    return labels[contentType] || contentType
  }

  /**
   * Get content type icon
   */
  getContentTypeIcon(contentType: string): string {
    const icons: Record<string, string> = {
      VIDEO: 'play-circle',
      DOCUMENT: 'file-text',
      SCORM: 'package',
      QUIZ: 'help-circle',
      ASSIGNMENT: 'clipboard',
      TEXT: 'align-left',
      INTERACTIVE: 'layers',
    }
    return icons[contentType] || 'file'
  }

  /**
   * Format duration
   */
  formatDuration(minutes?: number | null): string {
    if (!minutes) return 'Not set'
    if (minutes < 60) return `${minutes}m`
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
  }
}

export const adminLessonsService = new AdminLessonsService()
export default adminLessonsService
