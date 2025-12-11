'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MagneticButton } from '@/components/ui/magnetic-button'
import { useToast } from '@/lib/hooks'
import {
  Bell,
  Award,
  BookOpen,
  AlertCircle,
  TrendingUp,
  CheckCircle,
  Trash2,
  Filter,
  X,
  Loader2
} from 'lucide-react'
import { notificationsService, type Notification } from '@/lib/services'

// Helper function to format relative time
const formatRelativeTime = (dateString: string): string => {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`
  if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`
  if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`
  return date.toLocaleDateString()
}

export default function NotificationsPage() {
  const { toast } = useToast()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'READ' | 'UNREAD'>('all')

  useEffect(() => {
    fetchNotifications()
  }, [])

  useEffect(() => {
    if (notifications.length === 0) return

    // Simple CSS-only entrance animations
    const elements = document.querySelectorAll('.notification-item')
    elements.forEach((el, index) => {
      const htmlEl = el as HTMLElement
      htmlEl.style.animation = `fadeInUp 0.5s ease-out forwards ${index * 0.05}s`
    })
  }, [filter, notifications])

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await notificationsService.getNotifications()
      if (response.status < 200 || response.status >= 300) {
        throw new Error(response.error || 'Failed to fetch notifications')
      }

      const notificationsData = Array.isArray(response.data) ? response.data : []
      setNotifications(notificationsData)
    } catch (err) {
      console.error('Error fetching notifications:', err)
      setError(err instanceof Error ? err.message : 'Failed to load notifications')
    } finally {
      setLoading(false)
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'course':
        return { icon: BookOpen, color: 'from-primary to-blue-600' }
      case 'certificate':
        return { icon: Award, color: 'from-warning to-orange-600' }
      case 'achievement':
        return { icon: TrendingUp, color: 'from-success to-green-600' }
      case 'system':
        return { icon: AlertCircle, color: 'from-secondary to-purple-600' }
      default:
        return { icon: Bell, color: 'from-pink-500 to-rose-600' }
    }
  }

  const markAsRead = async (id: string) => {
    try {
      await notificationsService.markAsRead(id)
      // Update local state
      setNotifications(prev =>
        prev.map(notif =>
          notif.id === id ? { ...notif, isRead: true } : notif
        )
      )
    } catch (err) {
      console.error('Error marking notification as read:', err)
      toast({
        title: 'Error',
        description: 'Failed to mark notification as read',
        variant: 'destructive',
      })
    }
  }

  const markAllAsRead = async () => {
    try {
      // Mark all unread notifications as read
      const unreadNotifications = notifications.filter(n => !n.isRead)
      await Promise.all(unreadNotifications.map(n => notificationsService.markAsRead(n.id)))

      // Update local state
      setNotifications(prev =>
        prev.map(notif => ({ ...notif, isRead: true }))
      )
      toast({
        title: 'Success',
        description: `Marked ${unreadNotifications.length} notifications as read`,
      })
    } catch (err) {
      console.error('Error marking all as read:', err)
      toast({
        title: 'Error',
        description: 'Failed to mark all notifications as read',
        variant: 'destructive',
      })
    }
  }

  const deleteNotification = async (id: string) => {
    try {
      await notificationsService.deleteNotification(id)
      // Update local state
      setNotifications(prev => prev.filter(notif => notif.id !== id))
      toast({
        title: 'Deleted',
        description: 'Notification deleted successfully',
      })
    } catch (err) {
      console.error('Error deleting notification:', err)
      toast({
        title: 'Error',
        description: 'Failed to delete notification',
        variant: 'destructive',
      })
    }
  }

  const clearAll = async () => {
    const confirmed = window.confirm('Are you sure you want to clear all notifications? This action cannot be undone.')
    if (!confirmed) return

    try {
      const response = await notificationsService.clearAll()
      if (response.status >= 200 && response.status < 300) {
        setNotifications([])
        toast({
          title: 'Success',
          description: 'All notifications have been cleared.',
        })
      } else {
        throw new Error(response.error || 'Failed to clear notifications')
      }
    } catch (err) {
      console.error('Error clearing notifications:', err)
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to clear notifications',
        variant: 'destructive',
      })
    }
  }

  const filteredNotifications = Array.isArray(notifications) ? notifications.filter(notif => {
    if (filter === 'all') return true
    if (filter === 'UNREAD') return !notif.isRead
    if (filter === 'READ') return notif.isRead
    return true
  }) : []

  const unreadCount = Array.isArray(notifications) ? notifications.filter(n => !n.isRead).length : 0

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 mx-auto text-warning mb-4" />
          <p className="text-lg font-bold text-neutral-700">Loading notifications...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="glass-effect concrete-texture border-4 border-red-500/40 max-w-md">
          <CardHeader>
            <CardTitle className="text-xl font-black flex items-center gap-2 text-red-600">
              <AlertCircle />
              Error Loading Notifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-neutral-700 mb-4">{error}</p>
            <MagneticButton onClick={fetchNotifications} className="bg-gradient-to-r from-warning to-orange-600 text-white font-black">
              Try Again
            </MagneticButton>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="notification-item opacity-0">
        <div className="glass-effect concrete-texture rounded-xl p-8 relative overflow-hidden border-4 border-primary/40">
          {/* Blueprint corner markers */}
          <div className="absolute top-2 left-2 w-12 h-12 border-t-4 border-l-4 border-primary/60"></div>
          <div className="absolute top-2 right-2 w-12 h-12 border-t-4 border-r-4 border-primary/60"></div>
          <div className="absolute bottom-2 left-2 w-12 h-12 border-b-4 border-l-4 border-primary/60"></div>
          <div className="absolute bottom-2 right-2 w-12 h-12 border-b-4 border-r-4 border-primary/60"></div>

          {/* Background */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary via-blue-500 to-secondary opacity-10"></div>
          <div className="absolute inset-0 blueprint-grid opacity-20"></div>

          <div className="relative z-10">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-blue-600 rounded-xl flex items-center justify-center">
                  <Bell className="text-white" size={32} />
                </div>
                <div>
                  <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-primary via-blue-500 to-secondary bg-clip-text text-transparent">
                    NOTIFICATIONS
                  </h1>
                  <p className="text-sm font-bold text-neutral-600 mt-1">
                    {unreadCount} UNREAD MESSAGE{unreadCount !== 1 ? 'S' : ''}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <MagneticButton
                  onClick={markAllAsRead}
                  className="bg-gradient-to-r from-success to-green-600 text-white font-black"
                  disabled={unreadCount === 0}
                >
                  <CheckCircle className="mr-2" size={20} />
                  MARK ALL READ
                </MagneticButton>
                <MagneticButton
                  onClick={clearAll}
                  className="bg-gradient-to-r from-danger to-red-600 text-white font-black"
                  disabled={notifications.length === 0}
                >
                  <Trash2 className="mr-2" size={20} />
                  CLEAR ALL
                </MagneticButton>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card className="notification-item opacity-0 glass-effect concrete-texture border-4 border-secondary/40">
        <CardHeader>
          <CardTitle className="text-xl font-black flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-secondary to-purple-600 rounded-lg flex items-center justify-center">
              <Filter className="text-white" size={20} />
            </div>
            FILTER NOTIFICATIONS
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3 flex-wrap">
            <button
              onClick={() => setFilter('all')}
              className={`px-6 py-3 rounded-lg font-bold transition-all ${
                filter === 'all'
                  ? 'bg-gradient-to-r from-primary to-blue-600 text-white shadow-lg scale-105'
                  : 'glass-effect border-2 border-primary/30 text-neutral-700 hover:border-primary/60'
              }`}
            >
              ALL ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('UNREAD')}
              className={`px-6 py-3 rounded-lg font-bold transition-all ${
                filter === 'UNREAD'
                  ? 'bg-gradient-to-r from-warning to-orange-600 text-white shadow-lg scale-105'
                  : 'glass-effect border-2 border-warning/30 text-neutral-700 hover:border-warning/60'
              }`}
            >
              UNREAD ({unreadCount})
            </button>
            <button
              onClick={() => setFilter('READ')}
              className={`px-6 py-3 rounded-lg font-bold transition-all ${
                filter === 'READ'
                  ? 'bg-gradient-to-r from-success to-green-600 text-white shadow-lg scale-105'
                  : 'glass-effect border-2 border-success/30 text-neutral-700 hover:border-success/60'
              }`}
            >
              READ ({notifications.filter(n => n.isRead).length})
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <Card className="notification-item opacity-0 glass-effect concrete-texture border-4 border-neutral-300">
            <CardContent className="p-12 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-neutral-300 to-neutral-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Bell className="text-white" size={40} />
              </div>
              <h3 className="text-2xl font-black text-neutral-700 mb-2">NO NOTIFICATIONS</h3>
              <p className="text-neutral-600 font-semibold">
                {filter === 'UNREAD' ? 'You have no unread notifications.' : 'Your notification inbox is empty.'}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredNotifications.map((notification) => {
            const { icon: Icon, color } = getNotificationIcon(notification.type)
            const isUnread = !notification.isRead

            return (
              <Card
                key={notification.id}
                className={`notification-item opacity-0 glass-effect concrete-texture border-4 ${
                  isUnread ? 'border-warning/60 bg-warning/5' : 'border-neutral-300'
                } relative group hover:shadow-lg transition-all`}
              >
                {isUnread && (
                  <div className="absolute top-0 right-0 w-2 h-full bg-gradient-to-b from-warning to-orange-600"></div>
                )}

                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className={`w-14 h-14 bg-gradient-to-br ${color} rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg`}>
                      <Icon className="text-white" size={24} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div className="flex-1">
                          <h3 className={`text-lg font-black ${isUnread ? 'text-neutral-900' : 'text-neutral-700'}`}>
                            {notification.title}
                            {isUnread && (
                              <span className="ml-2 inline-block w-2 h-2 bg-warning rounded-full"></span>
                            )}
                          </h3>
                          <p className="text-xs font-bold text-neutral-500 uppercase mt-1">
                            {formatRelativeTime(notification.createdAt)}
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          {isUnread && (
                            <button
                              onClick={() => markAsRead(notification.id)}
                              className="p-2 rounded-lg glass-effect border-2 border-success/30 hover:border-success hover:bg-success/10 transition-all group"
                              title="Mark as read"
                            >
                              <CheckCircle size={18} className="text-success" />
                            </button>
                          )}
                          <button
                            onClick={() => deleteNotification(notification.id)}
                            className="p-2 rounded-lg glass-effect border-2 border-danger/30 hover:border-danger hover:bg-danger/10 transition-all"
                            title="Delete"
                          >
                            <Trash2 size={18} className="text-danger" />
                          </button>
                        </div>
                      </div>

                      <p className="text-neutral-700 font-medium mb-3">
                        {notification.message}
                      </p>

                      {notification.linkUrl && (
                        <a
                          href={notification.linkUrl}
                          className={`inline-flex items-center gap-1 text-sm font-bold bg-gradient-to-r ${color} bg-clip-text text-transparent hover:opacity-70 transition-opacity`}
                        >
                          View Details →
                        </a>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}
