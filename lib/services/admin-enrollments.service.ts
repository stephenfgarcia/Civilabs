/**
 * Admin Enrollments Service
 * Handles all admin enrollment management operations
 */

import { apiClient } from './api-client'

export interface AdminEnrollment {
  id: string
  userId: string
  courseId: string
  status: 'ENROLLED' | 'IN_PROGRESS' | 'COMPLETED' | 'DROPPED' | 'SUSPENDED'
  progressPercentage: number
  enrolledAt: string
  startedAt?: string | null
  completedAt?: string | null
  dueDate?: string | null
  enrollmentType: 'SELF_ENROLLED' | 'ASSIGNED' | 'INVITED'
  assignedBy?: string | null
  createdAt: string
  updatedAt: string
  user: {
    id: string
    firstName: string
    lastName: string
    email: string
    avatarUrl?: string | null
  }
  course: {
    id: string
    title: string
    slug: string
    thumbnail?: string | null
    instructor: {
      id: string
      firstName: string
      lastName: string
    }
    _count: {
      lessons: number
    }
  }
  lessonProgress: Array<{
    id: string
    lessonId: string
  }>
  _count: {
    quizAttempts: number
    userCertificates: number
  }
  totalLessons?: number
  completedLessonsCount?: number
  calculatedProgress?: number
}

export interface EnrollUserData {
  userId: string
  courseId: string
  enrollmentType?: 'SELF_ENROLLED' | 'ASSIGNED' | 'INVITED'
  dueDate?: string | null
}

export interface UpdateEnrollmentData {
  status?: 'ENROLLED' | 'IN_PROGRESS' | 'COMPLETED' | 'DROPPED' | 'SUSPENDED'
  progressPercentage?: number
  dueDate?: string | null
}

export interface EnrollmentsListResponse {
  data: AdminEnrollment[]
  count: number
}

export interface EnrollmentResponse {
  data: AdminEnrollment
  message?: string
}

class AdminEnrollmentsService {
  /**
   * Get all enrollments with filtering
   */
  async getEnrollments(params?: {
    userId?: string
    courseId?: string
    status?: string
    search?: string
  }): Promise<{ success: boolean; data: AdminEnrollment[]; count: number; error?: string }> {
    try {
      const queryParams = new URLSearchParams()
      if (params?.userId) queryParams.append('userId', params.userId)
      if (params?.courseId) queryParams.append('courseId', params.courseId)
      if (params?.status) queryParams.append('status', params.status)

      const response = await apiClient.get<EnrollmentsListResponse>(
        `/enrollments?${queryParams.toString()}`
      )

      if (response.status >= 200 && response.status < 300 && response.data) {
        let items = response.data.data
        let count = response.data.count

        // Client-side search filtering if needed
        if (params?.search) {
          const searchLower = params.search.toLowerCase()
          items = items.filter(enrollment =>
            enrollment.user.firstName.toLowerCase().includes(searchLower) ||
            enrollment.user.lastName.toLowerCase().includes(searchLower) ||
            enrollment.user.email.toLowerCase().includes(searchLower) ||
            enrollment.course.title.toLowerCase().includes(searchLower)
          )
          count = items.length
        }

        return {
          success: true,
          data: items,
          count,
        }
      }

      return {
        success: false,
        data: [],
        count: 0,
        error: response.error || 'Failed to fetch enrollments',
      }
    } catch (error) {
      console.error('Error fetching enrollments:', error)
      return {
        success: false,
        data: [],
        count: 0,
        error: error instanceof Error ? error.message : 'Failed to fetch enrollments',
      }
    }
  }

  /**
   * Get enrollment by ID
   */
  async getEnrollment(id: string): Promise<{ success: boolean; data: AdminEnrollment | null; error?: string }> {
    try {
      const response = await apiClient.get<EnrollmentResponse>(`/enrollments/${id}`)

      if (response.status >= 200 && response.status < 300 && response.data) {
        return {
          success: true,
          data: response.data.data,
        }
      }

      return {
        success: false,
        data: null,
        error: response.error || 'Failed to fetch enrollment',
      }
    } catch (error) {
      console.error('Error fetching enrollment:', error)
      return {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : 'Failed to fetch enrollment',
      }
    }
  }

  /**
   * Enroll user in course (admin can enroll any user)
   */
  async enrollUser(data: EnrollUserData): Promise<{ success: boolean; data: AdminEnrollment | null; error?: string; message?: string }> {
    try {
      const response = await apiClient.post<EnrollmentResponse>('/enrollments', data)

      if (response.status >= 200 && response.status < 300 && response.data) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message,
        }
      }

      return {
        success: false,
        data: null,
        error: response.error || 'Failed to enroll user',
      }
    } catch (error) {
      console.error('Error enrolling user:', error)
      return {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : 'Failed to enroll user',
      }
    }
  }

  /**
   * Update enrollment (admin only)
   */
  async updateEnrollment(id: string, data: UpdateEnrollmentData): Promise<{ success: boolean; data: AdminEnrollment | null; error?: string; message?: string }> {
    try {
      const response = await apiClient.put<EnrollmentResponse>(`/enrollments/${id}`, data)

      if (response.status >= 200 && response.status < 300 && response.data) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message,
        }
      }

      return {
        success: false,
        data: null,
        error: response.error || 'Failed to update enrollment',
      }
    } catch (error) {
      console.error('Error updating enrollment:', error)
      return {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : 'Failed to update enrollment',
      }
    }
  }

  /**
   * Delete enrollment (unenroll user)
   */
  async deleteEnrollment(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await apiClient.delete(`/enrollments/${id}`)

      if (response.status >= 200 && response.status < 300) {
        return { success: true }
      }

      return {
        success: false,
        error: response.error || 'Failed to delete enrollment',
      }
    } catch (error) {
      console.error('Error deleting enrollment:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete enrollment',
      }
    }
  }

  /**
   * Get enrollment statistics
   */
  async getEnrollmentStats() {
    try {
      const response = await this.getEnrollments()
      if (!response.success) {
        return {
          total: 0,
          active: 0,
          completed: 0,
          dropped: 0,
          suspended: 0,
        }
      }

      const stats = {
        total: response.data.length,
        active: response.data.filter(e => e.status === 'ENROLLED' || e.status === 'IN_PROGRESS').length,
        completed: response.data.filter(e => e.status === 'COMPLETED').length,
        dropped: response.data.filter(e => e.status === 'DROPPED').length,
        suspended: response.data.filter(e => e.status === 'SUSPENDED').length,
      }

      return stats
    } catch (error) {
      console.error('Error fetching enrollment stats:', error)
      return {
        total: 0,
        active: 0,
        completed: 0,
        dropped: 0,
        suspended: 0,
      }
    }
  }
}

export const adminEnrollmentsService = new AdminEnrollmentsService()
export default adminEnrollmentsService
