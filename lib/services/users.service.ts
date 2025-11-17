/**
 * Users API Service
 * Handles all user-related API operations
 */

import { apiClient } from './api-client'

export interface User {
  id: number
  firstName: string
  lastName: string
  email: string
  role: 'admin' | 'instructor' | 'learner'
  department: string
  joinedDate: string
  avatar?: string
  bio?: string
  phone?: string
  location?: string
}

export interface UserProfile extends User {
  enrolledCourses: number
  completedCourses: number
  certificates: number
  points: number
  badges: Badge[]
  achievements: Achievement[]
}

export interface Badge {
  id: number
  name: string
  description: string
  icon: string
  earnedDate?: string
  category: string
}

export interface Achievement {
  id: number
  title: string
  description: string
  points: number
  earnedDate: string
}

export interface UpdateProfileData {
  firstName?: string
  lastName?: string
  bio?: string
  phone?: string
  location?: string
  avatar?: string
}

class UsersService {
  /**
   * Get current user profile
   */
  async getCurrentUser() {
    return apiClient.get<UserProfile>('/users/me')
  }

  /**
   * Update current user profile
   */
  async updateProfile(data: UpdateProfileData) {
    return apiClient.patch<User>('/users/me', data)
  }

  /**
   * Upload user avatar
   */
  async uploadAvatar(file: File) {
    const formData = new FormData()
    formData.append('avatar', file)

    // Special handling for file upload
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null
    const headers: Record<string, string> = {}
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    const response = await fetch('/api/users/me/avatar', {
      method: 'POST',
      headers,
      body: formData,
    })

    const data = await response.json()
    return {
      data: response.ok ? data : undefined,
      error: !response.ok ? data.error : undefined,
      status: response.status,
    }
  }

  /**
   * Get user by ID (Admin only)
   */
  async getUserById(id: number) {
    return apiClient.get<UserProfile>(`/users/${id}`)
  }

  /**
   * Get all users (Admin only)
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
    return apiClient.get<User[]>(`/users${query}`)
  }

  /**
   * Create user (Admin only)
   */
  async createUser(userData: Partial<User> & { password: string }) {
    return apiClient.post<User>('/users', userData)
  }

  /**
   * Update user (Admin only)
   */
  async updateUser(id: number, userData: Partial<User>) {
    return apiClient.put<User>(`/users/${id}`, userData)
  }

  /**
   * Delete user (Admin only)
   */
  async deleteUser(id: number) {
    return apiClient.delete(`/users/${id}`)
  }

  /**
   * Get user badges
   */
  async getUserBadges(userId?: number) {
    const endpoint = userId ? `/users/${userId}/badges` : '/users/me/badges'
    return apiClient.get<Badge[]>(endpoint)
  }

  /**
   * Get user achievements
   */
  async getUserAchievements(userId?: number) {
    const endpoint = userId ? `/users/${userId}/achievements` : '/users/me/achievements'
    return apiClient.get<Achievement[]>(endpoint)
  }

  /**
   * Get leaderboard
   */
  async getLeaderboard(filters?: {
    period?: 'week' | 'month' | 'all-time'
    department?: string
  }) {
    const params = new URLSearchParams()
    if (filters?.period) params.append('period', filters.period)
    if (filters?.department) params.append('department', filters.department)

    const query = params.toString() ? `?${params.toString()}` : ''
    return apiClient.get<UserProfile[]>(`/users/leaderboard${query}`)
  }
}

export const usersService = new UsersService()
export default usersService
