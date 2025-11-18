/**
 * Instructor Analytics Page
 * Performance analytics and insights for instructor's courses
 */

'use client'

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
  Calendar
} from 'lucide-react'

export default function InstructorAnalyticsPage() {
  // Mock data
  const overviewStats = [
    { label: 'Total Revenue', value: '$8,150', change: '+12%', trend: 'up', icon: DollarSign, color: 'success' },
    { label: 'Total Students', value: '234', change: '+8%', trend: 'up', icon: Users, color: 'primary' },
    { label: 'Avg Rating', value: '4.8', change: '+0.1', trend: 'up', icon: Star, color: 'warning' },
    { label: 'Course Views', value: '1,245', change: '+15%', trend: 'up', icon: TrendingUp, color: 'secondary' },
  ]

  const coursePerformance = [
    { course: 'Construction Safety 101', students: 45, completion: 92, rating: 4.9, revenue: '$2,250' },
    { course: 'Equipment Operation', students: 38, completion: 85, rating: 4.7, revenue: '$1,900' },
    { course: 'Quality Control', students: 32, completion: 88, rating: 4.8, revenue: '$1,600' },
    { course: 'Site Management', students: 28, completion: 79, rating: 4.6, revenue: '$1,400' },
  ]

  const monthlyRevenue = [
    { month: 'Jan', revenue: 5200 },
    { month: 'Feb', revenue: 6100 },
    { month: 'Mar', revenue: 7300 },
    { month: 'Apr', revenue: 8150 },
  ]

  const studentEngagement = [
    { metric: 'Video Completion', value: 85, color: 'primary' },
    { metric: 'Quiz Participation', value: 92, color: 'success' },
    { metric: 'Discussion Posts', value: 68, color: 'warning' },
    { metric: 'Assignment Submission', value: 78, color: 'secondary' },
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
          <MagneticButton className="glass-effect border-2 border-neutral-300 text-neutral-700 font-black hover:border-neutral-400">
            <Calendar className="mr-2" size={20} />
            LAST 30 DAYS
          </MagneticButton>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Revenue Trend */}
        <Card className="p-6 border-4 border-success/40">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-black text-neutral-800 flex items-center gap-2">
              <BarChart3 className="text-success" size={24} />
              REVENUE TREND
            </h2>
          </div>

          <div className="space-y-4">
            {monthlyRevenue.map((item, index) => {
              const maxRevenue = Math.max(...monthlyRevenue.map(m => m.revenue))
              const width = (item.revenue / maxRevenue) * 100

              return (
                <div key={index}>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="font-black text-neutral-800">{item.month}</span>
                    <span className="font-black text-success">${item.revenue.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-neutral-200 rounded-full h-4">
                    <div
                      className="bg-gradient-to-r from-success to-green-600 h-4 rounded-full transition-all duration-500"
                      style={{ width: `${width}%` }}
                    ></div>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="mt-6 p-4 bg-success/10 rounded-lg">
            <p className="text-sm font-bold text-neutral-700">
              Total Revenue This Quarter: <span className="text-success font-black">${monthlyRevenue.reduce((sum, m) => sum + m.revenue, 0).toLocaleString()}</span>
            </p>
            <p className="text-xs text-neutral-600 font-medium mt-1">
              +24% compared to last quarter
            </p>
          </div>
        </Card>

        {/* Student Engagement */}
        <Card className="p-6 border-4 border-primary/40">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-black text-neutral-800 flex items-center gap-2">
              <PieChart className="text-primary" size={24} />
              STUDENT ENGAGEMENT
            </h2>
          </div>

          <div className="space-y-6">
            {studentEngagement.map((item, index) => (
              <div key={index}>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="font-bold text-neutral-700">{item.metric}</span>
                  <span className="font-black text-neutral-800">{item.value}%</span>
                </div>
                <div className="w-full bg-neutral-200 rounded-full h-3">
                  <div
                    className={`bg-gradient-to-r from-${item.color} to-${
                      item.color === 'primary' ? 'blue' :
                      item.color === 'success' ? 'green' :
                      item.color === 'warning' ? 'orange' :
                      'purple'
                    }-600 h-3 rounded-full transition-all duration-500`}
                    style={{ width: `${item.value}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-primary/10 rounded-lg">
            <p className="text-sm font-bold text-neutral-700">
              Overall Engagement Score: <span className="text-primary font-black">81%</span>
            </p>
            <p className="text-xs text-neutral-600 font-medium mt-1">
              Above average for your course category
            </p>
          </div>
        </Card>
      </div>

      {/* Course Performance Table */}
      <Card className="p-6 border-4 border-warning/40">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-black text-neutral-800">COURSE PERFORMANCE</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-neutral-50 to-neutral-100 border-b-2 border-neutral-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-black text-neutral-700 uppercase">Course</th>
                <th className="px-6 py-4 text-left text-sm font-black text-neutral-700 uppercase">Students</th>
                <th className="px-6 py-4 text-left text-sm font-black text-neutral-700 uppercase">Completion</th>
                <th className="px-6 py-4 text-left text-sm font-black text-neutral-700 uppercase">Rating</th>
                <th className="px-6 py-4 text-left text-sm font-black text-neutral-700 uppercase">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {coursePerformance.map((course, index) => (
                <tr
                  key={index}
                  className="border-b border-neutral-200 hover:bg-neutral-50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <p className="font-black text-neutral-800">{course.course}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-black text-primary">{course.students}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-24 bg-neutral-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            course.completion >= 90 ? 'bg-gradient-to-r from-success to-green-600' :
                            course.completion >= 80 ? 'bg-gradient-to-r from-warning to-orange-600' :
                            'bg-gradient-to-r from-danger to-red-600'
                          }`}
                          style={{ width: `${course.completion}%` }}
                        ></div>
                      </div>
                      <span className="font-black text-neutral-800 text-sm">{course.completion}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1 text-amber-500">
                      <Star size={16} fill="currentColor" />
                      <span className="font-black text-neutral-800">{course.rating}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-black text-success">{course.revenue}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
