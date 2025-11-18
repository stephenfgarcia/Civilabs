'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MagneticButton } from '@/components/ui/magnetic-button'
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
import { notificationsService } from '@/lib/services'

type NotificationType = 'course' | 'certificate' | 'achievement' | 'system' | 'reminder'
type NotificationStatus = 'unread' | 'read'

interface Notification {
  id: number
  type: NotificationType
  title: string
  message: string
  timestamp: string
  status: NotificationStatus
  actionUrl?: string
}

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: 1,
    type: 'certificate',
    title: 'New Certificate Earned!',
    message: 'Congratulations! You have earned the "Construction Safety Fundamentals" certificate.',
    timestamp: '2 hours ago',
    status: 'unread',
    actionUrl: '/certificates'
  },
  {
    id: 2,
    type: 'course',
    title: 'Course Updated',
    message: 'New content has been added to "Equipment Operation" course.',
    timestamp: '5 hours ago',
    status: 'unread',
    actionUrl: '/courses'
  },
  {
    id: 3,
    type: 'achievement',
    title: 'Streak Milestone!',
    message: 'You have maintained a 7-day learning streak. Keep it up!',
    timestamp: '1 day ago',
    status: 'read',
    actionUrl: '/dashboard'
  },
  {
    id: 4,
    type: 'reminder',
    title: 'Course Reminder',
    message: 'You have not completed "Safety Fundamentals". Continue your learning today.',
    timestamp: '1 day ago',
    status: 'read',
    actionUrl: '/my-learning'
  },
  {
    id: 5,
    type: 'system',
    title: 'Maintenance Notice',
    message: 'Scheduled maintenance on Saturday, 2:00 AM - 4:00 AM. System will be unavailable.',
    timestamp: '2 days ago',
    status: 'read'
  },
  {
    id: 6,
    type: 'course',
    title: 'New Course Available',
    message: 'Check out the new "Advanced Scaffolding" course in the catalog.',
    timestamp: '3 days ago',
    status: 'read',
    actionUrl: '/courses'
  },
  {
    id: 7,
    type: 'certificate',
    title: 'Certificate Expiring Soon',
    message: 'Your "First Aid Training" certificate expires in 30 days. Please renew.',
    timestamp: '4 days ago',
    status: 'read',
    actionUrl: '/certificates'
  },
  {
    id: 8,
    type: 'achievement',
    title: 'Course Completed',
    message: 'You have successfully completed "Heavy Machinery Training".',
    timestamp: '5 days ago',
    status: 'read',
    actionUrl: '/my-learning'
  }
]

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([])
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
      if (response.error) {
        throw new Error(response.error)
      }

      const notificationsData = response.data?.data || []
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
          notif.id === id ? { ...notif, status: 'READ' } : notif
        )
      )
    } catch (err) {
      console.error('Error marking notification as read:', err)
    }
  }

  const markAllAsRead = async () => {
    try {
      // Mark all unread notifications as read
      const unreadNotifications = notifications.filter(n => n.status === 'UNREAD')
      await Promise.all(unreadNotifications.map(n => notificationsService.markAsRead(n.id)))

      // Update local state
      setNotifications(prev =>
        prev.map(notif => ({ ...notif, status: 'READ' }))
      )
    } catch (err) {
      console.error('Error marking all as read:', err)
    }
  }

  const deleteNotification = async (id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id))
  }

  const clearAll = () => {
    setNotifications([])
  }

  const filteredNotifications = notifications.filter(notif => {
    if (filter === 'all') return true
    return notif.status === filter
  })

  const unreadCount = notifications.filter(n => n.status === 'UNREAD').length

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
              READ ({notifications.filter(n => n.status === 'READ').length})
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
                {filter === 'unread' ? 'You have no unread notifications.' : 'Your notification inbox is empty.'}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredNotifications.map((notification) => {
            const { icon: Icon, color } = getNotificationIcon(notification.type)
            const isUnread = notification.status === 'unread'

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
                            {notification.timestamp}
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

                      {notification.actionUrl && (
                        <a
                          href={notification.actionUrl}
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
