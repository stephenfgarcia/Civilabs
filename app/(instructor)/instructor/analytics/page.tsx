/**
 * Instructor Analytics Page
 * Performance analytics and insights for instructor's courses
 */

'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { MagneticButton } from '@/components/ui/magnetic-button'
import {
  TrendingUp,
  Users,
  Star,
  DollarSign,
  BarChart3,
  PieChart,
  Download,
  Calendar,
  Loader2,
  AlertCircle
} from 'lucide-react'
import { instructorService, type InstructorAnalytics } from '@/lib/services'

export default function InstructorAnalyticsPage() {
  const [analytics, setAnalytics] = useState<InstructorAnalytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedPeriod, setSelectedPeriod] = useState('30')

  useEffect(() => {
    fetchAnalytics()
  }, [selectedPeriod])

  async function fetchAnalytics() {
    try {
      setLoading(true)
      setError(null)
      const data = await instructorService.getAnalytics({ period: selectedPeriod })
      setAnalytics(data)
    } catch (err) {
      console.error('Error fetching analytics:', err)
      setError(err instanceof Error ? err.message : 'Failed to load analytics')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-warning mx-auto mb-4" />
          <p className="text-lg font-bold text-neutral-600">Loading analytics...</p>
        </div>
      </div>
    )
  }

  if (error || !analytics) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="p-8 border-4 border-danger/40 max-w-md">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-danger mx-auto mb-4" />
            <h2 className="text-xl font-black text-neutral-800 mb-2">Failed to Load</h2>
            <p className="text-neutral-600 mb-4">{error || 'Unable to load analytics'}</p>
            <MagneticButton
              onClick={fetchAnalytics}
              className="bg-gradient-to-r from-warning to-orange-600 text-white font-black"
            >
              TRY AGAIN
            </MagneticButton>
          </div>
        </Card>
      </div>
    )
  }

  const overviewStats = [
    { label: 'Total Courses', value: analytics.summary.totalCourses.toString(), change: '-', trend: 'up', icon: BarChart3, color: 'warning' },
    { label: 'Total Students', value: analytics.summary.uniqueStudents.toString(), change: '-', trend: 'up', icon: Users, color: 'primary' },
    { label: 'Completion Rate', value: `${analytics.summary.overallCompletionRate}%`, change: '-', trend: 'up', icon: TrendingUp, color: 'success' },
    { label: 'Total Enrollments', value: analytics.summary.totalEnrollments.toString(), change: '-', trend: 'up', icon: Star, color: 'secondary' },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black bg-gradient-to-r from-warning via-orange-500 to-amber-600 bg-clip-text text-transparent">
            ANALYTICS & INSIGHTS
          </h1>
          <p className="text-neutral-600 font-medium mt-2">
            Track your teaching performance and student engagement
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-4 py-2 border-2 border-neutral-300 rounded-lg font-bold text-neutral-700 bg-white hover:border-warning/40 transition-all"
          >
            <option value="7">Last 7 Days</option>
            <option value="30">Last 30 Days</option>
            <option value="90">Last 90 Days</option>
            <option value="365">Last Year</option>
          </select>
          <MagneticButton className="bg-gradient-to-r from-warning to-orange-600 text-white font-black">
            <Download className="mr-2" size={20} />
            EXPORT REPORT
          </MagneticButton>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {overviewStats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.label} className="p-6 border-4 border-neutral-200 hover:border-warning/40 transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 bg-gradient-to-br from-${stat.color} to-${
                  stat.color === 'success' ? 'green' :
                  stat.color === 'primary' ? 'blue' :
                  stat.color === 'warning' ? 'orange' :
                  'purple'
                }-600 rounded-lg flex items-center justify-center shadow-lg`}>
                  <Icon className="text-white" size={24} />
                </div>
                <span className={`text-xs font-black ${
                  stat.trend === 'up' ? 'text-success bg-success/10' : 'text-danger bg-danger/10'
                } px-2 py-1 rounded`}>
                  {stat.change}
                </span>
              </div>
              <p className="text-sm font-bold text-neutral-600 mb-1">{stat.label}</p>
              <p className="text-3xl font-black text-neutral-800">{stat.value}</p>
            </Card>
          )
        })}
      </div>

      {/* Enrollment Trend */}
      <Card className="p-6 border-4 border-primary/40">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-black text-neutral-800 flex items-center gap-2">
            <TrendingUp className="text-primary" size={24} />
            ENROLLMENT TREND
          </h2>
        </div>

        {analytics.enrollmentTrend && analytics.enrollmentTrend.length > 0 ? (
          <>
            <div className="space-y-4">
              {analytics.enrollmentTrend.slice(0, 10).map((item, index) => {
                const maxEnrollments = Math.max(...analytics.enrollmentTrend.map(t => t.enrollments))
                const enrollmentWidth = maxEnrollments > 0 ? (item.enrollments / maxEnrollments) * 100 : 0
                const completionWidth = item.enrollments > 0 ? (item.completions / item.enrollments) * 100 : 0

                return (
                  <div key={index}>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="font-black text-neutral-800">
                        {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-primary">{item.enrollments} enrolled</span>
                        <span className="font-bold text-success">{item.completions} completed</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <div className="flex-1 bg-neutral-200 rounded-full h-3">
                        <div
                          className="bg-gradient-to-r from-primary to-blue-600 h-3 rounded-full transition-all duration-500"
                          style={{ width: `${enrollmentWidth}%` }}
                        ></div>
                      </div>
                      <div className="flex-1 bg-neutral-200 rounded-full h-3">
                        <div
                          className="bg-gradient-to-r from-success to-green-600 h-3 rounded-full transition-all duration-500"
                          style={{ width: `${completionWidth}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="mt-6 p-4 bg-primary/10 rounded-lg">
              <p className="text-sm font-bold text-neutral-700">
                Period: <span className="text-primary font-black">{analytics.period.days} days</span>
              </p>
              <p className="text-xs text-neutral-600 font-medium mt-1">
                {new Date(analytics.period.startDate).toLocaleDateString()} - {new Date(analytics.period.endDate).toLocaleDateString()}
              </p>
            </div>
          </>
        ) : (
          <div className="text-center py-8">
            <p className="text-neutral-600 font-medium">No enrollment data available for this period</p>
          </div>
        )}
      </Card>

      {/* Course Performance Table */}
      <Card className="p-6 border-4 border-warning/40">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-black text-neutral-800">COURSE PERFORMANCE</h2>
        </div>

        {analytics.courseMetrics && analytics.courseMetrics.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-neutral-50 to-neutral-100 border-b-2 border-neutral-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-black text-neutral-700 uppercase">Course</th>
                  <th className="px-6 py-4 text-left text-sm font-black text-neutral-700 uppercase">Category</th>
                  <th className="px-6 py-4 text-left text-sm font-black text-neutral-700 uppercase">Total</th>
                  <th className="px-6 py-4 text-left text-sm font-black text-neutral-700 uppercase">Active</th>
                  <th className="px-6 py-4 text-left text-sm font-black text-neutral-700 uppercase">Completed</th>
                  <th className="px-6 py-4 text-left text-sm font-black text-neutral-700 uppercase">Completion Rate</th>
                  <th className="px-6 py-4 text-left text-sm font-black text-neutral-700 uppercase">Avg Time (hrs)</th>
                </tr>
              </thead>
              <tbody>
                {analytics.courseMetrics.map((course, index) => (
                  <tr
                    key={course.courseId}
                    className="border-b border-neutral-200 hover:bg-neutral-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <p className="font-black text-neutral-800">{course.courseTitle}</p>
                      <p className="text-xs text-neutral-600 font-medium">{course.totalLessons} lessons</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-bold text-neutral-700">{course.category || 'Uncategorized'}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-black text-neutral-800">{course.totalEnrollments}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-black text-primary">{course.activeEnrollments}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-black text-success">{course.completedEnrollments}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-24 bg-neutral-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              course.completionRate >= 90 ? 'bg-gradient-to-r from-success to-green-600' :
                              course.completionRate >= 80 ? 'bg-gradient-to-r from-warning to-orange-600' :
                              course.completionRate >= 50 ? 'bg-gradient-to-r from-primary to-blue-600' :
                              'bg-gradient-to-r from-danger to-red-600'
                            }`}
                            style={{ width: `${course.completionRate}%` }}
                          ></div>
                        </div>
                        <span className="font-black text-neutral-800 text-sm">{course.completionRate}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-black text-neutral-800">{course.avgTimeSpentHours.toFixed(1)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-neutral-600 font-medium">No course performance data available for this period</p>
          </div>
        )}
      </Card>
    </div>
  )
}
