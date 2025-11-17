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
  async getCourseById(id: number) {
    return apiClient.get<Course>(`/courses/${id}`)
  }

  /**
   * Enroll in a course
   */
  async enrollCourse(courseId: number) {
    return apiClient.post(`/courses/${courseId}/enroll`)
  }

  /**
   * Unenroll from a course
   */
  async unenrollCourse(courseId: number) {
    return apiClient.delete(`/courses/${courseId}/enroll`)
  }

  /**
   * Get course progress
   */
  async getCourseProgress(courseId: number) {
    return apiClient.get<CourseProgress>(`/courses/${courseId}/progress`)
  }

  /**
   * Mark lesson as completed
   */
  async markLessonComplete(courseId: number, lessonId: number) {
    return apiClient.post(`/courses/${courseId}/lessons/${lessonId}/complete`)
  }

  /**
   * Get lesson by ID
   */
  async getLesson(courseId: number, lessonId: number) {
    return apiClient.get<Lesson>(`/courses/${courseId}/lessons/${lessonId}`)
  }

  /**
   * Get quiz for a lesson
   */
  async getQuiz(courseId: number, quizId: number) {
    return apiClient.get<Quiz>(`/courses/${courseId}/quizzes/${quizId}`)
  }

  /**
   * Submit quiz answers
   */
  async submitQuiz(courseId: number, quizId: number, answers: Record<number, number>) {
    return apiClient.post(`/courses/${courseId}/quizzes/${quizId}/submit`, { answers })
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
}

export const coursesService = new CoursesService()
export default coursesService
