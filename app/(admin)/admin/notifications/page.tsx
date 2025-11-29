'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MagneticButton } from '@/components/ui/magnetic-button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/lib/hooks'
import { adminService } from '@/lib/services'
import {
  Bell,
  Search,
  Filter,
  Send,
  Users,
  User,
  BookOpen,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Info,
  Zap,
  Mail,
  MessageSquare,
  Calendar,
  Eye,
  Trash2,
  TrendingUp,
  Loader2,
} from 'lucide-react'

interface Notification {
  id: number
  title: string
  message: string
  type: 'info' | 'warning' | 'success' | 'urgent'
  recipients: 'all' | 'instructors' | 'learners' | 'admins'
  status: 'sent' | 'scheduled' | 'draft'
  sentDate?: string
  scheduledDate?: string
  deliveredCount?: number
  readCount?: number
  createdBy: string
}

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: 1,
    title: 'System Maintenance Scheduled',
    message: 'The LMS will undergo maintenance on Friday from 2 AM to 6 AM. Please save your work.',
    type: 'warning',
    recipients: 'all',
    status: 'sent',
    sentDate: '2024-03-01T10:00:00',
    deliveredCount: 1247,
    readCount: 892,
    createdBy: 'Emily Davis',
  },
  {
    id: 2,
    title: 'New Course Available: Advanced Welding',
    message: 'We are excited to announce a new course on advanced welding techniques. Enroll now!',
    type: 'success',
    recipients: 'learners',
    status: 'sent',
    sentDate: '2024-02-28T14:30:00',
    deliveredCount: 1045,
    readCount: 678,
    createdBy: 'Emily Davis',
  },
  {
    id: 3,
    title: 'Certificate Expiry Reminder',
    message: 'Your Construction Safety certificate will expire in 30 days. Please renew it.',
    type: 'urgent',
    recipients: 'learners',
    status: 'scheduled',
    scheduledDate: '2024-03-15T09:00:00',
    createdBy: 'System',
  },
  {
    id: 4,
    title: 'Instructor Training Session',
    message: 'All instructors are invited to attend the training session on new platform features.',
    type: 'info',
    recipients: 'instructors',
    status: 'sent',
    sentDate: '2024-02-25T11:00:00',
    deliveredCount: 23,
    readCount: 18,
    createdBy: 'Emily Davis',
  },
  {
    id: 5,
    title: 'Monthly Safety Digest',
    message: 'Check out this month\'s safety tips and best practices from our community.',
    type: 'info',
    recipients: 'all',
    status: 'draft',
    createdBy: 'Emily Davis',
  },
]

const NOTIFICATION_TYPES = ['All', 'Info', 'Warning', 'Success', 'Urgent']
const RECIPIENTS = ['All', 'All Users', 'Instructors', 'Learners', 'Admins']
const STATUSES = ['All', 'Sent', 'Scheduled', 'Draft']

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [sendingNotification, setSendingNotification] = useState(false)

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState('All')
  const [selectedRecipients, setSelectedRecipients] = useState('All')
  const [selectedStatus, setSelectedStatus] = useState('All')
  const [showComposer, setShowComposer] = useState(false)

  const [notificationForm, setNotificationForm] = useState({
    title: '',
    message: '',
    type: 'info' as 'info' | 'success' | 'warning' | 'error',
    recipients: 'all' as 'all' | 'instructors' | 'learners' | 'admins',
    category: 'general',
    scheduledDate: ''
  })

  const { toast } = useToast()

  useEffect(() => {
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      // For now, use mock data since admin notification history endpoint needs to be created
      // TODO: Replace with actual admin API endpoint: GET /api/admin/notifications
      await new Promise(resolve => setTimeout(resolve, 500))
      setNotifications(MOCK_NOTIFICATIONS)
    } catch (error) {
      console.error('Error fetching notifications:', error)
      toast({
        title: 'Error',
        description: 'Failed to load notifications',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSendNotification = async () => {
    if (!notificationForm.title || !notificationForm.message) {
      toast({
        title: 'Validation Error',
        description: 'Title and message are required',
        variant: 'destructive'
      })
      return
    }

    try {
      setSendingNotification(true)
      await adminService.sendNotification({
        title: notificationForm.title,
        message: notificationForm.message,
        type: notificationForm.type,
        recipients: notificationForm.recipients,
        category: notificationForm.category,
        scheduledDate: notificationForm.scheduledDate || undefined
      })

      toast({
        title: 'Success',
        description: 'Notification sent successfully'
      })

      // Reset form
      setNotificationForm({
        title: '',
        message: '',
        type: 'info',
        recipients: 'all',
        category: 'general',
        scheduledDate: ''
      })
      setShowComposer(false)
      fetchNotifications()
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to send notification',
        variant: 'destructive'
      })
    } finally {
      setSendingNotification(false)
    }
  }

  useEffect(() => {
    const elements = document.querySelectorAll('.admin-notifs-item')
    elements.forEach((el, index) => {
      const htmlEl = el as HTMLElement
      htmlEl.style.animation = `fadeInUp 0.5s ease-out forwards ${index * 0.05}s`
    })
  }, [])

  const filteredNotifications = notifications.filter(notif => {
    const matchesSearch = !searchQuery ||
      notif.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notif.message.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = selectedType === 'All' || notif.type === selectedType.toLowerCase()
    const matchesRecipients = selectedRecipients === 'All' ||
      notif.recipients === selectedRecipients.toLowerCase().replace(' users', '')
    const matchesStatus = selectedStatus === 'All' || notif.status === selectedStatus.toLowerCase()
    return matchesSearch && matchesType && matchesRecipients && matchesStatus
  })

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'from-success to-green-600'
      case 'warning':
        return 'from-warning to-orange-600'
      case 'urgent':
        return 'from-danger to-red-600'
      default:
        return 'from-primary to-blue-600'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'success':
        return CheckCircle
      case 'warning':
        return AlertTriangle
      case 'urgent':
        return Zap
      default:
        return Info
    }
  }

  const getRecipientsIcon = (recipients: string) => {
    switch (recipients) {
      case 'all':
        return Users
      case 'instructors':
      case 'learners':
      case 'admins':
        return User
      default:
        return Users
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent':
        return 'from-success to-green-600'
      case 'scheduled':
        return 'from-warning to-orange-600'
      case 'draft':
        return 'from-neutral-400 to-neutral-600'
      default:
        return 'from-primary to-blue-600'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="admin-notifs-item opacity-0">
        <div className="glass-effect concrete-texture rounded-xl p-8 relative overflow-hidden border-4 border-orange-500/40">
          <div className="absolute top-2 left-2 w-12 h-12 border-t-4 border-l-4 border-orange-600/60"></div>
          <div className="absolute top-2 right-2 w-12 h-12 border-t-4 border-r-4 border-orange-600/60"></div>
          <div className="absolute bottom-2 left-2 w-12 h-12 border-b-4 border-l-4 border-orange-600/60"></div>
          <div className="absolute bottom-2 right-2 w-12 h-12 border-b-4 border-r-4 border-orange-600/60"></div>

          <div className="absolute inset-0 bg-gradient-to-r from-orange-500 via-amber-500 to-amber-600 opacity-10"></div>
          <div className="absolute inset-0 blueprint-grid opacity-20"></div>

          <div className="relative z-10">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-orange-500 via-amber-500 to-amber-600 bg-clip-text text-transparent mb-2">
                  NOTIFICATION CENTER
                </h1>
                <p className="text-lg font-bold text-neutral-700">
                  Send and manage platform notifications
                </p>
              </div>

              <MagneticButton
                onClick={() => setShowComposer(!showComposer)}
                className="bg-gradient-to-r from-orange-500 to-amber-600 text-white font-black"
              >
                <Send className="mr-2" size={20} />
                {showComposer ? 'HIDE COMPOSER' : 'NEW NOTIFICATION'}
              </MagneticButton>
            </div>
          </div>
        </div>
      </div>

      {/* Notification Composer */}
      {showComposer && (
        <Card className="admin-notifs-item opacity-0 glass-effect concrete-texture border-4 border-orange-500/40">
          <CardHeader>
            <CardTitle className="text-xl font-black flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-600 rounded-lg flex items-center justify-center">
                <Mail className="text-white" size={20} />
              </div>
              COMPOSE NOTIFICATION
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-bold text-neutral-700 mb-2 block">TITLE</label>
              <Input
                type="text"
                placeholder="Notification title..."
                value={notificationForm.title}
                onChange={(e) => setNotificationForm({ ...notificationForm, title: e.target.value })}
                className="glass-effect border-2 border-primary/30 focus:border-primary font-medium"
              />
            </div>

            <div>
              <label className="text-sm font-bold text-neutral-700 mb-2 block">MESSAGE</label>
              <Textarea
                placeholder="Write your notification message..."
                value={notificationForm.message}
                onChange={(e) => setNotificationForm({ ...notificationForm, message: e.target.value })}
                className="glass-effect border-2 border-primary/30 focus:border-primary font-medium min-h-[120px]"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-bold text-neutral-700 mb-2 block">TYPE</label>
                <select
                  value={notificationForm.type}
                  onChange={(e) => setNotificationForm({ ...notificationForm, type: e.target.value as any })}
                  className="w-full h-12 px-4 glass-effect border-2 border-primary/30 rounded-lg font-medium"
                >
                  <option value="info">Info</option>
                  <option value="warning">Warning</option>
                  <option value="success">Success</option>
                  <option value="error">Urgent</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-bold text-neutral-700 mb-2 block">RECIPIENTS</label>
                <select
                  value={notificationForm.recipients}
                  onChange={(e) => setNotificationForm({ ...notificationForm, recipients: e.target.value as any })}
                  className="w-full h-12 px-4 glass-effect border-2 border-primary/30 rounded-lg font-medium"
                >
                  <option value="all">All Users</option>
                  <option value="instructors">Instructors</option>
                  <option value="learners">Learners</option>
                  <option value="admins">Admins</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-bold text-neutral-700 mb-2 block">SCHEDULE (OPTIONAL)</label>
                <Input
                  type="datetime-local"
                  value={notificationForm.scheduledDate}
                  onChange={(e) => setNotificationForm({ ...notificationForm, scheduledDate: e.target.value })}
                  className="glass-effect border-2 border-primary/30 focus:border-primary font-medium"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <MagneticButton
                onClick={handleSendNotification}
                disabled={sendingNotification}
                className="bg-gradient-to-r from-success to-green-600 text-white font-black"
              >
                <Send className="mr-2" size={16} />
                {sendingNotification ? 'SENDING...' : 'SEND NOW'}
              </MagneticButton>
              <MagneticButton
                onClick={() => {
                  toast({
                    title: 'Coming Soon',
                    description: 'Notification scheduling will be available in a future update',
                  })
                }}
                disabled={sendingNotification}
                className="bg-gradient-to-r from-warning to-orange-600 text-white font-black"
              >
                <Calendar className="mr-2" size={16} />
                SCHEDULE
              </MagneticButton>
              <MagneticButton
                onClick={() => {
                  toast({
                    title: 'Coming Soon',
                    description: 'Draft saving will be available in a future update',
                  })
                }}
                className="glass-effect border-2 border-neutral-300 text-neutral-700 font-black"
              >
                SAVE DRAFT
              </MagneticButton>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="admin-notifs-item opacity-0 glass-effect concrete-texture border-4 border-primary/40">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-black bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent mb-2">
              {notifications.length}
            </div>
            <p className="text-sm font-bold text-neutral-600">TOTAL NOTIFICATIONS</p>
          </CardContent>
        </Card>

        <Card className="admin-notifs-item opacity-0 glass-effect concrete-texture border-4 border-success/40">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-black bg-gradient-to-r from-success to-green-600 bg-clip-text text-transparent mb-2">
              {notifications.filter(n => n.status === 'sent').length}
            </div>
            <p className="text-sm font-bold text-neutral-600">SENT</p>
          </CardContent>
        </Card>

        <Card className="admin-notifs-item opacity-0 glass-effect concrete-texture border-4 border-warning/40">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-black bg-gradient-to-r from-warning to-orange-600 bg-clip-text text-transparent mb-2">
              {notifications.filter(n => n.status === 'scheduled').length}
            </div>
            <p className="text-sm font-bold text-neutral-600">SCHEDULED</p>
          </CardContent>
        </Card>

        <Card className="admin-notifs-item opacity-0 glass-effect concrete-texture border-4 border-neutral-300">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-black bg-gradient-to-r from-neutral-400 to-neutral-600 bg-clip-text text-transparent mb-2">
              {notifications.filter(n => n.status === 'draft').length}
            </div>
            <p className="text-sm font-bold text-neutral-600">DRAFTS</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="admin-notifs-item opacity-0 glass-effect concrete-texture border-4 border-primary/40">
        <CardHeader>
          <CardTitle className="text-xl font-black flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-blue-600 rounded-lg flex items-center justify-center">
              <Filter className="text-white" size={20} />
            </div>
            SEARCH & FILTER
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-400" size={20} />
            <Input
              type="text"
              placeholder="Search notifications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12 glass-effect border-2 border-primary/30 focus:border-primary font-medium"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm font-bold text-neutral-700 mb-2">TYPE</p>
              <div className="flex gap-2 flex-wrap">
                {NOTIFICATION_TYPES.map((type) => (
                  <button
                    key={type}
                    onClick={() => setSelectedType(type)}
                    className={`px-4 py-2 rounded-lg font-bold transition-all ${
                      selectedType === type
                        ? 'bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-lg scale-105'
                        : 'glass-effect border-2 border-orange-500/30 text-neutral-700 hover:border-orange-500/60'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-bold text-neutral-700 mb-2">RECIPIENTS</p>
              <div className="flex gap-2 flex-wrap">
                {RECIPIENTS.map((recipient) => (
                  <button
                    key={recipient}
                    onClick={() => setSelectedRecipients(recipient)}
                    className={`px-4 py-2 rounded-lg font-bold transition-all ${
                      selectedRecipients === recipient
                        ? 'bg-gradient-to-r from-primary to-blue-600 text-white shadow-lg scale-105'
                        : 'glass-effect border-2 border-primary/30 text-neutral-700 hover:border-primary/60'
                    }`}
                  >
                    {recipient}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-bold text-neutral-700 mb-2">STATUS</p>
              <div className="flex gap-2 flex-wrap">
                {STATUSES.map((status) => (
                  <button
                    key={status}
                    onClick={() => setSelectedStatus(status)}
                    className={`px-4 py-2 rounded-lg font-bold transition-all ${
                      selectedStatus === status
                        ? 'bg-gradient-to-r from-success to-green-600 text-white shadow-lg scale-105'
                        : 'glass-effect border-2 border-success/30 text-neutral-700 hover:border-success/60'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notifications List */}
      <Card className="admin-notifs-item opacity-0 glass-effect concrete-texture border-4 border-orange-500/40">
        <CardHeader>
          <CardTitle className="text-xl font-black">
            NOTIFICATIONS ({filteredNotifications.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gradient-to-br from-orange-500/20 to-amber-600/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Bell className="text-orange-500" size={40} />
              </div>
              <h3 className="text-lg font-black text-neutral-800 mb-2">No Notifications Found</h3>
              <p className="text-sm text-neutral-600 mb-4">
                {searchQuery || selectedType !== 'All' || selectedRecipients !== 'All' || selectedStatus !== 'All'
                  ? 'Try adjusting your search or filters'
                  : 'Create a new notification to get started'}
              </p>
              <MagneticButton
                onClick={() => setShowComposer(true)}
                className="bg-gradient-to-r from-orange-500 to-amber-600 text-white font-black"
              >
                <Send className="mr-2" size={16} />
                CREATE NOTIFICATION
              </MagneticButton>
            </div>
          ) : (
          <div className="space-y-4">
            {filteredNotifications.map((notif) => {
              const TypeIcon = getTypeIcon(notif.type)
              const RecipientsIcon = getRecipientsIcon(notif.recipients)

              return (
                <div
                  key={notif.id}
                  className="glass-effect rounded-lg p-6 hover:bg-white/50 transition-all border-2 border-transparent hover:border-orange-500/30"
                >
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <span className={`px-3 py-1 rounded-full bg-gradient-to-r ${getTypeColor(notif.type)} text-white font-black text-xs uppercase flex items-center gap-1`}>
                            <TypeIcon size={12} />
                            {notif.type}
                          </span>
                          <span className={`px-3 py-1 rounded-full bg-gradient-to-r ${getStatusColor(notif.status)} text-white font-black text-xs uppercase`}>
                            {notif.status}
                          </span>
                          <span className="px-3 py-1 rounded-full bg-gradient-to-r from-secondary to-purple-600 text-white font-black text-xs uppercase flex items-center gap-1">
                            <RecipientsIcon size={12} />
                            {notif.recipients.toUpperCase()}
                          </span>
                        </div>
                        <h3 className="text-xl font-black text-neutral-800 mb-2">
                          {notif.title}
                        </h3>
                        <p className="text-sm text-neutral-600 mb-2">
                          {notif.message}
                        </p>
                        <p className="text-xs text-neutral-500">
                          Created by: {notif.createdBy}
                        </p>
                      </div>
                    </div>

                    {/* Stats for sent notifications */}
                    {notif.status === 'sent' && notif.deliveredCount && (
                      <div className="grid grid-cols-3 gap-4 py-3 border-y-2 border-neutral-200">
                        <div className="text-center">
                          <Send className="mx-auto mb-1 text-primary" size={20} />
                          <p className="font-black text-neutral-800">{notif.deliveredCount}</p>
                          <p className="text-xs text-neutral-600">Delivered</p>
                        </div>
                        <div className="text-center">
                          <Eye className="mx-auto mb-1 text-success" size={20} />
                          <p className="font-black text-neutral-800">{notif.readCount}</p>
                          <p className="text-xs text-neutral-600">Read</p>
                        </div>
                        <div className="text-center">
                          <TrendingUp className="mx-auto mb-1 text-warning" size={20} />
                          <p className="font-black text-neutral-800">
                            {notif.readCount && notif.deliveredCount
                              ? Math.round((notif.readCount / notif.deliveredCount) * 100)
                              : 0}%
                          </p>
                          <p className="text-xs text-neutral-600">Read Rate</p>
                        </div>
                      </div>
                    )}

                    {/* Dates */}
                    <div className="flex items-center gap-4 text-sm text-neutral-600">
                      {notif.sentDate && (
                        <div className="flex items-center gap-1">
                          <Clock size={14} />
                          <span>Sent: {new Date(notif.sentDate).toLocaleString()}</span>
                        </div>
                      )}
                      {notif.scheduledDate && (
                        <div className="flex items-center gap-1">
                          <Calendar size={14} />
                          <span>Scheduled: {new Date(notif.scheduledDate).toLocaleString()}</span>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <MagneticButton className="flex-1 glass-effect border-2 border-primary/30 text-neutral-700 font-black hover:border-primary/60">
                        <Eye className="mr-2" size={16} />
                        VIEW
                      </MagneticButton>
                      {notif.status === 'draft' && (
                        <MagneticButton className="flex-1 glass-effect border-2 border-success/30 text-neutral-700 font-black hover:border-success/60">
                          <Send className="mr-2" size={16} />
                          SEND
                        </MagneticButton>
                      )}
                      <button className="w-12 h-12 glass-effect border-2 border-danger/30 rounded-lg flex items-center justify-center hover:border-danger/60 hover:bg-danger/10 transition-all">
                        <Trash2 size={16} className="text-danger" />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
