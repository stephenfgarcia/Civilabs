'use client'

import { useEffect } from 'react'
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
  BookMarked,
  CheckCircle,
  AlertTriangle,
  Clock,
  BarChart3,
} from 'lucide-react'

// Mock admin dashboard data
const ADMIN_STATS = {
  totalUsers: 1247,
  usersChange: 12.5,
  activeCourses: 43,
  coursesChange: 8.3,
  totalEnrollments: 5823,
  enrollmentsChange: 15.2,
  certificatesIssued: 892,
  certificatesChange: 22.1,
  revenue: 45280,
  revenueChange: 18.7,
  activeUsers: 834,
  activeUsersChange: 5.4,
  completionRate: 68.5,
  completionRateChange: -2.3,
  avgCourseRating: 4.6,
  ratingChange: 0.2,
}

const RECENT_ACTIVITIES = [
  {
    id: 1,
    type: 'user',
    action: 'New user registered',
    details: 'john.doe@example.com',
    time: '5 minutes ago',
    icon: UserPlus,
    color: 'from-success to-green-600'
  },
  {
    id: 2,
    type: 'course',
    action: 'Course published',
    details: 'Advanced Welding Techniques',
    time: '23 minutes ago',
    icon: BookMarked,
    color: 'from-primary to-blue-600'
  },
  {
    id: 3,
    type: 'certificate',
    action: 'Certificate issued',
    details: 'Sarah Johnson - Construction Safety',
    time: '1 hour ago',
    icon: Award,
    color: 'from-warning to-orange-600'
  },
  {
    id: 4,
    type: 'enrollment',
    action: 'Course enrollment',
    details: '15 new enrollments today',
    time: '2 hours ago',
    icon: GraduationCap,
    color: 'from-secondary to-purple-600'
  },
  {
    id: 5,
    type: 'completion',
    action: 'Course completed',
    details: 'Mike Chen - Heavy Equipment Operation',
    time: '3 hours ago',
    icon: CheckCircle,
    color: 'from-success to-green-600'
  },
]

const SYSTEM_ALERTS = [
  {
    id: 1,
    severity: 'warning',
    message: 'Database backup pending - scheduled for tonight',
    time: '1 hour ago',
  },
  {
    id: 2,
    severity: 'info',
    message: 'New feature: Discussion forums now live',
    time: '3 hours ago',
  },
  {
    id: 3,
    severity: 'warning',
    message: '3 courses pending approval',
    time: '5 hours ago',
  },
]

export default function AdminDashboardPage() {
  useEffect(() => {
    const elements = document.querySelectorAll('.admin-dash-item')
    elements.forEach((el, index) => {
      const htmlEl = el as HTMLElement
      htmlEl.style.animation = `fadeInUp 0.5s ease-out forwards ${index * 0.05}s`
    })
  }, [])

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
          value={ADMIN_STATS.totalUsers.toLocaleString()}
          change={ADMIN_STATS.usersChange}
          icon={Users}
          color="from-secondary to-purple-600"
        />
        <StatCard
          title="Active Courses"
          value={ADMIN_STATS.activeCourses}
          change={ADMIN_STATS.coursesChange}
          icon={BookOpen}
          color="from-success to-green-600"
        />
        <StatCard
          title="Total Enrollments"
          value={ADMIN_STATS.totalEnrollments.toLocaleString()}
          change={ADMIN_STATS.enrollmentsChange}
          icon={GraduationCap}
          color="from-primary to-blue-600"
        />
        <StatCard
          title="Certificates"
          value={ADMIN_STATS.certificatesIssued}
          change={ADMIN_STATS.certificatesChange}
          icon={Award}
          color="from-warning to-orange-600"
        />
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Revenue"
          value={`$${ADMIN_STATS.revenue.toLocaleString()}`}
          change={ADMIN_STATS.revenueChange}
          icon={DollarSign}
          color="from-success to-green-600"
        />
        <StatCard
          title="Active Users (30d)"
          value={ADMIN_STATS.activeUsers}
          change={ADMIN_STATS.activeUsersChange}
          icon={Activity}
          color="from-cyan-500 to-blue-500"
        />
        <StatCard
          title="Completion Rate"
          value={`${ADMIN_STATS.completionRate}%`}
          change={ADMIN_STATS.completionRateChange}
          icon={CheckCircle}
          color="from-purple-500 to-pink-500"
        />
        <StatCard
          title="Avg Rating"
          value={ADMIN_STATS.avgCourseRating.toFixed(1)}
          change={ADMIN_STATS.ratingChange}
          icon={TrendingUp}
          color="from-yellow-500 to-orange-500"
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
              {RECENT_ACTIVITIES.map((activity) => {
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
              })}
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
              {SYSTEM_ALERTS.map((alert) => (
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
              ))}
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
}: {
  title: string
  value: string | number
  change: number
  icon: any
  color: string
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
          <p className="text-3xl font-black text-neutral-800">{value}</p>

          <div className={`flex items-center gap-1 text-sm font-bold ${isPositive ? 'text-success' : 'text-danger'}`}>
            {isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
            <span>{isPositive ? '+' : ''}{change}%</span>
            <span className="text-neutral-500 font-medium">vs last month</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
