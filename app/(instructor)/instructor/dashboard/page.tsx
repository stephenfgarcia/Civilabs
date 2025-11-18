/**
 * Instructor Dashboard Page
 * Main dashboard for instructors to manage their courses and students
 */

'use client'

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
  ArrowRight
} from 'lucide-react'
import Link from 'next/link'

export default function InstructorDashboardPage() {
  // Mock data
  const stats = [
    { label: 'Active Courses', value: '8', change: '+2', trend: 'up', icon: BookOpen, color: 'warning' },
    { label: 'Total Students', value: '234', change: '+12', trend: 'up', icon: Users, color: 'primary' },
    { label: 'Avg. Rating', value: '4.8', change: '+0.2', trend: 'up', icon: Star, color: 'success' },
    { label: 'Completion Rate', value: '87%', change: '+5%', trend: 'up', icon: TrendingUp, color: 'secondary' },
  ]

  const recentActivity = [
    { type: 'enrollment', student: 'Sarah Johnson', course: 'Construction Safety 101', time: '2 hours ago' },
    { type: 'question', student: 'Mike Brown', course: 'Equipment Operation', time: '4 hours ago' },
    { type: 'completion', student: 'Emma Davis', course: 'Quality Control', time: '5 hours ago' },
    { type: 'review', student: 'James Wilson', course: 'Construction Safety 101', rating: 5, time: '1 day ago' },
  ]

  const pendingTasks = [
    { type: 'grade', title: 'Grade 12 quiz submissions for Equipment Operation', priority: 'high', course: 'Equipment Operation' },
    { type: 'respond', title: 'Respond to 5 discussion questions', priority: 'medium', course: 'Multiple Courses' },
    { type: 'review', title: 'Review 3 assignment submissions', priority: 'high', course: 'Construction Safety 101' },
    { type: 'update', title: 'Update course materials for next module', priority: 'low', course: 'Quality Control' },
  ]

  const topCourses = [
    { name: 'Construction Safety 101', students: 45, rating: 4.9, revenue: '$2,250', completion: 92 },
    { name: 'Equipment Operation', students: 38, rating: 4.7, revenue: '$1,900', completion: 85 },
    { name: 'Quality Control Basics', students: 32, rating: 4.8, revenue: '$1,600', completion: 88 },
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
            Welcome back, John! Here's what's happening with your courses.
          </p>
        </div>

        <MagneticButton className="bg-gradient-to-r from-warning to-orange-600 text-white font-black">
          <Plus className="mr-2" size={20} />
          CREATE COURSE
        </MagneticButton>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.label} className="p-6 border-4 border-neutral-200 hover:border-warning/40 transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 bg-gradient-to-br from-${stat.color} to-${stat.color === 'warning' ? 'orange' : stat.color === 'primary' ? 'blue' : stat.color === 'success' ? 'green' : 'purple'}-600 rounded-lg flex items-center justify-center shadow-lg`}>
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
                {pendingTasks.length} Tasks
              </span>
            </div>

            <div className="space-y-4">
              {pendingTasks.map((task, index) => (
                <div
                  key={index}
                  className="flex items-start gap-4 p-4 bg-neutral-50 rounded-lg border-2 border-neutral-200 hover:border-warning/40 transition-all"
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    task.priority === 'high' ? 'bg-danger/10 text-danger' :
                    task.priority === 'medium' ? 'bg-warning/10 text-warning' :
                    'bg-primary/10 text-primary'
                  }`}>
                    <AlertCircle size={20} />
                  </div>

                  <div className="flex-1">
                    <p className="font-bold text-neutral-800 mb-1">{task.title}</p>
                    <div className="flex items-center gap-4 text-sm text-neutral-600">
                      <span className="font-medium">{task.course}</span>
                      <span className={`font-black px-2 py-0.5 rounded text-xs ${
                        task.priority === 'high' ? 'bg-danger/10 text-danger' :
                        task.priority === 'medium' ? 'bg-warning/10 text-warning' :
                        'bg-primary/10 text-primary'
                      }`}>
                        {task.priority.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <button className="text-warning hover:text-orange-600 font-bold">
                    <ArrowRight size={20} />
                  </button>
                </div>
              ))}
            </div>

            <Link href="/instructor/tasks">
              <MagneticButton className="w-full mt-4 glass-effect border-2 border-warning/30 text-neutral-700 font-black hover:border-warning/60">
                VIEW ALL TASKS
              </MagneticButton>
            </Link>
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

            <div className="space-y-4">
              {topCourses.map((course, index) => (
                <div
                  key={index}
                  className="p-4 bg-neutral-50 rounded-lg border-2 border-neutral-200 hover:border-primary/40 transition-all"
                >
                  <div className="flex items-start justify-between mb-2">
                    <p className="font-black text-neutral-800 text-sm">{course.name}</p>
                    <div className="flex items-center gap-1 text-amber-500">
                      <Star size={14} fill="currentColor" />
                      <span className="text-xs font-black">{course.rating}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-neutral-600 mb-3">
                    <span className="font-medium flex items-center gap-1">
                      <Users size={12} />
                      {course.students}
                    </span>
                    <span className="font-bold text-success">{course.revenue}</span>
                  </div>

                  <div className="w-full bg-neutral-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-primary to-blue-600 h-2 rounded-full"
                      style={{ width: `${course.completion}%` }}
                    ></div>
                  </div>
                  <p className="text-xs font-medium text-neutral-600 mt-1">
                    {course.completion}% completion rate
                  </p>
                </div>
              ))}
            </div>

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

        <div className="space-y-3">
          {recentActivity.map((activity, index) => (
            <div
              key={index}
              className="flex items-start gap-4 p-4 bg-neutral-50 rounded-lg border-2 border-neutral-200 hover:bg-neutral-100 transition-all"
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                activity.type === 'enrollment' ? 'bg-primary/10 text-primary' :
                activity.type === 'question' ? 'bg-warning/10 text-warning' :
                activity.type === 'completion' ? 'bg-success/10 text-success' :
                'bg-secondary/10 text-secondary'
              }`}>
                {activity.type === 'enrollment' && <Users size={20} />}
                {activity.type === 'question' && <MessageSquare size={20} />}
                {activity.type === 'completion' && <Award size={20} />}
                {activity.type === 'review' && <Star size={20} />}
              </div>

              <div className="flex-1">
                <p className="font-bold text-neutral-800">
                  <span className="text-warning">{activity.student}</span>{' '}
                  {activity.type === 'enrollment' && 'enrolled in'}
                  {activity.type === 'question' && 'asked a question in'}
                  {activity.type === 'completion' && 'completed'}
                  {activity.type === 'review' && 'left a review for'}
                  {' '}<span className="font-black">{activity.course}</span>
                </p>
                <p className="text-sm text-neutral-600 font-medium mt-1">{activity.time}</p>
              </div>

              {activity.type === 'review' && (
                <div className="flex items-center gap-1 text-amber-500">
                  {[...Array(activity.rating)].map((_, i) => (
                    <Star key={i} size={14} fill="currentColor" />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <Link href="/instructor/activity">
          <MagneticButton className="w-full mt-4 glass-effect border-2 border-success/30 text-neutral-700 font-black hover:border-success/60">
            VIEW ALL ACTIVITY
          </MagneticButton>
        </Link>
      </Card>
    </div>
  )
}
