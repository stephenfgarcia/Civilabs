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
  success: boolean
  data: AdminEnrollment[]
  count: number
}

export interface EnrollmentResponse {
  success: boolean
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
  }) {
    try {
      const queryParams = new URLSearchParams()
      if (params?.userId) queryParams.append('userId', params.userId)
      if (params?.courseId) queryParams.append('courseId', params.courseId)
      if (params?.status) queryParams.append('status', params.status)

      const response = await apiClient.get<EnrollmentsListResponse>(
        `/enrollments?${queryParams.toString()}`
      )

      // Client-side search filtering if needed
      if (response.success && params?.search) {
        const searchLower = params.search.toLowerCase()
        response.data = response.data.filter(enrollment =>
          enrollment.user.firstName.toLowerCase().includes(searchLower) ||
          enrollment.user.lastName.toLowerCase().includes(searchLower) ||
          enrollment.user.email.toLowerCase().includes(searchLower) ||
          enrollment.course.title.toLowerCase().includes(searchLower)
        )
        response.count = response.data.length
      }

      return response
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
  async getEnrollment(id: string) {
    try {
      const response = await apiClient.get<EnrollmentResponse>(`/enrollments/${id}`)
      return response
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
  async enrollUser(data: EnrollUserData) {
    try {
      const response = await apiClient.post<EnrollmentResponse>('/enrollments', data)
      return response
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
  async updateEnrollment(id: string, data: UpdateEnrollmentData) {
    try {
      const response = await apiClient.put<EnrollmentResponse>(`/enrollments/${id}`, data)
      return response
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
  async deleteEnrollment(id: string) {
    try {
      const response = await apiClient.delete(`/enrollments/${id}`)
      return response
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
