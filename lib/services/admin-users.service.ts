/**
 * Admin Users Service
 * Handles all admin user management operations
 */

import { apiClient } from './api-client'

export interface AdminUser {
  id: string
  email: string
  firstName: string
  lastName: string
  role: 'LEARNER' | 'INSTRUCTOR' | 'ADMIN' | 'SUPER_ADMIN'
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'
  department?: {
    id: string
    name: string
  } | null
  departmentId?: string | null
  avatarUrl?: string | null
  createdAt: string
  lastLogin?: string | null
  _count?: {
    enrollments: number
    certificates: number
    coursesCreated: number
  }
}

export interface CreateUserData {
  email: string
  password: string
  firstName: string
  lastName: string
  role?: 'LEARNER' | 'INSTRUCTOR' | 'ADMIN' | 'SUPER_ADMIN'
  departmentId?: string | null
}

export interface UpdateUserData {
  email?: string
  firstName?: string
  lastName?: string
  role?: 'LEARNER' | 'INSTRUCTOR' | 'ADMIN' | 'SUPER_ADMIN'
  status?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'
  departmentId?: string | null
}

export interface UsersListResponse {
  data: AdminUser[]
  count: number
  total: number
}

export interface UserResponse {
  data: AdminUser
  message?: string
}

class AdminUsersService {
  /**
   * Get all users with filtering
   */
  async getUsers(params?: {
    role?: string
    status?: string
    search?: string
    limit?: number
    offset?: number
  }): Promise<{ success: boolean; data: AdminUser[]; count: number; total: number; error?: string }> {
    try {
      const queryParams = new URLSearchParams()
      if (params?.role) queryParams.append('role', params.role)
      if (params?.status) queryParams.append('status', params.status)
      if (params?.search) queryParams.append('search', params.search)
      if (params?.limit) queryParams.append('limit', params.limit.toString())
      if (params?.offset) queryParams.append('offset', params.offset.toString())

      const response = await apiClient.get<UsersListResponse>(
        `/users?${queryParams.toString()}`
      )

      if (response.status >= 200 && response.status < 300 && response.data) {
        return {
          success: true,
          data: response.data.data,
          count: response.data.count,
          total: response.data.total,
        }
      }

      return {
        success: false,
        data: [],
        count: 0,
        total: 0,
        error: response.error || 'Failed to fetch users',
      }
    } catch (error) {
      console.error('Error fetching users:', error)
      return {
        success: false,
        data: [],
        count: 0,
        total: 0,
        error: error instanceof Error ? error.message : 'Failed to fetch users',
      }
    }
  }

  /**
   * Get user by ID
   */
  async getUser(id: string): Promise<{ success: boolean; data: AdminUser | null; error?: string }> {
    try {
      const response = await apiClient.get<UserResponse>(`/users/${id}`)

      if (response.status >= 200 && response.status < 300 && response.data) {
        return {
          success: true,
          data: response.data.data,
        }
      }

      return {
        success: false,
        data: null,
        error: response.error || 'Failed to fetch user',
      }
    } catch (error) {
      console.error('Error fetching user:', error)
      return {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : 'Failed to fetch user',
      }
    }
  }

  /**
   * Create new user
   */
  async createUser(data: CreateUserData): Promise<{ success: boolean; data: AdminUser | null; error?: string; message?: string }> {
    try {
      const response = await apiClient.post<UserResponse>('/users', data)

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
        error: response.error || 'Failed to create user',
      }
    } catch (error) {
      console.error('Error creating user:', error)
      return {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : 'Failed to create user',
      }
    }
  }

  /**
   * Update user
   */
  async updateUser(id: string, data: UpdateUserData): Promise<{ success: boolean; data: AdminUser | null; error?: string; message?: string }> {
    try {
      const response = await apiClient.put<UserResponse>(`/users/${id}`, data)

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
        error: response.error || 'Failed to update user',
      }
    } catch (error) {
      console.error('Error updating user:', error)
      return {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : 'Failed to update user',
      }
    }
  }

  /**
   * Delete user
   */
  async deleteUser(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await apiClient.delete(`/users/${id}`)

      if (response.status >= 200 && response.status < 300) {
        return { success: true }
      }

      return {
        success: false,
        error: response.error || 'Failed to delete user',
      }
    } catch (error) {
      console.error('Error deleting user:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete user',
      }
    }
  }
}

export const adminUsersService = new AdminUsersService()
export default adminUsersService
