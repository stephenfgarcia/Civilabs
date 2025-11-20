/**
 * Instructor Service
 * Service layer for instructor-related operations
 */

import apiClient from './api-client'

export interface InstructorStats {
  activeCourses: number
  totalStudents: number
  uniqueStudents: number
  avgRating: number
  completionRate: number
}

export interface RecentActivity {
  id: string
  type: string
  student: {
    id: string
    name: string
    email: string
  }
  course: {
    id: string
    title: string
  }
  status: string
  enrolledAt: string
}

export interface TopCourse {
  id: string
  title: string
  students: number
  lessons: number
  completionRate: number
}

export interface InstructorStatsResponse {
  stats: InstructorStats
  recentActivity: RecentActivity[]
  pendingTasks: {
    assignmentsToGrade: number
    discussionsToRespond: number
    quizzesToReview: number
  }
  topCourses: TopCourse[]
}

export interface InstructorCourse {
  id: string
  title: string
  slug: string
  description: string | null
  status: string
  visibility: string
  difficultyLevel: string | null
  durationMinutes: number | null
  thumbnailUrl: string | null
  publishedAt: string | null
  createdAt: string
  updatedAt: string
  category: {
    id: string
    name: string
    slug: string
  } | null
  instructor: {
    id: string
    firstName: string
    lastName: string
    email: string
  }
  metrics: {
    totalEnrollments: number
    activeEnrollments: number
    completedEnrollments: number
    completionRate: number
    totalLessons: number
  }
}

export interface Student {
  id: string
  firstName: string
  lastName: string
  email: string
  avatarUrl: string | null
  department: {
    id: string
    name: string
  } | null
  courses: Array<{
    courseId: string
    courseTitle: string
    courseSlug: string
    status: string
    progress: number
    completedLessons: number
    enrolledAt: string
    completedAt: string | null
  }>
  totalEnrollments: number
  completedCourses: number
  averageProgress: number
}

export interface CourseMetrics {
  courseId: string
  courseTitle: string
  category: string | null
  totalEnrollments: number
  activeEnrollments: number
  completedEnrollments: number
  completionRate: number
  avgTimeSpentHours: number
  totalLessons: number
  lessonCompletionRates: Array<{
    lessonId: string
    lessonTitle: string
    completionRate: number
  }>
}

export interface InstructorAnalytics {
  summary: {
    totalCourses: number
    totalEnrollments: number
    totalCompletions: number
    overallCompletionRate: number
    uniqueStudents: number
    retentionRate: number
  }
  enrollmentTrend: Array<{
    date: string
    enrollments: number
    completions: number
  }>
  courseMetrics: CourseMetrics[]
  period: {
    days: number
    startDate: string
    endDate: string
  }
}

class InstructorService {
  /**
   * Get instructor dashboard statistics
   */
  async getStats(): Promise<InstructorStatsResponse> {
    const response = await apiClient.get<{ data: InstructorStatsResponse }>(
      '/api/instructor/stats'
    )
    return response.data
  }

  /**
   * Get instructor's courses
   */
  async getCourses(params?: {
    status?: string
    search?: string
  }): Promise<{ courses: InstructorCourse[]; total: number }> {
    const queryParams = new URLSearchParams()
    if (params?.status) queryParams.append('status', params.status)
    if (params?.search) queryParams.append('search', params.search)

    const url = `/api/instructor/courses${
      queryParams.toString() ? `?${queryParams.toString()}` : ''
    }`
    const response = await apiClient.get<{
      data: { courses: InstructorCourse[]; total: number }
    }>(url)
    return response.data
  }

  /**
   * Get students enrolled in instructor's courses
   */
  async getStudents(params?: {
    courseId?: string
    search?: string
    status?: string
  }): Promise<{
    students: Student[]
    total: number
    stats: {
      totalStudents: number
      totalEnrollments: number
      activeStudents: number
    }
  }> {
    const queryParams = new URLSearchParams()
    if (params?.courseId) queryParams.append('courseId', params.courseId)
    if (params?.search) queryParams.append('search', params.search)
    if (params?.status) queryParams.append('status', params.status)

    const url = `/api/instructor/students${
      queryParams.toString() ? `?${queryParams.toString()}` : ''
    }`
    const response = await apiClient.get<{
      data: {
        students: Student[]
        total: number
        stats: {
          totalStudents: number
          totalEnrollments: number
          activeStudents: number
        }
      }
    }>(url)
    return response.data
  }

  /**
   * Get instructor analytics
   */
  async getAnalytics(params?: {
    courseId?: string
    period?: string
  }): Promise<InstructorAnalytics> {
    const queryParams = new URLSearchParams()
    if (params?.courseId) queryParams.append('courseId', params.courseId)
    if (params?.period) queryParams.append('period', params.period)

    const url = `/api/instructor/analytics${
      queryParams.toString() ? `?${queryParams.toString()}` : ''
    }`
    const response = await apiClient.get<{ data: InstructorAnalytics }>(url)
    return response.data
  }
}

export const instructorService = new InstructorService()
export default instructorService
