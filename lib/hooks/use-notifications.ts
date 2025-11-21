/**
 * Notifications Data Hooks
 * React hooks for fetching and managing notification data
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import { notificationsService, type Notification, type NotificationPreferences } from '@/lib/services'

interface UseNotificationsOptions {
  isRead?: boolean
  category?: string
  limit?: number
  autoFetch?: boolean
  pollInterval?: number // Auto-refresh interval in milliseconds
}

interface UseNotificationsReturn {
  notifications: Notification[]
  unreadCount: number
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  markAsRead: (id: number) => Promise<void>
  markAllAsRead: () => Promise<void>
  deleteNotification: (id: number) => Promise<void>
  clearAll: () => Promise<void>
}

/**
 * Hook to fetch notifications with auto-refresh
 */
export function useNotifications(options: UseNotificationsOptions = {}): UseNotificationsReturn {
  const { isRead, category, limit, autoFetch = true, pollInterval } = options
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(autoFetch)
  const [error, setError] = useState<string | null>(null)

  const fetchNotifications = useCallback(async () => {
    setLoading(true)
    setError(null)

    const [notifResponse, countResponse] = await Promise.all([
      notificationsService.getNotifications({ isRead, category, limit }),
      notificationsService.getUnreadCount(),
    ])

    if (notifResponse.error) {
      setError(notifResponse.error)
      setNotifications([])
    } else if (notifResponse.data) {
      setNotifications(notifResponse.data)
    }

    if (countResponse.data) {
      setUnreadCount(countResponse.data.count)
    }

    setLoading(false)
  }, [isRead, category, limit])

  const markAsRead = useCallback(async (id: number) => {
    const response = await notificationsService.markAsRead(String(id))
    if (response.error) {
      setError(response.error)
    } else {
      await fetchNotifications()
    }
  }, [fetchNotifications])

  const markAllAsRead = useCallback(async () => {
    const response = await notificationsService.markAllAsRead()
    if (response.error) {
      setError(response.error)
    } else {
      await fetchNotifications()
    }
  }, [fetchNotifications])

  const deleteNotification = useCallback(async (id: number) => {
    const response = await notificationsService.deleteNotification(String(id))
    if (response.error) {
      setError(response.error)
    } else {
      await fetchNotifications()
    }
  }, [fetchNotifications])

  const clearAll = useCallback(async () => {
    const response = await notificationsService.clearAll()
    if (response.error) {
      setError(response.error)
    } else {
      await fetchNotifications()
    }
  }, [fetchNotifications])

  useEffect(() => {
    if (autoFetch) {
      fetchNotifications()
    }
  }, [autoFetch, fetchNotifications])

  // Auto-refresh polling
  useEffect(() => {
    if (pollInterval && pollInterval > 0) {
      const interval = setInterval(() => {
        fetchNotifications()
      }, pollInterval)

      return () => clearInterval(interval)
    }
  }, [pollInterval, fetchNotifications])

  return {
    notifications,
    unreadCount,
    loading,
    error,
    refetch: fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
  }
}

interface UseNotificationPreferencesReturn {
  preferences: NotificationPreferences | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  updatePreferences: (data: Partial<NotificationPreferences>) => Promise<void>
}

/**
 * Hook to fetch and update notification preferences
 */
export function useNotificationPreferences(): UseNotificationPreferencesReturn {
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPreferences = useCallback(async () => {
    setLoading(true)
    setError(null)

    const response = await notificationsService.getPreferences()

    if (response.error) {
      setError(response.error)
      setPreferences(null)
    } else if (response.data) {
      setPreferences(response.data)
    }

    setLoading(false)
  }, [])

  const updatePreferences = useCallback(async (data: Partial<NotificationPreferences>) => {
    const response = await notificationsService.updatePreferences(data)
    if (response.error) {
      setError(response.error)
    } else {
      await fetchPreferences()
    }
  }, [fetchPreferences])

  useEffect(() => {
    fetchPreferences()
  }, [fetchPreferences])

  return {
    preferences,
    loading,
    error,
    refetch: fetchPreferences,
    updatePreferences,
  }
}

/**
 * Hook to get unread count only (lightweight polling)
 */
export function useUnreadCount(pollInterval?: number): {
  count: number
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
} {
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCount = useCallback(async () => {
    setLoading(true)
    setError(null)

    const response = await notificationsService.getUnreadCount()

    if (response.error) {
      setError(response.error)
    } else if (response.data) {
      setCount(response.data.count)
    }

    setLoading(false)
  }, [])

  useEffect(() => {
    fetchCount()
  }, [fetchCount])

  // Auto-refresh polling
  useEffect(() => {
    if (pollInterval && pollInterval > 0) {
      const interval = setInterval(() => {
        fetchCount()
      }, pollInterval)

      return () => clearInterval(interval)
    }
  }, [pollInterval, fetchCount])

  return {
    count,
    loading,
    error,
    refetch: fetchCount,
  }
}
