/**
 * Progress Service
 * Handles lesson progress tracking and enrollment progress calculation
 */

import { apiClient } from './api-client'

export interface LessonProgress {
  id: string
  enrollmentId: string
  lessonId: string
  userId: string
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED'
  startedAt?: string | null
  completedAt?: string | null
  timeSpentSeconds: number
  lastPosition?: number | null
  attempts: number
  createdAt: string
  updatedAt: string
  lesson: {
    id: string
    title: string
    contentType: string
    durationMinutes?: number | null
    order: number
    courseId: string
    course: {
      id: string
      title: string
      slug: string
    }
  }
  enrollment: {
    id: string
    courseId: string
    status: string
    progressPercentage: number
  }
}

export interface UpdateProgressData {
  enrollmentId: string
  lessonId: string
  status?: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED'
  timeSpentSeconds?: number
  lastPosition?: number
}

export interface ProgressResponse {
  success: boolean
  data: LessonProgress
  enrollment?: {
    progressPercentage: number
    status: string
    completedLessons: number
    totalLessons: number
  }
  message?: string
}

export interface ProgressListResponse {
  success: boolean
  data: LessonProgress[]
  count: number
}

class ProgressService {
  /**
   * Get lesson progress for current user
   */
  async getProgress(params?: {
    enrollmentId?: string
    lessonId?: string
    courseId?: string
  }) {
    try {
      const queryParams = new URLSearchParams()
      if (params?.enrollmentId) queryParams.append('enrollmentId', params.enrollmentId)
      if (params?.lessonId) queryParams.append('lessonId', params.lessonId)
      if (params?.courseId) queryParams.append('courseId', params.courseId)

      const queryString = queryParams.toString()
      const endpoint = queryString ? `/progress?${queryString}` : '/progress'

      const response = await apiClient.get<ProgressListResponse>(endpoint)

      return response.data || { success: false, data: [], count: 0 }
    } catch (error) {
      console.error('Error fetching progress:', error)
      return {
        success: false,
        data: [],
        count: 0,
        error: error instanceof Error ? error.message : 'Failed to fetch progress',
      }
    }
  }

  /**
   * Update lesson progress
   */
  async updateProgress(data: UpdateProgressData) {
    try {
      const response = await apiClient.post<ProgressResponse>('/progress', data)
      return response.data || { success: false, data: null }
    } catch (error) {
      console.error('Error updating progress:', error)
      return {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : 'Failed to update progress',
      }
    }
  }

  /**
   * Mark lesson as started
   */
  async startLesson(enrollmentId: string, lessonId: string) {
    return this.updateProgress({
      enrollmentId,
      lessonId,
      status: 'IN_PROGRESS',
    })
  }

  /**
   * Mark lesson as completed
   */
  async completeLesson(enrollmentId: string, lessonId: string) {
    return this.updateProgress({
      enrollmentId,
      lessonId,
      status: 'COMPLETED',
    })
  }

  /**
   * Update video/content position
   */
  async updatePosition(enrollmentId: string, lessonId: string, position: number, timeSpent: number = 0) {
    return this.updateProgress({
      enrollmentId,
      lessonId,
      lastPosition: position,
      timeSpentSeconds: timeSpent,
    })
  }

  /**
   * Calculate course completion percentage
   */
  calculateCourseProgress(progressItems: LessonProgress[]): {
    total: number
    completed: number
    inProgress: number
    notStarted: number
    percentage: number
  } {
    const total = progressItems.length
    const completed = progressItems.filter(p => p.status === 'COMPLETED').length
    const inProgress = progressItems.filter(p => p.status === 'IN_PROGRESS').length
    const notStarted = progressItems.filter(p => p.status === 'NOT_STARTED').length
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0

    return {
      total,
      completed,
      inProgress,
      notStarted,
      percentage,
    }
  }

  /**
   * Get next lesson to complete
   */
  getNextLesson(progressItems: LessonProgress[]): LessonProgress | null {
    // Sort by lesson order
    const sorted = [...progressItems].sort((a, b) => a.lesson.order - b.lesson.order)

    // Find first incomplete lesson
    const nextLesson = sorted.find(p => p.status !== 'COMPLETED')

    return nextLesson || null
  }

  /**
   * Format time spent in human-readable format
   */
  formatTimeSpent(seconds: number): string {
    if (seconds < 60) return `${seconds}s`

    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m`

    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60

    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`
  }

  /**
   * Calculate estimated time remaining
   */
  estimateTimeRemaining(progressItems: LessonProgress[]): number {
    const incompleteLessons = progressItems.filter(p => p.status !== 'COMPLETED')
    const totalMinutes = incompleteLessons.reduce(
      (sum, p) => sum + (p.lesson.durationMinutes || 0),
      0
    )
    return totalMinutes
  }

  /**
   * Get progress status color
   */
  getProgressColor(percentage: number): string {
    if (percentage === 0) return 'gray'
    if (percentage < 25) return 'red'
    if (percentage < 50) return 'orange'
    if (percentage < 75) return 'yellow'
    if (percentage < 100) return 'blue'
    return 'green'
  }

  /**
   * Get lesson status badge info
   */
  getStatusBadge(status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED'): {
    label: string
    color: string
    icon: string
  } {
    const badges = {
      NOT_STARTED: {
        label: 'Not Started',
        color: 'gray',
        icon: 'circle',
      },
      IN_PROGRESS: {
        label: 'In Progress',
        color: 'blue',
        icon: 'play-circle',
      },
      COMPLETED: {
        label: 'Completed',
        color: 'green',
        icon: 'check-circle',
      },
    }

    return badges[status]
  }
}

export const progressService = new ProgressService()
export default progressService
