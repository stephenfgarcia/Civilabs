/**
 * Admin API Service
 * Handles all admin-related API operations
 */

import { apiClient } from './api-client'

export interface AdminStats {
  overview: {
    totalUsers: number
    totalCourses: number
    publishedCourses: number
    totalEnrollments: number
    activeEnrollments: number
    completedEnrollments: number
    totalCertificates: number
    completionRate: number
    recentEnrollments: number
  }
  usersByRole: Record<string, number>
  recentActivity: Array<{
    id: string
    type: string
    userName: string
    userEmail: string
    courseName: string
    status: string
    createdAt: string
  }>
  popularCourses: Array<{
    id: string
    title: string
    enrollmentCount: number
    category: {
      id: string
      name: string
    } | null
  }>
}

class AdminService {
  /**
   * Get admin dashboard statistics
   */
  async getStats() {
    return apiClient.get<AdminStats>('/admin/stats')
  }

  /**
   * Get all users (with filters)
   */
  async getUsers(filters?: {
    role?: string
    department?: string
    search?: string
  }) {
    const params = new URLSearchParams()
    if (filters?.role) params.append('role', filters.role)
    if (filters?.department) params.append('department', filters.department)
    if (filters?.search) params.append('search', filters.search)

    const query = params.toString() ? `?${params.toString()}` : ''
    return apiClient.get(`/users${query}`)
  }

  /**
   * Create a new user (admin only)
   */
  async createUser(userData: {
    firstName: string
    lastName: string
    email: string
    password: string
    role: string
    departmentId?: string
  }) {
    return apiClient.post('/users', userData)
  }

  /**
   * Update a user (admin only)
   */
  async updateUser(userId: string, userData: Partial<{
    firstName: string
    lastName: string
    email: string
    role: string
    departmentId: string
  }>) {
    return apiClient.put(`/users/${userId}`, userData)
  }

  /**
   * Delete a user (admin only)
   */
  async deleteUser(userId: string) {
    return apiClient.delete(`/users/${userId}`)
  }

  /**
   * Get all courses (admin view)
   */
  async getCourses(filters?: {
    category?: string
    difficulty?: string
    published?: boolean
    search?: string
  }) {
    const params = new URLSearchParams()
    if (filters?.category) params.append('category', filters.category)
    if (filters?.difficulty) params.append('difficulty', filters.difficulty)
    if (filters?.published !== undefined) params.append('published', String(filters.published))
    if (filters?.search) params.append('search', filters.search)

    const query = params.toString() ? `?${params.toString()}` : ''
    return apiClient.get(`/courses${query}`)
  }

  /**
   * Delete a course (admin only)
   */
  async deleteCourse(courseId: string) {
    return apiClient.delete(`/courses/${courseId}`)
  }

  /**
   * Issue a certificate (admin only)
   */
  async issueCertificate(data: {
    userId: string
    courseId: string
    issuedDate?: string
  }) {
    return apiClient.post('/certificates', data)
  }
}

export const adminService = new AdminService()
export default adminService
