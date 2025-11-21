/**
 * Notifications API Service
 * Handles all notification-related API operations
 */

import { apiClient } from './api-client'

export interface Notification {
  id: string
  userId: string
  type: string
  title: string
  message: string
  linkUrl: string | null
  isRead: boolean
  createdAt: string
}

export interface NotificationPreferences {
  emailNotifications: boolean
  pushNotifications: boolean
  courseUpdates: boolean
  discussionReplies: boolean
  achievements: boolean
  systemAnnouncements: boolean
}

class NotificationsService {
  /**
   * Get user notifications
   */
  async getNotifications(filters?: {
    isRead?: boolean
    category?: string
    limit?: number
  }) {
    const params = new URLSearchParams()
    if (filters?.isRead !== undefined) params.append('isRead', String(filters.isRead))
    if (filters?.category) params.append('category', filters.category)
    if (filters?.limit) params.append('limit', String(filters.limit))

    const query = params.toString() ? `?${params.toString()}` : ''
    return apiClient.get<Notification[]>(`/notifications${query}`)
  }

  /**
   * Get unread notification count
   */
  async getUnreadCount() {
    return apiClient.get<{ count: number }>('/notifications/unread-count')
  }

  /**
   * Mark notification as read
   */
  async markAsRead(id: string) {
    return apiClient.put(`/notifications/${id}`)
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead() {
    return apiClient.post('/notifications/mark-all-read')
  }

  /**
   * Delete notification
   */
  async deleteNotification(id: string) {
    return apiClient.delete(`/notifications/${id}`)
  }

  /**
   * Clear all notifications
   */
  async clearAll() {
    return apiClient.delete('/notifications')
  }

  /**
   * Get notification preferences
   */
  async getPreferences() {
    return apiClient.get<NotificationPreferences>('/notifications/preferences')
  }

  /**
   * Update notification preferences
   */
  async updatePreferences(preferences: Partial<NotificationPreferences>) {
    return apiClient.put<NotificationPreferences>('/notifications/preferences', preferences)
  }

  /**
   * Send notification (Admin only)
   */
  async sendNotification(data: {
    title: string
    message: string
    type: 'info' | 'success' | 'warning' | 'error'
    recipients: 'all' | 'instructors' | 'learners' | 'admins'
    category?: string
    scheduledDate?: string
  }) {
    return apiClient.post('/notifications/send', data)
  }
}

export const notificationsService = new NotificationsService()
export default notificationsService
