'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, BookOpen, Award, TrendingUp, Activity, Loader2, AlertCircle, HardHat, Target, Zap } from 'lucide-react'
import { adminService, type AdminStats } from '@/lib/services'
import { MagneticButton } from '@/components/ui/magnetic-button'
import Link from 'next/link'
import { useAuth } from '@/lib/hooks/useAuth'

export default function AdminDashboardPage() {
  // Require admin or super admin role
  useAuth(['ADMIN', 'SUPER_ADMIN'])

  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchStats()

    // Simple CSS-only entrance animations
    const elements = document.querySelectorAll('.admin-item')
    elements.forEach((el, index) => {
      const htmlEl = el as HTMLElement
      htmlEl.style.animation = `fadeInUp 0.5s ease-out forwards ${index * 0.05}s`
    })
  }, [])

  const fetchStats = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await adminService.getStats()

      if (response.status >= 200 && response.status < 300 && response.data) {
        // Extract the nested data from the API response
        // API returns: { success: true, data: { overview: {...}, ... } }
        // We need to extract the inner 'data' property
        const apiData = response.data as any
        setStats(apiData.data || apiData)
      } else {
        throw new Error(response.error || 'Failed to load stats')
      }
    } catch (err) {
      console.error('Error fetching admin stats:', err)
      setError(err instanceof Error ? err.message : 'Failed to load admin statistics')
    } finally {
      setLoading(false)
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 mx-auto text-warning mb-4" />
          <p className="text-lg font-bold text-neutral-700">Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error || !stats) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="glass-effect concrete-texture border-4 border-red-500/40 max-w-md">
          <CardHeader>
            <CardTitle className="text-xl font-black flex items-center gap-2 text-red-600">
              <AlertCircle />
              ERROR LOADING DASHBOARD
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-neutral-700 mb-4">{error || 'Failed to load dashboard data'}</p>
            <MagneticButton
              onClick={fetchStats}
              className="bg-gradient-to-r from-primary to-blue-600 text-white font-black"
            >
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
      <div className="admin-item opacity-0">
        <div className="glass-effect concrete-texture rounded-xl p-8 relative overflow-hidden border-4 border-warning/40">
          {/* Blueprint corner markers */}
          <div className="absolute top-2 left-2 w-12 h-12 border-t-4 border-l-4 border-warning/60"></div>
          <div className="absolute top-2 right-2 w-12 h-12 border-t-4 border-r-4 border-warning/60"></div>
          <div className="absolute bottom-2 left-2 w-12 h-12 border-b-4 border-l-4 border-warning/60"></div>
          <div className="absolute bottom-2 right-2 w-12 h-12 border-b-4 border-r-4 border-warning/60"></div>

          <div className="absolute inset-0 bg-gradient-to-r from-warning via-primary to-success opacity-10"></div>
          <div className="absolute inset-0 blueprint-grid opacity-20"></div>

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-warning to-orange-600 rounded-xl flex items-center justify-center">
                <HardHat className="text-white" size={32} />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-warning via-primary to-success bg-clip-text text-transparent">
                  ADMIN DASHBOARD
                </h1>
                <p className="text-sm font-bold text-neutral-600 mt-1">SYSTEM OVERVIEW & MANAGEMENT</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="admin-item opacity-0 glass-effect concrete-texture border-4 border-primary/40 relative">
          <div className="absolute top-0 right-0 w-2 h-full bg-gradient-to-b from-primary to-blue-600"></div>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-bold text-neutral-700 uppercase">
              Total Users
            </CardTitle>
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <Users className="text-white" size={24} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-5xl font-black bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              {stats.overview.totalUsers}
            </div>
            <p className="text-sm font-bold text-neutral-600 mt-2 flex items-center gap-1">
              <TrendingUp size={14} className="text-success" />
              {stats.overview.recentEnrollments} new this week
            </p>
          </CardContent>
        </Card>

        <Card className="admin-item opacity-0 glass-effect concrete-texture border-4 border-success/40 relative">
          <div className="absolute top-0 right-0 w-2 h-full bg-gradient-to-b from-success to-green-600"></div>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-bold text-neutral-700 uppercase">
              Total Courses
            </CardTitle>
            <div className="w-12 h-12 bg-gradient-to-br from-success to-green-600 rounded-xl flex items-center justify-center shadow-lg">
              <BookOpen className="text-white" size={24} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-5xl font-black bg-gradient-to-r from-success to-green-600 bg-clip-text text-transparent">
              {stats.overview.totalCourses}
            </div>
            <p className="text-sm font-bold text-neutral-600 mt-2">
              {stats.overview.publishedCourses} published
            </p>
          </CardContent>
        </Card>

        <Card className="admin-item opacity-0 glass-effect concrete-texture border-4 border-warning/40 relative">
          <div className="absolute top-0 right-0 w-2 h-full bg-gradient-to-b from-warning to-orange-600"></div>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-bold text-neutral-700 uppercase">
              Certificates Issued
            </CardTitle>
            <div className="w-12 h-12 bg-gradient-to-br from-warning to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
              <Award className="text-white" size={24} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-5xl font-black bg-gradient-to-r from-warning to-orange-600 bg-clip-text text-transparent">
              {stats.overview.totalCertificates}
            </div>
            <p className="text-sm font-bold text-neutral-600 mt-2">
              Total awarded
            </p>
          </CardContent>
        </Card>

        <Card className="admin-item opacity-0 glass-effect concrete-texture border-4 border-secondary/40 relative">
          <div className="absolute top-0 right-0 w-2 h-full bg-gradient-to-b from-secondary to-purple-600"></div>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-bold text-neutral-700 uppercase">
              Completion Rate
            </CardTitle>
            <div className="w-12 h-12 bg-gradient-to-br from-secondary to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <TrendingUp className="text-white" size={24} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-5xl font-black bg-gradient-to-r from-secondary to-purple-600 bg-clip-text text-transparent">
              {stats.overview.completionRate}%
            </div>
            <p className="text-sm font-bold text-neutral-600 mt-2">
              {stats.overview.completedEnrollments} / {stats.overview.totalEnrollments} enrollments
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Enrollment Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="admin-item opacity-0 glass-effect concrete-texture border-2 border-primary/30">
          <CardHeader>
            <CardTitle className="text-sm font-bold text-neutral-700">TOTAL ENROLLMENTS</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-primary">{stats.overview.totalEnrollments}</div>
          </CardContent>
        </Card>

        <Card className="admin-item opacity-0 glass-effect concrete-texture border-2 border-warning/30">
          <CardHeader>
            <CardTitle className="text-sm font-bold text-neutral-700">ACTIVE LEARNING</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-warning">{stats.overview.activeEnrollments}</div>
          </CardContent>
        </Card>

        <Card className="admin-item opacity-0 glass-effect concrete-texture border-2 border-success/30">
          <CardHeader>
            <CardTitle className="text-sm font-bold text-neutral-700">COMPLETED</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-success">{stats.overview.completedEnrollments}</div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="admin-item opacity-0 glass-effect concrete-texture border-4 border-primary/40">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-black flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-blue-600 rounded-lg flex items-center justify-center">
                <Activity className="text-white" size={20} />
              </div>
              RECENT ACTIVITY
            </CardTitle>
            <Link href="/admin/users">
              <span className="text-sm font-bold text-primary hover:text-primary/80">View All</span>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {stats.recentActivity.length === 0 ? (
            <div className="text-center py-8">
              <Activity className="mx-auto h-16 w-16 text-neutral-400 mb-4" />
              <p className="text-neutral-600 font-semibold">No recent activity</p>
            </div>
          ) : (
            <div className="space-y-3">
              {stats.recentActivity.slice(0, 5).map((activity) => (
                <div
                  key={activity.id}
                  className="glass-effect border-2 border-neutral-200 rounded-lg p-4 flex items-center gap-3"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-primary to-blue-600 rounded-full flex items-center justify-center text-white font-black">
                    {activity.userName.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-neutral-800">
                      {activity.userName}
                    </p>
                    <p className="text-sm text-neutral-600">
                      Enrolled in <span className="font-semibold">{activity.courseName}</span>
                    </p>
                  </div>
                  <div className="text-xs font-semibold text-neutral-500">
                    {new Date(activity.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Popular Courses */}
      <Card className="admin-item opacity-0 glass-effect concrete-texture border-4 border-success/40">
        <CardHeader>
          <CardTitle className="text-2xl font-black flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-success to-green-600 rounded-lg flex items-center justify-center">
              <Target className="text-white" size={20} />
            </div>
            POPULAR COURSES
          </CardTitle>
        </CardHeader>
        <CardContent>
          {stats.popularCourses.length === 0 ? (
            <div className="text-center py-8">
              <BookOpen className="mx-auto h-16 w-16 text-neutral-400 mb-4" />
              <p className="text-neutral-600 font-semibold">No courses yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {stats.popularCourses.map((course, index) => (
                <div
                  key={course.id}
                  className="glass-effect border-2 border-neutral-200 rounded-lg p-4 flex items-center gap-3"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-success to-green-600 rounded-lg flex items-center justify-center text-white font-black text-lg">
                    #{index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-neutral-800">{course.title}</p>
                    <p className="text-sm text-neutral-600">{course.category?.name || 'Uncategorized'}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users size={16} className="text-success" />
                    <span className="text-lg font-black text-success">{course.enrollmentCount}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="admin-item opacity-0 glass-effect concrete-texture border-4 border-warning/40">
        <CardHeader>
          <CardTitle className="text-2xl font-black flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-warning to-orange-600 rounded-lg flex items-center justify-center">
              <Zap className="text-white" size={20} />
            </div>
            QUICK ACTIONS
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/admin/users">
              <div className="glass-effect border-2 border-primary/30 rounded-lg p-6 hover:border-primary hover:shadow-lg transition-all group cursor-pointer">
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-blue-600 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Users className="text-white" size={24} />
                </div>
                <h3 className="font-black text-neutral-800 mb-1">MANAGE USERS</h3>
                <p className="text-sm text-neutral-600">Add, edit, or remove users</p>
              </div>
            </Link>

            <Link href="/admin/courses">
              <div className="glass-effect border-2 border-success/30 rounded-lg p-6 hover:border-success hover:shadow-lg transition-all group cursor-pointer">
                <div className="w-12 h-12 bg-gradient-to-br from-success to-green-600 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <BookOpen className="text-white" size={24} />
                </div>
                <h3 className="font-black text-neutral-800 mb-1">MANAGE COURSES</h3>
                <p className="text-sm text-neutral-600">Create and edit courses</p>
              </div>
            </Link>

            <Link href="/admin/reports">
              <div className="glass-effect border-2 border-warning/30 rounded-lg p-6 hover:border-warning hover:shadow-lg transition-all group cursor-pointer">
                <div className="w-12 h-12 bg-gradient-to-br from-warning to-orange-600 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <TrendingUp className="text-white" size={24} />
                </div>
                <h3 className="font-black text-neutral-800 mb-1">VIEW REPORTS</h3>
                <p className="text-sm text-neutral-600">Analytics and insights</p>
              </div>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
