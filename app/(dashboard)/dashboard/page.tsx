'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MagneticButton } from '@/components/ui/magnetic-button'
import { BookOpen, Award, Clock, TrendingUp, HardHat, Target, Zap, AlertCircle, ChevronRight, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { coursesService, certificatesService } from '@/lib/services'

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [stats, setStats] = useState({
    enrolled: 0,
    inProgress: 0,
    completed: 0,
    certificates: 0,
    learningHours: 0,
    streak: 7
  })
  const [enrollments, setEnrollments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem('user')
      if (userData) {
        setUser(JSON.parse(userData))
      }
    }

    // Fetch dashboard data
    fetchDashboardData()

    // Simple CSS-only entrance animations
    const elements = document.querySelectorAll('.dashboard-item')
    elements.forEach((el, index) => {
      const htmlEl = el as HTMLElement
      htmlEl.style.animation = `fadeInUp 0.5s ease-out forwards ${index * 0.1}s`
    })
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch enrollments
      const enrollmentsResponse = await coursesService.getEnrollments()

      if (enrollmentsResponse.error) {
        throw new Error(enrollmentsResponse.error)
      }

      const enrollmentsData = enrollmentsResponse.data?.data || []
      setEnrollments(enrollmentsData.slice(0, 2)) // Get first 2 for display

      // Fetch certificates
      const certificatesResponse = await certificatesService.getCertificates()
      const certificatesData = certificatesResponse.data?.data || []

      // Calculate stats from enrollments
      const enrolled = enrollmentsData.length
      const inProgress = enrollmentsData.filter((e: any) => e.status === 'ENROLLED' && e.progressPercentage > 0 && e.progressPercentage < 100).length
      const completed = enrollmentsData.filter((e: any) => e.status === 'COMPLETED' || e.progressPercentage === 100).length
      const certificates = certificatesData.length

      // Calculate total learning hours (placeholder - would need real tracking)
      const learningHours = Math.round(enrollmentsData.reduce((acc: number, e: any) => acc + (e.progressPercentage || 0) / 10, 0))

      setStats({
        enrolled,
        inProgress,
        completed,
        certificates,
        learningHours,
        streak: 7 // Placeholder - would need real streak tracking
      })
    } catch (err) {
      console.error('Error fetching dashboard data:', err)
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 mx-auto text-warning mb-4" />
          <p className="text-lg font-bold text-neutral-700">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="glass-effect concrete-texture border-4 border-red-500/40 max-w-md">
          <CardHeader>
            <CardTitle className="text-xl font-black flex items-center gap-2 text-red-600">
              <AlertCircle />
              Error Loading Dashboard
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-neutral-700 mb-4">{error}</p>
            <MagneticButton onClick={fetchDashboardData} className="bg-gradient-to-r from-warning to-orange-600 text-white font-black">
              Try Again
            </MagneticButton>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="dashboard-item opacity-0">
        <div className="glass-effect concrete-texture rounded-xl p-8 md:p-12 relative overflow-hidden border-4 border-warning/40">
          {/* Blueprint corner markers */}
          <div className="absolute top-2 left-2 w-12 h-12 border-t-4 border-l-4 border-warning/60"></div>
          <div className="absolute top-2 right-2 w-12 h-12 border-t-4 border-r-4 border-warning/60"></div>
          <div className="absolute bottom-2 left-2 w-12 h-12 border-b-4 border-l-4 border-warning/60"></div>
          <div className="absolute bottom-2 right-2 w-12 h-12 border-b-4 border-r-4 border-warning/60"></div>

          {/* Construction background */}
          <div className="absolute inset-0 bg-gradient-to-r from-warning via-primary to-success opacity-10"></div>
          <div className="absolute inset-0 blueprint-grid opacity-20"></div>

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-warning to-orange-600 rounded-xl flex items-center justify-center">
                <HardHat className="text-white" size={32} />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-warning via-primary to-success bg-clip-text text-transparent">
                  WELCOME BACK, {user?.firstName?.toUpperCase() || 'WORKER'}!
                </h1>
                <p className="text-sm font-bold text-neutral-600 mt-1">CONSTRUCTION TRAINING IN PROGRESS</p>
              </div>
            </div>
            <p className="text-lg font-semibold text-neutral-700 mb-6 max-w-2xl">
              Continue building your skills and unlock new certifications today
            </p>
            <Link href="/courses">
              <MagneticButton className="bg-gradient-to-r from-warning to-orange-600 text-white font-black">
                <Zap className="mr-2" />
                BROWSE TRAINING COURSES
              </MagneticButton>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="dashboard-item opacity-0 glass-effect concrete-texture border-4 border-primary/40 relative">
          <div className="absolute top-0 right-0 w-2 h-full bg-gradient-to-b from-primary to-blue-600"></div>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-bold text-neutral-700 uppercase">
              Enrolled Courses
            </CardTitle>
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <BookOpen className="text-white" size={24} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-5xl font-black bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">{stats.enrolled}</div>
            <p className="text-sm font-bold text-neutral-600 mt-2 flex items-center gap-1">
              <TrendingUp size={14} className="text-success" />
              {stats.inProgress} in progress
            </p>
          </CardContent>
        </Card>

        <Card className="dashboard-item opacity-0 glass-effect concrete-texture border-4 border-success/40 relative">
          <div className="absolute top-0 right-0 w-2 h-full bg-gradient-to-b from-success to-green-600"></div>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-bold text-neutral-700 uppercase">
              Completed
            </CardTitle>
            <div className="w-12 h-12 bg-gradient-to-br from-success to-green-600 rounded-xl flex items-center justify-center shadow-lg">
              <Award className="text-white" size={24} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-5xl font-black bg-gradient-to-r from-success to-green-600 bg-clip-text text-transparent">{stats.completed}</div>
            <p className="text-sm font-bold text-neutral-600 mt-2 flex items-center gap-1">
              <Award size={14} className="text-warning" />
              {stats.certificates} certificates earned
            </p>
          </CardContent>
        </Card>

        <Card className="dashboard-item opacity-0 glass-effect concrete-texture border-4 border-secondary/40 relative">
          <div className="absolute top-0 right-0 w-2 h-full bg-gradient-to-b from-secondary to-purple-600"></div>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-bold text-neutral-700 uppercase">
              Learning Time
            </CardTitle>
            <div className="w-12 h-12 bg-gradient-to-br from-secondary to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <Clock className="text-white" size={24} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-5xl font-black bg-gradient-to-r from-secondary to-purple-600 bg-clip-text text-transparent">{stats.learningHours}h</div>
            <p className="text-sm font-bold text-neutral-600 mt-2">
              Total training time
            </p>
          </CardContent>
        </Card>

        <Card className="dashboard-item opacity-0 glass-effect concrete-texture border-4 border-warning/40 relative">
          <div className="absolute top-0 right-0 w-2 h-full bg-gradient-to-b from-warning to-orange-600"></div>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-bold text-neutral-700 uppercase">
              Current Streak
            </CardTitle>
            <div className="w-12 h-12 bg-gradient-to-br from-warning to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
              <Target className="text-white" size={24} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-5xl font-black bg-gradient-to-r from-warning to-orange-600 bg-clip-text text-transparent">{stats.streak}</div>
            <p className="text-sm font-bold text-neutral-600 mt-2">
              Days in a row 🔥
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Continue Learning */}
      <Card className="dashboard-item opacity-0 glass-effect concrete-texture border-4 border-primary/40">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-black flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-blue-600 rounded-lg flex items-center justify-center">
                <BookOpen className="text-white" size={20} />
              </div>
              CONTINUE TRAINING
            </CardTitle>
            <Link href="/my-learning">
              <span className="text-sm font-bold text-primary hover:text-primary/80 flex items-center gap-1">
                View All <ChevronRight size={16} />
              </span>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {enrollments.length === 0 ? (
            <div className="text-center py-8">
              <BookOpen className="mx-auto h-16 w-16 text-neutral-400 mb-4" />
              <p className="text-neutral-600 font-semibold mb-4">You haven't enrolled in any courses yet</p>
              <Link href="/courses">
                <MagneticButton className="bg-gradient-to-r from-primary to-blue-600 text-white font-black">
                  Browse Courses
                </MagneticButton>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {enrollments.map((enrollment: any, index) => {
                const progress = enrollment.progressPercentage || 0
                const colors = index === 0
                  ? { border: 'border-primary/20 hover:border-primary/40', bg: 'from-primary/20 to-blue-600/20', text: 'text-primary', gradient: 'from-primary to-blue-600' }
                  : { border: 'border-success/20 hover:border-success/40', bg: 'from-success/20 to-green-600/20', text: 'text-success', gradient: 'from-success to-green-600' }

                return (
                  <Link key={enrollment.id} href={`/courses/${enrollment.courseId}`}>
                    <div className={`glass-effect border-2 ${colors.border} rounded-lg p-4 transition-colors cursor-pointer`}>
                      <div className="flex items-start gap-3">
                        <div className={`w-16 h-16 bg-gradient-to-br ${colors.bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                          <BookOpen className={colors.text} size={28} />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-neutral-800">{enrollment.course?.title || 'Course'}</h3>
                          <p className="text-xs text-neutral-600 mt-1">{enrollment.course?.category?.name || 'General'}</p>
                          <div className="mt-3">
                            <div className="flex items-center justify-between text-xs font-semibold mb-1">
                              <span className="text-neutral-600">Progress</span>
                              <span className={colors.text}>{progress}%</span>
                            </div>
                            <div className="w-full bg-neutral-200 rounded-full h-2">
                              <div className={`bg-gradient-to-r ${colors.gradient} h-2 rounded-full`} style={{width: `${progress}%`}}></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="dashboard-item opacity-0 glass-effect concrete-texture border-4 border-warning/40">
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
            <Link href="/courses">
              <div className="glass-effect border-2 border-warning/30 rounded-lg p-6 hover:border-warning hover:shadow-lg transition-all group cursor-pointer">
                <div className="w-12 h-12 bg-gradient-to-br from-warning to-orange-600 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <BookOpen className="text-white" size={24} />
                </div>
                <h3 className="font-black text-neutral-800 mb-1">BROWSE COURSES</h3>
                <p className="text-sm text-neutral-600">Explore available training</p>
              </div>
            </Link>

            <Link href="/certificates">
              <div className="glass-effect border-2 border-success/30 rounded-lg p-6 hover:border-success hover:shadow-lg transition-all group cursor-pointer">
                <div className="w-12 h-12 bg-gradient-to-br from-success to-green-600 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Award className="text-white" size={24} />
                </div>
                <h3 className="font-black text-neutral-800 mb-1">MY CERTIFICATES</h3>
                <p className="text-sm text-neutral-600">View earned credentials</p>
              </div>
            </Link>

            <Link href="/help">
              <div className="glass-effect border-2 border-primary/30 rounded-lg p-6 hover:border-primary hover:shadow-lg transition-all group cursor-pointer">
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-blue-600 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <AlertCircle className="text-white" size={24} />
                </div>
                <h3 className="font-black text-neutral-800 mb-1">GET HELP</h3>
                <p className="text-sm text-neutral-600">Support and resources</p>
              </div>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
