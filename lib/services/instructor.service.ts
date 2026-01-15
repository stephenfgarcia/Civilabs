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
  rating: number
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

// Assignment types
export interface Assignment {
  id: string
  title: string
  description: string | null
  instructions: string
  courseId: string
  courseName: string
  status: 'DRAFT' | 'PUBLISHED' | 'CLOSED' | 'ARCHIVED'
  dueDate: string | null
  maxPoints: number
  allowLateSubmission: boolean
  attachmentUrl: string | null
  totalSubmissions: number
  pendingSubmissions: number
  createdAt: string
  publishedAt: string | null
}

export interface AssignmentSubmission {
  id: string
  assignmentId: string
  userId: string
  content: string | null
  fileUrl: string | null
  status: 'NOT_SUBMITTED' | 'SUBMITTED' | 'GRADED' | 'LATE' | 'RETURNED'
  submittedAt: string | null
  grade: number | null
  feedback: string | null
  gradedAt: string | null
  gradedBy: string | null
  user: {
    id: string
    firstName: string
    lastName: string
    email: string
    avatarUrl: string | null
  }
}

export interface AssignmentDetail extends Assignment {
  course: {
    id: string
    title: string
  }
  submissions: AssignmentSubmission[]
  _count: {
    submissions: number
  }
}

export interface AssignmentsResponse {
  assignments: Assignment[]
  stats: {
    total: number
    published: number
    overdue: number
    pendingGrading: number
  }
}

// Discussion types
export interface Discussion {
  id: string
  title: string
  content: string
  courseId: string
  courseName: string
  user: {
    id: string
    name: string
    email: string
    avatarUrl: string | null
  }
  isPinned: boolean
  isLocked: boolean
  isFlagged: boolean
  isSolved: boolean
  repliesCount: number
  createdAt: string
  updatedAt: string
}

export interface DiscussionReply {
  id: string
  threadId: string
  content: string
  user: {
    id: string
    firstName: string
    lastName: string
    email: string
    avatarUrl: string | null
  }
  parentId: string | null
  createdAt: string
  updatedAt: string
}

export interface DiscussionsResponse {
  discussions: Discussion[]
  stats: {
    total: number
    flagged: number
    solved: number
    unsolved: number
  }
}

// Certificate types
export interface InstructorCertificate {
  id: string
  issuedAt: string
  expiresAt: string | null
  certificateUrl: string | null
  verificationCode: string
  user: {
    id: string
    firstName: string
    lastName: string
    email: string
  }
  course: {
    id: string
    title: string
  }
}

export interface CertificatesResponse {
  certificates: InstructorCertificate[]
  total: number
}

// Student detail types
export interface StudentDetail {
  student: {
    id: string
    firstName: string
    lastName: string
    email: string
    avatarUrl: string | null
    role: string
    createdAt: string
    department: {
      id: string
      name: string
    } | null
  }
  enrollments: Array<{
    id: string
    status: string
    enrolledAt: string
    completedAt: string | null
    progressPercentage: number
    lessonsCount: number
    completedLessons: number
    progress: number
    course: {
      id: string
      title: string
      description: string | null
      thumbnail: string | null
      instructor: {
        firstName: string
        lastName: string
      }
      _count: {
        lessons: number
      }
    }
  }>
  quizAttempts: Array<{
    id: string
    attemptNumber: number
    scorePercentage: number | null
    passed: boolean | null
    completedAt: string | null
    quiz: {
      title: string
      lesson: {
        title: string
        course: {
          title: string
        }
      }
    }
  }>
  certificates: Array<{
    id: string
    issuedAt: string
    certificateUrl: string
    course: {
      title: string
    }
  }>
  recentActivity: {
    discussions: Array<{
      id: string
      title: string
      createdAt: string
      course: {
        title: string
      } | null
    }>
    reviews: Array<{
      id: string
      rating: number
      comment: string | null
      createdAt: string
      course: {
        title: string
      }
    }>
  }
  stats: {
    totalEnrollments: number
    completedCourses: number
    avgProgress: number
    avgQuizScore: number
    totalCertificates: number
  }
}

// Bulk email types
export interface BulkEmailResponse {
  success: boolean
  message: string
  sentCount: number
}

class InstructorService {
  /**
   * Get instructor dashboard statistics
   */
  async getStats(): Promise<InstructorStatsResponse> {
    const response = await apiClient.get<{ data: InstructorStatsResponse }>(
      '/api/instructor/stats'
    )
    return response.data!.data
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
    return response.data!.data
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
    return response.data!.data
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
    return response.data!.data
  }

  /**
   * Get assignments for instructor's courses
   */
  async getAssignments(params?: {
    courseId?: string
    status?: string
    search?: string
  }): Promise<AssignmentsResponse> {
    const queryParams = new URLSearchParams()
    if (params?.courseId) queryParams.append('courseId', params.courseId)
    if (params?.status) queryParams.append('status', params.status)
    if (params?.search) queryParams.append('search', params.search)

    const url = `/api/instructor/assignments${
      queryParams.toString() ? `?${queryParams.toString()}` : ''
    }`
    const response = await apiClient.get<{ data: AssignmentsResponse }>(url)
    return response.data!.data
  }

  /**
   * Get assignment by ID
   */
  async getAssignmentById(id: string): Promise<AssignmentDetail> {
    const response = await apiClient.get<{ data: AssignmentDetail }>(`/api/instructor/assignments/${id}`)
    return response.data!.data
  }

  /**
   * Grade a submission
   */
  async gradeSubmission(
    assignmentId: string,
    submissionId: string,
    data: { grade: number; feedback?: string }
  ): Promise<AssignmentSubmission> {
    const response = await apiClient.patch<{ data: AssignmentSubmission }>(
      `/api/instructor/assignments/${assignmentId}/submissions/${submissionId}`,
      data
    )
    return response.data!.data
  }

  /**
   * Get certificates issued in instructor's courses
   */
  async getCertificates(params?: {
    courseId?: string
    status?: string
    search?: string
  }): Promise<CertificatesResponse> {
    const queryParams = new URLSearchParams()
    if (params?.courseId) queryParams.append('courseId', params.courseId)
    if (params?.status) queryParams.append('status', params.status)
    if (params?.search) queryParams.append('search', params.search)

    const url = `/api/instructor/certificates${
      queryParams.toString() ? `?${queryParams.toString()}` : ''
    }`
    const response = await apiClient.get<{ data: CertificatesResponse }>(url)
    return response.data!.data
  }

  /**
   * Get discussions from instructor's courses
   */
  async getDiscussions(params?: {
    courseId?: string
    status?: string
    search?: string
  }): Promise<DiscussionsResponse> {
    const queryParams = new URLSearchParams()
    if (params?.courseId) queryParams.append('courseId', params.courseId)
    if (params?.status) queryParams.append('status', params.status)
    if (params?.search) queryParams.append('search', params.search)

    const url = `/api/instructor/discussions${
      queryParams.toString() ? `?${queryParams.toString()}` : ''
    }`
    const response = await apiClient.get<{ data: DiscussionsResponse }>(url)
    return response.data!.data
  }

  /**
   * Get discussion by ID (instructor view)
   */
  async getDiscussionById(id: string): Promise<Discussion & { replies: DiscussionReply[] }> {
    const response = await apiClient.get<{ data: Discussion & { replies: DiscussionReply[] } }>(`/api/instructor/discussions/${id}`)
    return response.data!.data
  }

  /**
   * Update discussion (mark as solved, pinned, locked, etc.)
   */
  async updateDiscussion(
    id: string,
    data: { isSolved?: boolean; isPinned?: boolean; isLocked?: boolean; isFlagged?: boolean }
  ): Promise<Discussion> {
    const response = await apiClient.patch<{ data: Discussion }>(`/api/instructor/discussions/${id}`, data)
    return response.data!.data
  }

  /**
   * Get student by ID (instructor view)
   */
  async getStudentById(id: string): Promise<StudentDetail> {
    const response = await apiClient.get<{ data: StudentDetail }>(`/api/instructor/students/${id}`)
    return response.data!.data
  }

  /**
   * Send bulk email to students
   */
  async sendBulkEmail(data: {
    studentIds?: string[]
    courseId?: string
    subject: string
    message: string
  }): Promise<BulkEmailResponse> {
    const response = await apiClient.post<{ data: BulkEmailResponse }>(
      '/api/instructor/students/bulk-email',
      data
    )
    return response.data!.data
  }
}

export const instructorService = new InstructorService()
export default instructorService
