import { describe, it, expect, vi, beforeEach } from 'vitest'
import { adminEnrollmentsService, AdminEnrollment, EnrollUserData, UpdateEnrollmentData } from '@/lib/services/admin-enrollments.service'

// Mock the API client
vi.mock('@/lib/services/api-client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}))

import { apiClient } from '@/lib/services/api-client'

const mockApiClient = apiClient as {
  get: ReturnType<typeof vi.fn>
  post: ReturnType<typeof vi.fn>
  put: ReturnType<typeof vi.fn>
  delete: ReturnType<typeof vi.fn>
}

describe('AdminEnrollmentsService', () => {
  const mockEnrollment: AdminEnrollment = {
    id: '1',
    userId: 'user-1',
    courseId: 'course-1',
    status: 'ENROLLED',
    progressPercentage: 50,
    enrolledAt: '2024-01-01T00:00:00Z',
    enrollmentType: 'SELF_ENROLLED',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    user: {
      id: 'user-1',
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
    },
    course: {
      id: 'course-1',
      title: 'Test Course',
      slug: 'test-course',
      instructor: {
        id: 'instructor-1',
        firstName: 'John',
        lastName: 'Instructor',
      },
      _count: {
        lessons: 10,
      },
    },
    lessonProgress: [],
    _count: {
      quizAttempts: 0,
      userCertificates: 0,
    },
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getEnrollments', () => {
    it('should fetch enrollments successfully', async () => {
      mockApiClient.get.mockResolvedValue({
        status: 200,
        data: {
          data: [mockEnrollment],
          count: 1,
        },
      })

      const result = await adminEnrollmentsService.getEnrollments()

      expect(result.success).toBe(true)
      expect(result.data).toHaveLength(1)
      expect(result.data[0]).toEqual(mockEnrollment)
      expect(result.count).toBe(1)
    })

    it('should filter by userId', async () => {
      mockApiClient.get.mockResolvedValue({
        status: 200,
        data: {
          data: [mockEnrollment],
          count: 1,
        },
      })

      await adminEnrollmentsService.getEnrollments({ userId: 'user-1' })

      expect(mockApiClient.get).toHaveBeenCalledWith(
        expect.stringContaining('userId=user-1')
      )
    })

    it('should filter by courseId', async () => {
      mockApiClient.get.mockResolvedValue({
        status: 200,
        data: {
          data: [mockEnrollment],
          count: 1,
        },
      })

      await adminEnrollmentsService.getEnrollments({ courseId: 'course-1' })

      expect(mockApiClient.get).toHaveBeenCalledWith(
        expect.stringContaining('courseId=course-1')
      )
    })

    it('should filter by status', async () => {
      mockApiClient.get.mockResolvedValue({
        status: 200,
        data: {
          data: [mockEnrollment],
          count: 1,
        },
      })

      await adminEnrollmentsService.getEnrollments({ status: 'ENROLLED' })

      expect(mockApiClient.get).toHaveBeenCalledWith(
        expect.stringContaining('status=ENROLLED')
      )
    })

    it('should perform client-side search filtering', async () => {
      const enrollment2 = {
        ...mockEnrollment,
        id: '2',
        user: { ...mockEnrollment.user, firstName: 'Jane', email: 'jane@example.com' },
      }

      mockApiClient.get.mockResolvedValue({
        status: 200,
        data: {
          data: [mockEnrollment, enrollment2],
          count: 2,
        },
      })

      const result = await adminEnrollmentsService.getEnrollments({ search: 'jane' })

      expect(result.success).toBe(true)
      expect(result.data).toHaveLength(1)
      expect(result.data[0].user.firstName).toBe('Jane')
    })

    it('should search by course title', async () => {
      const enrollment2 = {
        ...mockEnrollment,
        id: '2',
        course: { ...mockEnrollment.course, title: 'Advanced React' },
      }

      mockApiClient.get.mockResolvedValue({
        status: 200,
        data: {
          data: [mockEnrollment, enrollment2],
          count: 2,
        },
      })

      const result = await adminEnrollmentsService.getEnrollments({ search: 'react' })

      expect(result.data).toHaveLength(1)
      expect(result.data[0].course.title).toBe('Advanced React')
    })

    it('should handle API errors', async () => {
      mockApiClient.get.mockResolvedValue({
        status: 500,
        error: 'Server error',
      })

      const result = await adminEnrollmentsService.getEnrollments()

      expect(result.success).toBe(false)
      expect(result.data).toEqual([])
      expect(result.error).toBe('Server error')
    })

    it('should handle network exceptions', async () => {
      mockApiClient.get.mockRejectedValue(new Error('Network error'))

      const result = await adminEnrollmentsService.getEnrollments()

      expect(result.success).toBe(false)
      expect(result.error).toBe('Network error')
    })
  })

  describe('getEnrollment', () => {
    it('should fetch single enrollment successfully', async () => {
      mockApiClient.get.mockResolvedValue({
        status: 200,
        data: {
          data: mockEnrollment,
        },
      })

      const result = await adminEnrollmentsService.getEnrollment('1')

      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockEnrollment)
      expect(mockApiClient.get).toHaveBeenCalledWith('/enrollments/1')
    })

    it('should handle enrollment not found', async () => {
      mockApiClient.get.mockResolvedValue({
        status: 404,
        error: 'Enrollment not found',
      })

      const result = await adminEnrollmentsService.getEnrollment('non-existent')

      expect(result.success).toBe(false)
      expect(result.data).toBeNull()
      expect(result.error).toBe('Enrollment not found')
    })
  })

  describe('enrollUser', () => {
    const enrollData: EnrollUserData = {
      userId: 'user-1',
      courseId: 'course-1',
      enrollmentType: 'ASSIGNED',
    }

    it('should enroll user successfully', async () => {
      mockApiClient.post.mockResolvedValue({
        status: 201,
        data: {
          data: mockEnrollment,
          message: 'User enrolled successfully',
        },
      })

      const result = await adminEnrollmentsService.enrollUser(enrollData)

      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockEnrollment)
      expect(result.message).toBe('User enrolled successfully')
      expect(mockApiClient.post).toHaveBeenCalledWith('/enrollments', enrollData)
    })

    it('should handle duplicate enrollment error', async () => {
      mockApiClient.post.mockResolvedValue({
        status: 400,
        error: 'User already enrolled in this course',
      })

      const result = await adminEnrollmentsService.enrollUser(enrollData)

      expect(result.success).toBe(false)
      expect(result.error).toBe('User already enrolled in this course')
    })

    it('should enroll with due date', async () => {
      const dataWithDueDate: EnrollUserData = {
        ...enrollData,
        dueDate: '2024-12-31',
      }

      mockApiClient.post.mockResolvedValue({
        status: 201,
        data: {
          data: { ...mockEnrollment, dueDate: '2024-12-31' },
        },
      })

      await adminEnrollmentsService.enrollUser(dataWithDueDate)

      expect(mockApiClient.post).toHaveBeenCalledWith('/enrollments', dataWithDueDate)
    })
  })

  describe('updateEnrollment', () => {
    const updateData: UpdateEnrollmentData = {
      status: 'COMPLETED',
      progressPercentage: 100,
    }

    it('should update enrollment successfully', async () => {
      mockApiClient.put.mockResolvedValue({
        status: 200,
        data: {
          data: { ...mockEnrollment, status: 'COMPLETED', progressPercentage: 100 },
          message: 'Enrollment updated',
        },
      })

      const result = await adminEnrollmentsService.updateEnrollment('1', updateData)

      expect(result.success).toBe(true)
      expect(result.data?.status).toBe('COMPLETED')
      expect(result.data?.progressPercentage).toBe(100)
      expect(mockApiClient.put).toHaveBeenCalledWith('/enrollments/1', updateData)
    })

    it('should update due date', async () => {
      const dueDateUpdate: UpdateEnrollmentData = {
        dueDate: '2024-12-31',
      }

      mockApiClient.put.mockResolvedValue({
        status: 200,
        data: {
          data: { ...mockEnrollment, dueDate: '2024-12-31' },
        },
      })

      const result = await adminEnrollmentsService.updateEnrollment('1', dueDateUpdate)

      expect(result.success).toBe(true)
      expect(result.data?.dueDate).toBe('2024-12-31')
    })

    it('should handle update not found error', async () => {
      mockApiClient.put.mockResolvedValue({
        status: 404,
        error: 'Enrollment not found',
      })

      const result = await adminEnrollmentsService.updateEnrollment('non-existent', updateData)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Enrollment not found')
    })
  })

  describe('deleteEnrollment', () => {
    it('should delete enrollment successfully', async () => {
      mockApiClient.delete.mockResolvedValue({
        status: 200,
      })

      const result = await adminEnrollmentsService.deleteEnrollment('1')

      expect(result.success).toBe(true)
      expect(mockApiClient.delete).toHaveBeenCalledWith('/enrollments/1')
    })

    it('should handle delete error', async () => {
      mockApiClient.delete.mockResolvedValue({
        status: 400,
        error: 'Cannot delete completed enrollment',
      })

      const result = await adminEnrollmentsService.deleteEnrollment('1')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Cannot delete completed enrollment')
    })
  })

  describe('getEnrollmentStats', () => {
    it('should calculate enrollment statistics correctly', async () => {
      const enrollments: AdminEnrollment[] = [
        { ...mockEnrollment, id: '1', status: 'ENROLLED' },
        { ...mockEnrollment, id: '2', status: 'IN_PROGRESS' },
        { ...mockEnrollment, id: '3', status: 'COMPLETED' },
        { ...mockEnrollment, id: '4', status: 'DROPPED' },
        { ...mockEnrollment, id: '5', status: 'SUSPENDED' },
      ]

      mockApiClient.get.mockResolvedValue({
        status: 200,
        data: {
          data: enrollments,
          count: 5,
        },
      })

      const stats = await adminEnrollmentsService.getEnrollmentStats()

      expect(stats.total).toBe(5)
      expect(stats.active).toBe(2) // ENROLLED + IN_PROGRESS
      expect(stats.completed).toBe(1)
      expect(stats.dropped).toBe(1)
      expect(stats.suspended).toBe(1)
    })

    it('should return zero stats on error', async () => {
      mockApiClient.get.mockResolvedValue({
        status: 500,
        error: 'Server error',
      })

      const stats = await adminEnrollmentsService.getEnrollmentStats()

      expect(stats.total).toBe(0)
      expect(stats.active).toBe(0)
      expect(stats.completed).toBe(0)
      expect(stats.dropped).toBe(0)
      expect(stats.suspended).toBe(0)
    })
  })
})
