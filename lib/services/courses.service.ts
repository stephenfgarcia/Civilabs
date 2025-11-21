/**
 * Courses API Service
 * Handles all course-related API operations
 */

import { apiClient } from './api-client'

export interface Course {
  id: number
  title: string
  description: string
  category: string
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
  duration: string
  instructor: string
  enrolledStudents: number
  rating: number
  thumbnail?: string
  lessons?: Lesson[]
  status: 'published' | 'draft' | 'archived'
}

export interface Lesson {
  id: number
  courseId: number
  title: string
  description: string
  duration: string
  videoUrl?: string
  order: number
  isCompleted?: boolean
}

export interface Quiz {
  id: number
  lessonId: number
  title: string
  questions: QuizQuestion[]
}

export interface QuizQuestion {
  id: number
  question: string
  options: string[]
  correctAnswer: number
}

export interface CourseProgress {
  courseId: number
  userId: number
  completedLessons: number
  totalLessons: number
  progress: number
  lastAccessed: string
}

class CoursesService {
  /**
   * Get all courses
   */
  async getCourses(filters?: {
    category?: string
    difficulty?: string
    search?: string
  }) {
    const params = new URLSearchParams()
    if (filters?.category) params.append('category', filters.category)
    if (filters?.difficulty) params.append('difficulty', filters.difficulty)
    if (filters?.search) params.append('search', filters.search)

    const query = params.toString() ? `?${params.toString()}` : ''
    return apiClient.get<Course[]>(`/courses${query}`)
  }

  /**
   * Get course by ID
   */
  async getCourseById(id: string) {
    return apiClient.get<Course>(`/courses/${id}`)
  }

  /**
   * Enroll in a course
   */
  async enrollCourse(courseId: string) {
    return apiClient.post(`/enrollments`, { courseId })
  }

  /**
   * Unenroll from a course
   */
  async unenrollCourse(enrollmentId: string) {
    return apiClient.delete(`/enrollments/${enrollmentId}`)
  }

  /**
   * Get user enrollments
   */
  async getEnrollments() {
    return apiClient.get(`/enrollments`)
  }

  /**
   * Mark lesson as completed
   */
  async markLessonComplete(lessonId: string) {
    return apiClient.post(`/progress`, { lessonId })
  }

  /**
   * Get quiz by ID
   */
  async getQuiz(quizId: string) {
    return apiClient.get<Quiz>(`/quizzes/${quizId}`)
  }

  /**
   * Start quiz attempt
   */
  async startQuizAttempt(quizId: string) {
    return apiClient.post(`/quizzes/${quizId}/attempts`)
  }

  /**
   * Submit quiz answers
   */
  async submitQuiz(quizId: string, attemptId: string, answers: any[]) {
    return apiClient.post(`/quizzes/${quizId}/submit`, { attemptId, answers })
  }

  /**
   * Create new course (Admin only)
   */
  async createCourse(courseData: Partial<Course>) {
    return apiClient.post<Course>('/courses', courseData)
  }

  /**
   * Update course (Admin only)
   */
  async updateCourse(id: number, courseData: Partial<Course>) {
    return apiClient.put<Course>(`/courses/${id}`, courseData)
  }

  /**
   * Delete course (Admin only)
   */
  async deleteCourse(id: number) {
    return apiClient.delete(`/courses/${id}`)
  }

  /**
   * Get course progress for current user
   */
  async getCourseProgress(courseId: string) {
    return apiClient.get(`/progress?courseId=${courseId}`)
  }

  /**
   * Get lesson by ID with details
   */
  async getLesson(lessonId: string) {
    return apiClient.get(`/lessons/${lessonId}`)
  }
}

export const coursesService = new CoursesService()
export default coursesService
