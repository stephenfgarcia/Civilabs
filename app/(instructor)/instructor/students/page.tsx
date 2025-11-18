/**
 * Instructor Students Page
 * View and manage enrolled students across all courses
 */

'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { PaginatedTable } from '@/components/ui/paginated-table'
import type { Column } from '@/components/ui/data-table'
import { MagneticButton } from '@/components/ui/magnetic-button'
import {
  Users,
  TrendingUp,
  Award,
  Clock,
  Mail,
  MessageSquare,
  Eye
} from 'lucide-react'

interface Student {
  id: number
  name: string
  email: string
  enrolledCourses: number
  completedCourses: number
  averageProgress: number
  totalPoints: number
  lastActive: string
  status: 'active' | 'inactive'
}

export default function InstructorStudentsPage() {
  // Mock data
  const students: Student[] = [
    {
      id: 1,
      name: 'Sarah Johnson',
      email: 'sarah.j@example.com',
      enrolledCourses: 3,
      completedCourses: 1,
      averageProgress: 75,
      totalPoints: 850,
      lastActive: '2 hours ago',
      status: 'active',
    },
    {
      id: 2,
      name: 'Mike Brown',
      email: 'mike.b@example.com',
      enrolledCourses: 2,
      completedCourses: 0,
      averageProgress: 45,
      totalPoints: 320,
      lastActive: '5 hours ago',
      status: 'active',
    },
    {
      id: 3,
      name: 'Emma Davis',
      email: 'emma.d@example.com',
      enrolledCourses: 4,
      completedCourses: 2,
      averageProgress: 88,
      totalPoints: 1250,
      lastActive: '1 day ago',
      status: 'active',
    },
    {
      id: 4,
      name: 'James Wilson',
      email: 'james.w@example.com',
      enrolledCourses: 2,
      completedCourses: 2,
      averageProgress: 100,
      totalPoints: 980,
      lastActive: '3 days ago',
      status: 'inactive',
    },
    {
      id: 5,
      name: 'Lisa Anderson',
      email: 'lisa.a@example.com',
      enrolledCourses: 3,
      completedCourses: 0,
      averageProgress: 30,
      totalPoints: 210,
      lastActive: '12 hours ago',
      status: 'active',
    },
  ]

  const stats = {
    totalStudents: students.length,
    activeStudents: students.filter(s => s.status === 'active').length,
    avgProgress: Math.round(students.reduce((sum, s) => sum + s.averageProgress, 0) / students.length),
    completionRate: Math.round((students.reduce((sum, s) => sum + s.completedCourses, 0) / students.reduce((sum, s) => sum + s.enrolledCourses, 0)) * 100),
  }

  const columns: Column<Student>[] = [
    {
      key: 'name',
      label: 'Student',
      sortable: true,
      render: (value, row) => (
        <div>
          <p className="font-black text-neutral-800">{value}</p>
          <p className="text-xs text-neutral-600 font-medium">{row.email}</p>
        </div>
      ),
    },
    {
      key: 'enrolledCourses',
      label: 'Enrolled',
      sortable: true,
      render: (value) => <span className="font-black text-primary">{value}</span>,
    },
    {
      key: 'completedCourses',
      label: 'Completed',
      sortable: true,
      render: (value) => <span className="font-black text-success">{value}</span>,
    },
    {
      key: 'averageProgress',
      label: 'Avg Progress',
      sortable: true,
      render: (value) => (
        <div className="w-32">
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="font-black text-neutral-800">{value}%</span>
          </div>
          <div className="w-full bg-neutral-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full ${
                value >= 80 ? 'bg-gradient-to-r from-success to-green-600' :
                value >= 50 ? 'bg-gradient-to-r from-warning to-orange-600' :
                'bg-gradient-to-r from-danger to-red-600'
              }`}
              style={{ width: `${value}%` }}
            ></div>
          </div>
        </div>
      ),
    },
    {
      key: 'totalPoints',
      label: 'Points',
      sortable: true,
      render: (value) => <span className="font-black text-secondary">{value.toLocaleString()}</span>,
    },
    {
      key: 'lastActive',
      label: 'Last Active',
      sortable: false,
      render: (value) => <span className="text-sm font-medium text-neutral-600">{value}</span>,
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (value) => (
        <span className={`text-xs font-black px-2 py-1 rounded ${
          value === 'active' ? 'bg-success/10 text-success' : 'bg-neutral-200 text-neutral-600'
        }`}>
          {value.toUpperCase()}
        </span>
      ),
    },
    {
      key: 'id',
      label: 'Actions',
      sortable: false,
      render: (value) => (
        <div className="flex items-center gap-2">
          <button
            className="p-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-all"
            title="View Profile"
          >
            <Eye size={16} />
          </button>
          <button
            className="p-2 bg-warning/10 text-warning rounded-lg hover:bg-warning/20 transition-all"
            title="Send Message"
          >
            <MessageSquare size={16} />
          </button>
          <button
            className="p-2 bg-success/10 text-success rounded-lg hover:bg-success/20 transition-all"
            title="Send Email"
          >
            <Mail size={16} />
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-black bg-gradient-to-r from-warning via-orange-500 to-amber-600 bg-clip-text text-transparent">
          MY STUDENTS
        </h1>
        <p className="text-neutral-600 font-medium mt-2">
          Track and engage with students across all your courses
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6 border-4 border-primary/40">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-blue-600 rounded-lg flex items-center justify-center shadow-lg">
              <Users className="text-white" size={24} />
            </div>
          </div>
          <p className="text-sm font-bold text-neutral-600 mb-1">Total Students</p>
          <p className="text-3xl font-black text-neutral-800">{stats.totalStudents}</p>
        </Card>

        <Card className="p-6 border-4 border-success/40">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-success to-green-600 rounded-lg flex items-center justify-center shadow-lg">
              <TrendingUp className="text-white" size={24} />
            </div>
          </div>
          <p className="text-sm font-bold text-neutral-600 mb-1">Active Students</p>
          <p className="text-3xl font-black text-neutral-800">{stats.activeStudents}</p>
        </Card>

        <Card className="p-6 border-4 border-warning/40">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-warning to-orange-600 rounded-lg flex items-center justify-center shadow-lg">
              <Clock className="text-white" size={24} />
            </div>
          </div>
          <p className="text-sm font-bold text-neutral-600 mb-1">Avg Progress</p>
          <p className="text-3xl font-black text-neutral-800">{stats.avgProgress}%</p>
        </Card>

        <Card className="p-6 border-4 border-secondary/40">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-secondary to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
              <Award className="text-white" size={24} />
            </div>
          </div>
          <p className="text-sm font-bold text-neutral-600 mb-1">Completion Rate</p>
          <p className="text-3xl font-black text-neutral-800">{stats.completionRate}%</p>
        </Card>
      </div>

      {/* Students Table */}
      <Card className="p-6 border-4 border-neutral-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-black text-neutral-800">ALL STUDENTS</h2>
          <MagneticButton className="glass-effect border-2 border-primary/30 text-neutral-700 font-black hover:border-primary/60">
            <Mail className="mr-2" size={20} />
            EMAIL ALL
          </MagneticButton>
        </div>

        <PaginatedTable
          data={students}
          columns={columns}
          pageSize={10}
          searchable={true}
          searchPlaceholder="Search students by name or email..."
        />
      </Card>
    </div>
  )
}
