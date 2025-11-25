/**
 * Auth API Service
 * Handles authentication and password recovery
 */

import { apiClient } from './api-client'

class AuthService {
  /**
   * Request password reset email
   */
  async forgotPassword(email: string): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>('/auth/forgot-password', { email })
    return response.data!
  }

  /**
   * Reset password with token
   */
  async resetPassword(token: string, password: string): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>('/auth/reset-password', {
      token,
      password,
    })
    return response.data!
  }
}

export const authService = new AuthService()
export default authService
