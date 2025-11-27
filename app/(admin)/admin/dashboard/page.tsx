'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MagneticButton } from '@/components/ui/magnetic-button'
import {
  Users,
  BookOpen,
  GraduationCap,
  Award,
  TrendingUp,
  TrendingDown,
  Activity,
  DollarSign,
  UserPlus,
  CheckCircle,
  AlertTriangle,
  Clock,
  BarChart3,
} from 'lucide-react'

// Initial state for stats
const INITIAL_STATS = {
  totalUsers: 0,
  usersChange: 0,
  activeCourses: 0,
  coursesChange: 0,
  totalEnrollments: 0,
  enrollmentsChange: 0,
  certificatesIssued: 0,
  certificatesChange: 0,
  revenue: 0,
  revenueChange: 0,
  activeUsers: 0,
  activeUsersChange: 0,
  completionRate: 0,
  completionRateChange: 0,
  avgCourseRating: 0,
  ratingChange: 0,
}

interface ActivityItem {
  id: string | number
  type: string
  action: string
  details: string
  time: string
  icon: any
  color: string
}

interface AlertItem {
  id: string | number
  severity: string
  message: string
  time: string
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(INITIAL_STATS)
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([])
  const [systemAlerts, setSystemAlerts] = useState<AlertItem[]>([])
  const [loading, setLoading] = useState(true)

  const formatRelativeTime = (dateString: string): string => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins} min ago`
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`
    if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`
    return date.toLocaleDateString()
  }

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/admin/stats')
        const data = await response.json()

        if (data.success) {
          // Map API data to component structure
          setStats({
            totalUsers: data.data.overview.totalUsers || 0,
            usersChange: 0,
            activeCourses: data.data.overview.publishedCourses || 0,
            coursesChange: 0,
            totalEnrollments: data.data.overview.totalEnrollments || 0,
            enrollmentsChange: 0,
            certificatesIssued: data.data.overview.totalCertificates || 0,
            certificatesChange: 0,
            revenue: 0,
            revenueChange: 0,
            activeUsers: data.data.overview.activeEnrollments || 0,
            activeUsersChange: 0,
            completionRate: data.data.overview.completionRate || 0,
            completionRateChange: 0,
            avgCourseRating: 0,
            ratingChange: 0,
          })

          // Map recent activity with appropriate icons
          if (data.data.recentActivity && Array.isArray(data.data.recentActivity)) {
            setRecentActivity(
              data.data.recentActivity.slice(0, 5).map((activity: any) => ({
                id: activity.id,
                type: 'enrollment',
                action: `${activity.userName || 'User'} enrolled in`,
                details: activity.courseName || 'a course',
                time: formatRelativeTime(activity.createdAt),
                icon: GraduationCap,
                color: 'from-primary to-blue-600',
              }))
            )
          }

          // Set system alerts based on pending items
          const alerts: AlertItem[] = []
          if (data.data.overview.draftCourses > 0) {
            alerts.push({
              id: 'draft-courses',
              severity: 'warning',
              message: `${data.data.overview.draftCourses} courses pending review/publish`,
              time: 'Current'
            })
          }
          if (data.data.overview.pendingEnrollments > 0) {
            alerts.push({
              id: 'pending-enrollments',
              severity: 'info',
              message: `${data.data.overview.pendingEnrollments} enrollments pending approval`,
              time: 'Current'
            })
          }
          if (alerts.length === 0) {
            alerts.push({
              id: 'all-clear',
              severity: 'info',
              message: 'All systems operational - no pending actions',
              time: 'Current'
            })
          }
          setSystemAlerts(alerts)
        }
      } catch (error) {
        console.error('Error fetching admin stats:', error)
        setSystemAlerts([{
          id: 'error',
          severity: 'warning',
          message: 'Unable to fetch system stats - please refresh',
          time: 'Current'
        }])
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  useEffect(() => {
    const elements = document.querySelectorAll('.admin-dash-item')
    elements.forEach((el, index) => {
      const htmlEl = el as HTMLElement
      htmlEl.style.animation = `fadeInUp 0.5s ease-out forwards ${index * 0.05}s`
    })
  }, [loading])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="admin-dash-item opacity-0">
        <div className="glass-effect concrete-texture rounded-xl p-8 relative overflow-hidden border-4 border-danger/40">
          {/* Blueprint corner markers */}
          <div className="absolute top-2 left-2 w-12 h-12 border-t-4 border-l-4 border-danger/60"></div>
          <div className="absolute top-2 right-2 w-12 h-12 border-t-4 border-r-4 border-danger/60"></div>
          <div className="absolute bottom-2 left-2 w-12 h-12 border-b-4 border-l-4 border-danger/60"></div>
          <div className="absolute bottom-2 right-2 w-12 h-12 border-b-4 border-r-4 border-danger/60"></div>

          <div className="absolute inset-0 bg-gradient-to-r from-danger via-warning to-orange-500 opacity-10"></div>
          <div className="absolute inset-0 blueprint-grid opacity-20"></div>

          <div className="relative z-10">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-danger via-warning to-orange-500 bg-clip-text text-transparent mb-2">
                  ADMIN DASHBOARD
                </h1>
                <p className="text-lg font-bold text-neutral-700">
                  System overview and management
                </p>
              </div>

              <div className="flex gap-3">
                <MagneticButton className="bg-gradient-to-r from-primary to-blue-600 text-white font-black">
                  <BarChart3 className="mr-2" size={20} />
                  GENERATE REPORT
                </MagneticButton>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={stats.totalUsers.toLocaleString()}
          change={stats.usersChange}
          icon={Users}
          color="from-secondary to-purple-600"
          loading={loading}
        />
        <StatCard
          title="Active Courses"
          value={stats.activeCourses}
          change={stats.coursesChange}
          icon={BookOpen}
          color="from-success to-green-600"
          loading={loading}
        />
        <StatCard
          title="Total Enrollments"
          value={stats.totalEnrollments.toLocaleString()}
          change={stats.enrollmentsChange}
          icon={GraduationCap}
          color="from-primary to-blue-600"
          loading={loading}
        />
        <StatCard
          title="Certificates"
          value={stats.certificatesIssued}
          change={stats.certificatesChange}
          icon={Award}
          color="from-warning to-orange-600"
          loading={loading}
        />
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Revenue"
          value={`$${stats.revenue.toLocaleString()}`}
          change={stats.revenueChange}
          icon={DollarSign}
          color="from-success to-green-600"
          loading={loading}
        />
        <StatCard
          title="Active Enrollments"
          value={stats.activeUsers}
          change={stats.activeUsersChange}
          icon={Activity}
          color="from-cyan-500 to-blue-500"
          loading={loading}
        />
        <StatCard
          title="Completion Rate"
          value={`${stats.completionRate.toFixed(1)}%`}
          change={stats.completionRateChange}
          icon={CheckCircle}
          color="from-purple-500 to-pink-500"
          loading={loading}
        />
        <StatCard
          title="Avg Rating"
          value={stats.avgCourseRating.toFixed(1)}
          change={stats.ratingChange}
          icon={TrendingUp}
          color="from-yellow-500 to-orange-500"
          loading={loading}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card className="admin-dash-item opacity-0 glass-effect concrete-texture border-4 border-primary/40">
          <CardHeader>
            <CardTitle className="text-xl font-black flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-blue-600 rounded-lg flex items-center justify-center">
                <Activity className="text-white" size={20} />
              </div>
              RECENT ACTIVITY
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-8 text-neutral-500">Loading activity...</div>
              ) : recentActivity.length === 0 ? (
                <div className="text-center py-8 text-neutral-500">No recent activity</div>
              ) : (
                recentActivity.map((activity) => {
                  const Icon = activity.icon
                  return (
                    <div key={activity.id} className="flex items-start gap-3 p-3 glass-effect rounded-lg hover:bg-white/50 transition-colors">
                      <div className={`w-10 h-10 bg-gradient-to-br ${activity.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                        <Icon className="text-white" size={18} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-neutral-800">{activity.action}</p>
                        <p className="text-sm text-neutral-600 truncate">{activity.details}</p>
                        <div className="flex items-center gap-1 text-xs text-neutral-500 mt-1">
                          <Clock size={12} />
                          {activity.time}
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </CardContent>
        </Card>

        {/* System Alerts */}
        <Card className="admin-dash-item opacity-0 glass-effect concrete-texture border-4 border-warning/40">
          <CardHeader>
            <CardTitle className="text-xl font-black flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-warning to-orange-600 rounded-lg flex items-center justify-center">
                <AlertTriangle className="text-white" size={20} />
              </div>
              SYSTEM ALERTS
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {loading ? (
                <div className="text-center py-8 text-neutral-500">Loading alerts...</div>
              ) : systemAlerts.length === 0 ? (
                <div className="text-center py-8 text-neutral-500">No alerts</div>
              ) : (
                systemAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-4 rounded-lg border-2 ${
                      alert.severity === 'warning'
                        ? 'border-warning/40 bg-warning/5'
                        : 'border-primary/40 bg-primary/5'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <p className="font-bold text-neutral-800">{alert.message}</p>
                        <div className="flex items-center gap-1 text-xs text-neutral-500 mt-2">
                          <Clock size={12} />
                          {alert.time}
                        </div>
                      </div>
                      <AlertTriangle
                        className={alert.severity === 'warning' ? 'text-warning' : 'text-primary'}
                        size={20}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="mt-4">
              <MagneticButton className="w-full bg-gradient-to-r from-warning to-orange-600 text-white font-black">
                VIEW ALL ALERTS
              </MagneticButton>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="admin-dash-item opacity-0 glass-effect concrete-texture border-4 border-success/40">
        <CardHeader>
          <CardTitle className="text-xl font-black">QUICK ACTIONS</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MagneticButton className="bg-gradient-to-r from-secondary to-purple-600 text-white font-black h-20">
              <UserPlus className="mr-2" size={20} />
              ADD USER
            </MagneticButton>
            <MagneticButton className="bg-gradient-to-r from-success to-green-600 text-white font-black h-20">
              <BookOpen className="mr-2" size={20} />
              CREATE COURSE
            </MagneticButton>
            <MagneticButton className="bg-gradient-to-r from-primary to-blue-600 text-white font-black h-20">
              <GraduationCap className="mr-2" size={20} />
              MANAGE ENROLLMENTS
            </MagneticButton>
            <MagneticButton className="bg-gradient-to-r from-warning to-orange-600 text-white font-black h-20">
              <Award className="mr-2" size={20} />
              ISSUE CERTIFICATE
            </MagneticButton>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function StatCard({
  title,
  value,
  change,
  icon: Icon,
  color,
  loading = false,
}: {
  title: string
  value: string | number
  change: number
  icon: any
  color: string
  loading?: boolean
}) {
  const isPositive = change >= 0

  return (
    <Card className="admin-dash-item opacity-0 glass-effect concrete-texture border-4 border-neutral-200 hover:border-primary/40 transition-all group">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-bold text-neutral-600 uppercase">{title}</p>
          <div className={`w-12 h-12 bg-gradient-to-br ${color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg`}>
            <Icon className="text-white" size={24} />
          </div>
        </div>

        <div className="space-y-2">
          {loading ? (
            <div className="h-9 bg-neutral-200 animate-pulse rounded w-24"></div>
          ) : (
            <p className="text-3xl font-black text-neutral-800">{value}</p>
          )}

          {change !== 0 && (
            <div className={`flex items-center gap-1 text-sm font-bold ${isPositive ? 'text-success' : 'text-danger'}`}>
              {isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
              <span>{isPositive ? '+' : ''}{change}%</span>
              <span className="text-neutral-500 font-medium">vs last month</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
