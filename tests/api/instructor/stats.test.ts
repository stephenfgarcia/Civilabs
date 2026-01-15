/**
 * Instructor Stats API Integration Tests
 * Tests for /api/instructor/stats endpoint
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

// Mock Prisma
const mockPrisma = {
  course: {
    findMany: vi.fn(),
  },
  enrollment: {
    findMany: vi.fn(),
  },
  assignmentSubmission: {
    count: vi.fn(),
  },
  discussionThread: {
    count: vi.fn(),
  },
  quizAttempt: {
    count: vi.fn(),
  },
}

vi.mock('@/lib/utils/prisma', () => ({
  prisma: mockPrisma,
}))

// Mock auth
vi.mock('@/lib/auth/api-auth', () => ({
  withRole: vi.fn((roles, handler) => {
    return async (request: NextRequest) => {
      // Simulate authenticated user
      const mockUser = { userId: 'instructor-1', role: 'INSTRUCTOR' }
      return handler(request, mockUser)
    }
  }),
}))

describe('/api/instructor/stats', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return instructor statistics', async () => {
    // Mock course data
    mockPrisma.course.findMany.mockResolvedValue([
      {
        id: 'course-1',
        title: 'Test Course',
        enrollments: [
          { userId: 'student-1', status: 'IN_PROGRESS' },
          { userId: 'student-2', status: 'COMPLETED' },
        ],
        reviews: [{ rating: 4 }, { rating: 5 }],
        _count: { enrollments: 2, lessons: 5 },
      },
    ])

    // Mock recent enrollments
    mockPrisma.enrollment.findMany.mockResolvedValue([
      {
        id: 'enroll-1',
        user: { id: 'student-1', firstName: 'John', lastName: 'Doe', email: 'john@test.com' },
        course: { id: 'course-1', title: 'Test Course' },
        status: 'IN_PROGRESS',
        enrolledAt: new Date(),
      },
    ])

    // Mock pending tasks
    mockPrisma.assignmentSubmission.count.mockResolvedValue(3)
    mockPrisma.discussionThread.count.mockResolvedValue(2)
    mockPrisma.quizAttempt.count.mockResolvedValue(1)

    // Import after mocks are set up
    const { GET } = await import('@/app/api/instructor/stats/route')

    const request = new NextRequest('http://localhost:3000/api/instructor/stats')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.data).toHaveProperty('stats')
    expect(data.data).toHaveProperty('recentActivity')
    expect(data.data).toHaveProperty('pendingTasks')
    expect(data.data).toHaveProperty('topCourses')
  })

  it('should calculate average rating correctly', async () => {
    mockPrisma.course.findMany.mockResolvedValue([
      {
        id: 'course-1',
        title: 'Course 1',
        enrollments: [],
        reviews: [{ rating: 5 }, { rating: 4 }, { rating: 3 }],
        _count: { enrollments: 0, lessons: 3 },
      },
    ])

    mockPrisma.enrollment.findMany.mockResolvedValue([])
    mockPrisma.assignmentSubmission.count.mockResolvedValue(0)
    mockPrisma.discussionThread.count.mockResolvedValue(0)
    mockPrisma.quizAttempt.count.mockResolvedValue(0)

    const { GET } = await import('@/app/api/instructor/stats/route')

    const request = new NextRequest('http://localhost:3000/api/instructor/stats')
    const response = await GET(request)
    const data = await response.json()

    // Average of [5, 4, 3] = 4.0
    expect(data.data.stats.avgRating).toBe(4)
  })

  it('should calculate completion rate correctly', async () => {
    mockPrisma.course.findMany.mockResolvedValue([
      {
        id: 'course-1',
        title: 'Course 1',
        enrollments: [
          { userId: 'student-1', status: 'COMPLETED' },
          { userId: 'student-2', status: 'COMPLETED' },
          { userId: 'student-3', status: 'IN_PROGRESS' },
          { userId: 'student-4', status: 'ENROLLED' },
        ],
        reviews: [],
        _count: { enrollments: 4, lessons: 10 },
      },
    ])

    mockPrisma.enrollment.findMany.mockResolvedValue([])
    mockPrisma.assignmentSubmission.count.mockResolvedValue(0)
    mockPrisma.discussionThread.count.mockResolvedValue(0)
    mockPrisma.quizAttempt.count.mockResolvedValue(0)

    const { GET } = await import('@/app/api/instructor/stats/route')

    const request = new NextRequest('http://localhost:3000/api/instructor/stats')
    const response = await GET(request)
    const data = await response.json()

    // 2 completed out of 4 = 50%
    expect(data.data.stats.completionRate).toBe(50)
  })

  it('should count unique students correctly', async () => {
    mockPrisma.course.findMany.mockResolvedValue([
      {
        id: 'course-1',
        title: 'Course 1',
        enrollments: [
          { userId: 'student-1', status: 'IN_PROGRESS' },
          { userId: 'student-2', status: 'COMPLETED' },
        ],
        reviews: [],
        _count: { enrollments: 2, lessons: 5 },
      },
      {
        id: 'course-2',
        title: 'Course 2',
        enrollments: [
          { userId: 'student-1', status: 'IN_PROGRESS' }, // Same student
          { userId: 'student-3', status: 'IN_PROGRESS' },
        ],
        reviews: [],
        _count: { enrollments: 2, lessons: 3 },
      },
    ])

    mockPrisma.enrollment.findMany.mockResolvedValue([])
    mockPrisma.assignmentSubmission.count.mockResolvedValue(0)
    mockPrisma.discussionThread.count.mockResolvedValue(0)
    mockPrisma.quizAttempt.count.mockResolvedValue(0)

    const { GET } = await import('@/app/api/instructor/stats/route')

    const request = new NextRequest('http://localhost:3000/api/instructor/stats')
    const response = await GET(request)
    const data = await response.json()

    // Total students = 4, unique = 3 (student-1 enrolled in both)
    expect(data.data.stats.totalStudents).toBe(4)
    expect(data.data.stats.uniqueStudents).toBe(3)
  })

  it('should include course-specific ratings in top courses', async () => {
    mockPrisma.course.findMany.mockResolvedValue([
      {
        id: 'course-1',
        title: 'Popular Course',
        enrollments: [
          { userId: 'student-1', status: 'COMPLETED' },
          { userId: 'student-2', status: 'COMPLETED' },
        ],
        reviews: [{ rating: 5 }, { rating: 5 }], // Average 5.0
        _count: { enrollments: 2, lessons: 10 },
      },
      {
        id: 'course-2',
        title: 'Other Course',
        enrollments: [{ userId: 'student-3', status: 'IN_PROGRESS' }],
        reviews: [{ rating: 3 }], // Average 3.0
        _count: { enrollments: 1, lessons: 5 },
      },
    ])

    mockPrisma.enrollment.findMany.mockResolvedValue([])
    mockPrisma.assignmentSubmission.count.mockResolvedValue(0)
    mockPrisma.discussionThread.count.mockResolvedValue(0)
    mockPrisma.quizAttempt.count.mockResolvedValue(0)

    const { GET } = await import('@/app/api/instructor/stats/route')

    const request = new NextRequest('http://localhost:3000/api/instructor/stats')
    const response = await GET(request)
    const data = await response.json()

    // Each top course should have its own rating
    const topCourse = data.data.topCourses[0]
    expect(topCourse).toHaveProperty('rating')
    expect(topCourse.rating).toBe(5) // Course 1 has rating 5.0
  })

  it('should count quizzes to review', async () => {
    mockPrisma.course.findMany.mockResolvedValue([
      {
        id: 'course-1',
        title: 'Course',
        enrollments: [],
        reviews: [],
        _count: { enrollments: 0, lessons: 5 },
      },
    ])

    mockPrisma.enrollment.findMany.mockResolvedValue([])
    mockPrisma.assignmentSubmission.count.mockResolvedValue(0)
    mockPrisma.discussionThread.count.mockResolvedValue(0)
    mockPrisma.quizAttempt.count.mockResolvedValue(5) // 5 quiz attempts need review

    const { GET } = await import('@/app/api/instructor/stats/route')

    const request = new NextRequest('http://localhost:3000/api/instructor/stats')
    const response = await GET(request)
    const data = await response.json()

    expect(data.data.pendingTasks.quizzesToReview).toBe(5)
  })

  it('should handle empty data gracefully', async () => {
    mockPrisma.course.findMany.mockResolvedValue([])
    mockPrisma.enrollment.findMany.mockResolvedValue([])
    mockPrisma.assignmentSubmission.count.mockResolvedValue(0)
    mockPrisma.discussionThread.count.mockResolvedValue(0)
    mockPrisma.quizAttempt.count.mockResolvedValue(0)

    const { GET } = await import('@/app/api/instructor/stats/route')

    const request = new NextRequest('http://localhost:3000/api/instructor/stats')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.data.stats.activeCourses).toBe(0)
    expect(data.data.stats.totalStudents).toBe(0)
    expect(data.data.stats.avgRating).toBe(0)
    expect(data.data.stats.completionRate).toBe(0)
  })

  it('should handle database errors', async () => {
    mockPrisma.course.findMany.mockRejectedValue(new Error('Database connection failed'))

    const { GET } = await import('@/app/api/instructor/stats/route')

    const request = new NextRequest('http://localhost:3000/api/instructor/stats')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.success).toBe(false)
    expect(data.error).toBeDefined()
  })
})
