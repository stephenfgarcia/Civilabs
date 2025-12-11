/**
 * Instructor Dashboard Page
 * Main dashboard for instructors to manage their courses and students
 */

'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { MagneticButton } from '@/components/ui/magnetic-button'
import {
  BookOpen,
  Users,
  TrendingUp,
  Clock,
  Star,
  MessageSquare,
  Award,
  AlertCircle,
  Plus,
  ArrowRight,
  Loader2,
} from 'lucide-react'
import Link from 'next/link'
import { instructorService, type InstructorStatsResponse } from '@/lib/services'

export default function InstructorDashboardPage() {
  const [data, setData] = useState<InstructorStatsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  async function fetchDashboardData() {
    try {
      setLoading(true)
      setError(null)
      const statsData = await instructorService.getStats()
      setData(statsData)
    } catch (err) {
      console.error('Error fetching instructor dashboard data:', err)
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-warning mx-auto mb-4" />
          <p className="text-lg font-bold text-neutral-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="p-8 border-4 border-danger/40 max-w-md">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-danger mx-auto mb-4" />
            <h2 className="text-xl font-black text-neutral-800 mb-2">Failed to Load</h2>
            <p className="text-neutral-600 mb-4">{error || 'Unable to load dashboard data'}</p>
            <MagneticButton
              onClick={fetchDashboardData}
              className="bg-gradient-to-r from-warning to-orange-600 text-white font-black"
            >
              TRY AGAIN
            </MagneticButton>
          </div>
        </Card>
      </div>
    )
  }

  const getIconBgClass = (color: string) => {
    switch (color) {
      case 'warning':
        return 'bg-gradient-to-br from-warning to-orange-600'
      case 'primary':
        return 'bg-gradient-to-br from-primary to-blue-600'
      case 'success':
        return 'bg-gradient-to-br from-success to-green-600'
      case 'secondary':
        return 'bg-gradient-to-br from-secondary to-purple-600'
      default:
        return 'bg-gradient-to-br from-neutral-500 to-neutral-600'
    }
  }

  const stats = [
    {
      label: 'Active Courses',
      value: data.stats.activeCourses.toString(),
      change: '+' + data.stats.activeCourses,
      trend: 'up',
      icon: BookOpen,
      color: 'warning',
    },
    {
      label: 'Total Students',
      value: data.stats.totalStudents.toString(),
      change: '+' + data.stats.uniqueStudents,
      trend: 'up',
      icon: Users,
      color: 'primary',
    },
    {
      label: 'Avg. Rating',
      value: data.stats.avgRating.toFixed(1),
      change: '+0.2',
      trend: 'up',
      icon: Star,
      color: 'success',
    },
    {
      label: 'Completion Rate',
      value: data.stats.completionRate + '%',
      change: '+5%',
      trend: 'up',
      icon: TrendingUp,
      color: 'secondary',
    },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black bg-gradient-to-r from-warning via-orange-500 to-amber-600 bg-clip-text text-transparent">
            INSTRUCTOR DASHBOARD
          </h1>
          <p className="text-neutral-600 font-medium mt-2">
            Welcome back! Here's what's happening with your courses.
          </p>
        </div>

        <Link href="/instructor/my-courses/request">
          <MagneticButton className="bg-gradient-to-r from-warning to-orange-600 text-white font-black">
            <Plus className="mr-2" size={20} />
            REQUEST COURSE
          </MagneticButton>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card
              key={stat.label}
              className="p-6 border-4 border-neutral-200 hover:border-warning/40 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div
                  className={`w-12 h-12 ${getIconBgClass(stat.color)} rounded-lg flex items-center justify-center shadow-lg`}
                >
                  <Icon className="text-white" size={24} />
                </div>
                <span className="text-xs font-black text-success bg-success/10 px-2 py-1 rounded">
                  {stat.change}
                </span>
              </div>

              <p className="text-sm font-bold text-neutral-600 mb-1">{stat.label}</p>
              <p className="text-3xl font-black text-neutral-800">{stat.value}</p>
            </Card>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Pending Tasks */}
        <div className="lg:col-span-2">
          <Card className="p-6 border-4 border-warning/40">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black text-neutral-800 flex items-center gap-2">
                <Clock className="text-warning" size={24} />
                PENDING TASKS
              </h2>
              <span className="text-sm font-black text-neutral-600 bg-neutral-100 px-3 py-1 rounded">
                {data.pendingTasks.assignmentsToGrade +
                  data.pendingTasks.discussionsToRespond +
                  data.pendingTasks.quizzesToReview}{' '}
                Tasks
              </span>
            </div>

            {data.pendingTasks.assignmentsToGrade === 0 &&
            data.pendingTasks.discussionsToRespond === 0 &&
            data.pendingTasks.quizzesToReview === 0 ? (
              <div className="text-center py-12">
                <Award className="w-16 h-16 text-success mx-auto mb-4 opacity-50" />
                <p className="text-lg font-bold text-neutral-600">All caught up!</p>
                <p className="text-sm text-neutral-500 mt-2">
                  No pending tasks at the moment.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {data.pendingTasks.assignmentsToGrade > 0 && (
                  <div className="flex items-start gap-4 p-4 bg-neutral-50 rounded-lg border-2 border-neutral-200 hover:border-warning/40 transition-all">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center bg-danger/10 text-danger">
                      <AlertCircle size={20} />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-neutral-800 mb-1">
                        Grade {data.pendingTasks.assignmentsToGrade} assignment
                        {data.pendingTasks.assignmentsToGrade > 1 ? 's' : ''}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-neutral-600">
                        <span className="font-medium">Multiple Courses</span>
                        <span className="font-black px-2 py-0.5 rounded text-xs bg-danger/10 text-danger">
                          HIGH
                        </span>
                      </div>
                    </div>
                    <button className="text-warning hover:text-orange-600 font-bold">
                      <ArrowRight size={20} />
                    </button>
                  </div>
                )}

                {data.pendingTasks.discussionsToRespond > 0 && (
                  <div className="flex items-start gap-4 p-4 bg-neutral-50 rounded-lg border-2 border-neutral-200 hover:border-warning/40 transition-all">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center bg-warning/10 text-warning">
                      <MessageSquare size={20} />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-neutral-800 mb-1">
                        Respond to {data.pendingTasks.discussionsToRespond} discussion
                        {data.pendingTasks.discussionsToRespond > 1 ? 's' : ''}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-neutral-600">
                        <span className="font-medium">Multiple Courses</span>
                        <span className="font-black px-2 py-0.5 rounded text-xs bg-warning/10 text-warning">
                          MEDIUM
                        </span>
                      </div>
                    </div>
                    <button className="text-warning hover:text-orange-600 font-bold">
                      <ArrowRight size={20} />
                    </button>
                  </div>
                )}

                {data.pendingTasks.quizzesToReview > 0 && (
                  <div className="flex items-start gap-4 p-4 bg-neutral-50 rounded-lg border-2 border-neutral-200 hover:border-warning/40 transition-all">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center bg-primary/10 text-primary">
                      <BookOpen size={20} />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-neutral-800 mb-1">
                        Review {data.pendingTasks.quizzesToReview} quiz
                        {data.pendingTasks.quizzesToReview > 1 ? 'zes' : ''}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-neutral-600">
                        <span className="font-medium">Multiple Courses</span>
                        <span className="font-black px-2 py-0.5 rounded text-xs bg-primary/10 text-primary">
                          LOW
                        </span>
                      </div>
                    </div>
                    <button className="text-warning hover:text-orange-600 font-bold">
                      <ArrowRight size={20} />
                    </button>
                  </div>
                )}
              </div>
            )}
          </Card>
        </div>

        {/* Top Performing Courses */}
        <div>
          <Card className="p-6 border-4 border-primary/40">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-black text-neutral-800 flex items-center gap-2">
                <Star className="text-primary" size={20} />
                TOP COURSES
              </h2>
            </div>

            {data.topCourses.length === 0 ? (
              <div className="text-center py-8">
                <BookOpen className="w-12 h-12 text-neutral-400 mx-auto mb-3 opacity-50" />
                <p className="text-sm font-bold text-neutral-500">No courses yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {data.topCourses.map((course, index) => (
                  <div
                    key={course.id}
                    className="p-4 bg-neutral-50 rounded-lg border-2 border-neutral-200 hover:border-primary/40 transition-all"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <p className="font-black text-neutral-800 text-sm">{course.title}</p>
                      <div className="flex items-center gap-1 text-amber-500">
                        <Star size={14} fill="currentColor" />
                        <span className="text-xs font-black">{data.stats.avgRating}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-neutral-600 mb-3">
                      <span className="font-medium flex items-center gap-1">
                        <Users size={12} />
                        {course.students}
                      </span>
                      <span className="font-medium flex items-center gap-1">
                        <BookOpen size={12} />
                        {course.lessons} lessons
                      </span>
                    </div>

                    <div className="w-full bg-neutral-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-primary to-blue-600 h-2 rounded-full"
                        style={{ width: `${course.completionRate}%` }}
                      ></div>
                    </div>
                    <p className="text-xs font-medium text-neutral-600 mt-1">
                      {course.completionRate}% completion rate
                    </p>
                  </div>
                ))}
              </div>
            )}

            <Link href="/instructor/my-courses">
              <MagneticButton className="w-full mt-4 glass-effect border-2 border-primary/30 text-neutral-700 font-black hover:border-primary/60">
                VIEW ALL COURSES
              </MagneticButton>
            </Link>
          </Card>
        </div>
      </div>

      {/* Recent Activity */}
      <Card className="p-6 border-4 border-success/40">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-black text-neutral-800 flex items-center gap-2">
            <MessageSquare className="text-success" size={24} />
            RECENT ACTIVITY
          </h2>
        </div>

        {data.recentActivity.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="w-16 h-16 text-neutral-400 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-bold text-neutral-600">No recent activity</p>
            <p className="text-sm text-neutral-500 mt-2">
              Activity will appear here as students engage with your courses.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {data.recentActivity.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start gap-4 p-4 bg-neutral-50 rounded-lg border-2 border-neutral-200 hover:bg-neutral-100 transition-all"
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    activity.type === 'enrollment'
                      ? 'bg-primary/10 text-primary'
                      : activity.status === 'COMPLETED'
                      ? 'bg-success/10 text-success'
                      : 'bg-warning/10 text-warning'
                  }`}
                >
                  {activity.type === 'enrollment' && <Users size={20} />}
                  {activity.status === 'COMPLETED' && <Award size={20} />}
                  {activity.status === 'IN_PROGRESS' && <BookOpen size={20} />}
                </div>

                <div className="flex-1">
                  <p className="font-bold text-neutral-800">
                    <span className="text-warning">{activity.student.name}</span>{' '}
                    {activity.status === 'ENROLLED' && 'enrolled in'}{' '}
                    {activity.status === 'COMPLETED' && 'completed'}{' '}
                    {activity.status === 'IN_PROGRESS' && 'is learning'}{' '}
                    <span className="font-black">{activity.course.title}</span>
                  </p>
                  <p className="text-sm text-neutral-600 font-medium mt-1">
                    {new Date(activity.enrolledAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        <Link href="/instructor/students">
          <MagneticButton className="w-full mt-4 glass-effect border-2 border-success/30 text-neutral-700 font-black hover:border-success/60">
            VIEW ALL STUDENTS
          </MagneticButton>
        </Link>
      </Card>
    </div>
  )
}
