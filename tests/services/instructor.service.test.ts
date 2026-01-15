/**
 * Instructor Service Unit Tests
 * Tests for the instructor service layer
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Mock the api-client module before importing the service
vi.mock('@/lib/services/api-client', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}))

import apiClient from '@/lib/services/api-client'
import instructorService from '@/lib/services/instructor.service'

describe('InstructorService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('getStats', () => {
    it('should fetch instructor stats from API', async () => {
      const mockStats = {
        stats: {
          activeCourses: 5,
          totalStudents: 100,
          uniqueStudents: 85,
          avgRating: 4.5,
          completionRate: 72,
        },
        recentActivity: [],
        pendingTasks: {
          assignmentsToGrade: 3,
          discussionsToRespond: 2,
          quizzesToReview: 1,
        },
        topCourses: [],
      }

      vi.mocked(apiClient.get).mockResolvedValue({
        data: { data: mockStats },
        status: 200,
      })

      const result = await instructorService.getStats()

      expect(apiClient.get).toHaveBeenCalledWith('/api/instructor/stats')
      expect(result).toEqual(mockStats)
    })

    it('should handle API errors', async () => {
      vi.mocked(apiClient.get).mockRejectedValue(new Error('Network error'))

      await expect(instructorService.getStats()).rejects.toThrow('Network error')
    })
  })

  describe('getCourses', () => {
    it('should fetch instructor courses without filters', async () => {
      const mockCourses = {
        courses: [
          { id: 'course-1', title: 'Course 1', status: 'PUBLISHED' },
          { id: 'course-2', title: 'Course 2', status: 'DRAFT' },
        ],
        total: 2,
      }

      vi.mocked(apiClient.get).mockResolvedValue({
        data: { data: mockCourses },
        status: 200,
      })

      const result = await instructorService.getCourses()

      expect(apiClient.get).toHaveBeenCalledWith('/api/instructor/courses')
      expect(result).toEqual(mockCourses)
    })

    it('should fetch courses with status filter', async () => {
      const mockCourses = {
        courses: [{ id: 'course-1', title: 'Course 1', status: 'PUBLISHED' }],
        total: 1,
      }

      vi.mocked(apiClient.get).mockResolvedValue({
        data: { data: mockCourses },
        status: 200,
      })

      await instructorService.getCourses({ status: 'PUBLISHED' })

      expect(apiClient.get).toHaveBeenCalledWith('/api/instructor/courses?status=PUBLISHED')
    })

    it('should fetch courses with search filter', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({
        data: { data: { courses: [], total: 0 } },
        status: 200,
      })

      await instructorService.getCourses({ search: 'safety' })

      expect(apiClient.get).toHaveBeenCalledWith('/api/instructor/courses?search=safety')
    })

    it('should fetch courses with multiple filters', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({
        data: { data: { courses: [], total: 0 } },
        status: 200,
      })

      await instructorService.getCourses({ status: 'PUBLISHED', search: 'test' })

      expect(apiClient.get).toHaveBeenCalledWith('/api/instructor/courses?status=PUBLISHED&search=test')
    })
  })

  describe('getStudents', () => {
    it('should fetch students without filters', async () => {
      const mockData = {
        students: [],
        total: 0,
        stats: { totalStudents: 0, totalEnrollments: 0, activeStudents: 0 },
      }

      vi.mocked(apiClient.get).mockResolvedValue({
        data: { data: mockData },
        status: 200,
      })

      const result = await instructorService.getStudents()

      expect(apiClient.get).toHaveBeenCalledWith('/api/instructor/students')
      expect(result).toEqual(mockData)
    })

    it('should fetch students with course filter', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({
        data: { data: { students: [], total: 0, stats: {} } },
        status: 200,
      })

      await instructorService.getStudents({ courseId: 'course-123' })

      expect(apiClient.get).toHaveBeenCalledWith('/api/instructor/students?courseId=course-123')
    })

    it('should fetch students with search', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({
        data: { data: { students: [], total: 0, stats: {} } },
        status: 200,
      })

      await instructorService.getStudents({ search: 'john' })

      expect(apiClient.get).toHaveBeenCalledWith('/api/instructor/students?search=john')
    })
  })

  describe('getAnalytics', () => {
    it('should fetch analytics without filters', async () => {
      const mockAnalytics = {
        summary: {
          totalCourses: 3,
          totalEnrollments: 150,
          totalCompletions: 75,
          overallCompletionRate: 50,
          uniqueStudents: 120,
          retentionRate: 65,
        },
        enrollmentTrend: [],
        courseMetrics: [],
        period: { days: 30, startDate: '', endDate: '' },
      }

      vi.mocked(apiClient.get).mockResolvedValue({
        data: { data: mockAnalytics },
        status: 200,
      })

      const result = await instructorService.getAnalytics()

      expect(apiClient.get).toHaveBeenCalledWith('/api/instructor/analytics')
      expect(result).toEqual(mockAnalytics)
    })

    it('should fetch analytics with period filter', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({
        data: { data: {} },
        status: 200,
      })

      await instructorService.getAnalytics({ period: '7' })

      expect(apiClient.get).toHaveBeenCalledWith('/api/instructor/analytics?period=7')
    })

    it('should fetch analytics for specific course', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({
        data: { data: {} },
        status: 200,
      })

      await instructorService.getAnalytics({ courseId: 'course-1', period: '30' })

      expect(apiClient.get).toHaveBeenCalledWith('/api/instructor/analytics?courseId=course-1&period=30')
    })
  })

  describe('getAssignments', () => {
    it('should fetch assignments', async () => {
      const mockAssignments = {
        assignments: [
          {
            id: 'assign-1',
            title: 'Assignment 1',
            status: 'PUBLISHED',
            courseId: 'course-1',
            courseName: 'Test Course',
          },
        ],
        stats: { total: 1, published: 1, overdue: 0, pendingGrading: 0 },
      }

      vi.mocked(apiClient.get).mockResolvedValue({
        data: { data: mockAssignments },
        status: 200,
      })

      const result = await instructorService.getAssignments()

      expect(apiClient.get).toHaveBeenCalledWith('/api/instructor/assignments')
      expect(result).toEqual(mockAssignments)
    })

    it('should filter assignments by status', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({
        data: { data: { assignments: [], stats: {} } },
        status: 200,
      })

      await instructorService.getAssignments({ status: 'DRAFT' })

      expect(apiClient.get).toHaveBeenCalledWith('/api/instructor/assignments?status=DRAFT')
    })
  })

  describe('getAssignmentById', () => {
    it('should fetch single assignment with submissions', async () => {
      const mockAssignment = {
        id: 'assign-1',
        title: 'Test Assignment',
        submissions: [
          { id: 'sub-1', status: 'SUBMITTED', grade: null },
        ],
        _count: { submissions: 1 },
      }

      vi.mocked(apiClient.get).mockResolvedValue({
        data: { data: mockAssignment },
        status: 200,
      })

      const result = await instructorService.getAssignmentById('assign-1')

      expect(apiClient.get).toHaveBeenCalledWith('/api/instructor/assignments/assign-1')
      expect(result).toEqual(mockAssignment)
    })
  })

  describe('gradeSubmission', () => {
    it('should grade a submission', async () => {
      const mockSubmission = {
        id: 'sub-1',
        grade: 85,
        feedback: 'Good work!',
        status: 'GRADED',
      }

      vi.mocked(apiClient.patch).mockResolvedValue({
        data: { data: mockSubmission },
        status: 200,
      })

      const result = await instructorService.gradeSubmission('assign-1', 'sub-1', {
        grade: 85,
        feedback: 'Good work!',
      })

      expect(apiClient.patch).toHaveBeenCalledWith(
        '/api/instructor/assignments/assign-1/submissions/sub-1',
        { grade: 85, feedback: 'Good work!' }
      )
      expect(result).toEqual(mockSubmission)
    })

    it('should grade submission without feedback', async () => {
      vi.mocked(apiClient.patch).mockResolvedValue({
        data: { data: { id: 'sub-1', grade: 100, status: 'GRADED' } },
        status: 200,
      })

      await instructorService.gradeSubmission('assign-1', 'sub-1', { grade: 100 })

      expect(apiClient.patch).toHaveBeenCalledWith(
        '/api/instructor/assignments/assign-1/submissions/sub-1',
        { grade: 100 }
      )
    })
  })

  describe('getDiscussions', () => {
    it('should fetch discussions', async () => {
      const mockDiscussions = {
        discussions: [],
        stats: { total: 0, flagged: 0, solved: 0, unsolved: 0 },
      }

      vi.mocked(apiClient.get).mockResolvedValue({
        data: { data: mockDiscussions },
        status: 200,
      })

      const result = await instructorService.getDiscussions()

      expect(apiClient.get).toHaveBeenCalledWith('/api/instructor/discussions')
      expect(result).toEqual(mockDiscussions)
    })

    it('should filter discussions by status', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({
        data: { data: { discussions: [], stats: {} } },
        status: 200,
      })

      await instructorService.getDiscussions({ status: 'flagged' })

      expect(apiClient.get).toHaveBeenCalledWith('/api/instructor/discussions?status=flagged')
    })
  })

  describe('updateDiscussion', () => {
    it('should mark discussion as solved', async () => {
      vi.mocked(apiClient.patch).mockResolvedValue({
        data: { data: { id: 'disc-1', isSolved: true } },
        status: 200,
      })

      await instructorService.updateDiscussion('disc-1', { isSolved: true })

      expect(apiClient.patch).toHaveBeenCalledWith(
        '/api/instructor/discussions/disc-1',
        { isSolved: true }
      )
    })

    it('should pin discussion', async () => {
      vi.mocked(apiClient.patch).mockResolvedValue({
        data: { data: { id: 'disc-1', isPinned: true } },
        status: 200,
      })

      await instructorService.updateDiscussion('disc-1', { isPinned: true })

      expect(apiClient.patch).toHaveBeenCalledWith(
        '/api/instructor/discussions/disc-1',
        { isPinned: true }
      )
    })

    it('should lock discussion', async () => {
      vi.mocked(apiClient.patch).mockResolvedValue({
        data: { data: { id: 'disc-1', isLocked: true } },
        status: 200,
      })

      await instructorService.updateDiscussion('disc-1', { isLocked: true })

      expect(apiClient.patch).toHaveBeenCalledWith(
        '/api/instructor/discussions/disc-1',
        { isLocked: true }
      )
    })

    it('should update multiple flags at once', async () => {
      vi.mocked(apiClient.patch).mockResolvedValue({
        data: { data: { id: 'disc-1', isPinned: true, isSolved: true } },
        status: 200,
      })

      await instructorService.updateDiscussion('disc-1', { isPinned: true, isSolved: true })

      expect(apiClient.patch).toHaveBeenCalledWith(
        '/api/instructor/discussions/disc-1',
        { isPinned: true, isSolved: true }
      )
    })
  })

  describe('getCertificates', () => {
    it('should fetch certificates', async () => {
      const mockCertificates = {
        certificates: [],
        total: 0,
      }

      vi.mocked(apiClient.get).mockResolvedValue({
        data: { data: mockCertificates },
        status: 200,
      })

      const result = await instructorService.getCertificates()

      expect(apiClient.get).toHaveBeenCalledWith('/api/instructor/certificates')
      expect(result).toEqual(mockCertificates)
    })
  })

  describe('getStudentById', () => {
    it('should fetch student details', async () => {
      const mockStudent = {
        student: { id: 'student-1', firstName: 'John', lastName: 'Doe' },
        enrollments: [],
        quizAttempts: [],
        certificates: [],
        recentActivity: { discussions: [], reviews: [] },
        stats: {},
      }

      vi.mocked(apiClient.get).mockResolvedValue({
        data: { data: mockStudent },
        status: 200,
      })

      const result = await instructorService.getStudentById('student-1')

      expect(apiClient.get).toHaveBeenCalledWith('/api/instructor/students/student-1')
      expect(result).toEqual(mockStudent)
    })
  })

  describe('sendBulkEmail', () => {
    it('should send bulk email to specific students', async () => {
      vi.mocked(apiClient.post).mockResolvedValue({
        data: {
          data: {
            success: true,
            message: 'Emails sent successfully',
            sentCount: 3,
          },
        },
        status: 200,
      })

      const result = await instructorService.sendBulkEmail({
        studentIds: ['student-1', 'student-2', 'student-3'],
        subject: 'Important Update',
        message: 'Please check the new assignment.',
      })

      expect(apiClient.post).toHaveBeenCalledWith(
        '/api/instructor/students/bulk-email',
        {
          studentIds: ['student-1', 'student-2', 'student-3'],
          subject: 'Important Update',
          message: 'Please check the new assignment.',
        }
      )
      expect(result.sentCount).toBe(3)
    })

    it('should send bulk email to all students in a course', async () => {
      vi.mocked(apiClient.post).mockResolvedValue({
        data: {
          data: {
            success: true,
            message: 'Emails sent successfully',
            sentCount: 50,
          },
        },
        status: 200,
      })

      await instructorService.sendBulkEmail({
        courseId: 'course-1',
        subject: 'Course Update',
        message: 'New material added.',
      })

      expect(apiClient.post).toHaveBeenCalledWith(
        '/api/instructor/students/bulk-email',
        {
          courseId: 'course-1',
          subject: 'Course Update',
          message: 'New material added.',
        }
      )
    })
  })
})
