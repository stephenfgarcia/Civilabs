/**
 * Instructor Students Page
 * View and manage enrolled students across all courses
 */

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { PaginatedTable } from '@/components/ui/paginated-table'
import type { Column } from '@/components/ui/data-table'
import { MagneticButton } from '@/components/ui/magnetic-button'
import { MessageModal } from '@/components/messaging/MessageModal'
import { EmailComposerModal } from '@/components/messaging/EmailComposerModal'
import {
  Users,
  TrendingUp,
  Award,
  Clock,
  Mail,
  MessageSquare,
  Eye,
  Loader2,
  AlertCircle,
} from 'lucide-react'
import { instructorService, type Student as StudentType } from '@/lib/services'

interface DisplayStudent {
  id: string
  name: string
  email: string
  enrolledCourses: number
  completedCourses: number
  averageProgress: number
  department: string
  courses: string
}

export default function InstructorStudentsPage() {
  const [students, setStudents] = useState<DisplayStudent[]>([])
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeStudents: 0,
    totalEnrollments: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [messageModalOpen, setMessageModalOpen] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<{ id: string; name: string } | null>(null)
  const [emailComposerOpen, setEmailComposerOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    fetchStudents()
  }, [])

  function handleViewProfile(studentId: string) {
    router.push(`/instructor/students/${studentId}`)
  }

  async function fetchStudents() {
    try {
      setLoading(true)
      setError(null)
      const data = await instructorService.getStudents()

      // Transform the data for display
      const displayStudents: DisplayStudent[] = data.students.map((student) => ({
        id: student.id,
        name: `${student.firstName} ${student.lastName}`,
        email: student.email,
        enrolledCourses: student.totalEnrollments,
        completedCourses: student.completedCourses,
        averageProgress: student.averageProgress,
        department: student.department?.name || 'N/A',
        courses: student.courses.map(c => c.courseTitle).join(', '),
      }))

      setStudents(displayStudents)
      setStats(data.stats)
    } catch (err) {
      console.error('Error fetching students:', err)
      setError(err instanceof Error ? err.message : 'Failed to load students')
    } finally {
      setLoading(false)
    }
  }

  const columns: Column<DisplayStudent>[] = [
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
      key: 'department',
      label: 'Department',
      sortable: true,
      render: (value) => <span className="text-sm font-medium text-neutral-700">{value}</span>,
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
                value >= 80
                  ? 'bg-gradient-to-r from-success to-green-600'
                  : value >= 50
                  ? 'bg-gradient-to-r from-warning to-orange-600'
                  : 'bg-gradient-to-r from-danger to-red-600'
              }`}
              style={{ width: `${value}%` }}
            ></div>
          </div>
        </div>
      ),
    },
    {
      key: 'id',
      label: 'Actions',
      sortable: false,
      render: (value, row) => (
        <div className="flex items-center gap-2">
          <button
            className="p-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-all"
            title="View Profile"
            onClick={() => handleViewProfile(value)}
          >
            <Eye size={16} />
          </button>
          <button
            className="p-2 bg-warning/10 text-warning rounded-lg hover:bg-warning/20 transition-all"
            title="Send Message"
            onClick={() => {
              setSelectedStudent({ id: value, name: row.name })
              setMessageModalOpen(true)
            }}
          >
            <MessageSquare size={16} />
          </button>
          <button
            className="p-2 bg-success/10 text-success rounded-lg hover:bg-success/20 transition-all"
            title="Send Email"
            onClick={() => {
              window.location.href = `mailto:${row.email}`
            }}
          >
            <Mail size={16} />
          </button>
        </div>
      ),
    },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-warning mx-auto mb-4" />
          <p className="text-lg font-bold text-neutral-600">Loading students...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="p-8 border-4 border-danger/40 max-w-md">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-danger mx-auto mb-4" />
            <h2 className="text-xl font-black text-neutral-800 mb-2">Failed to Load</h2>
            <p className="text-neutral-600 mb-4">{error}</p>
            <MagneticButton
              onClick={fetchStudents}
              className="bg-gradient-to-r from-warning to-orange-600 text-white font-black"
            >
              TRY AGAIN
            </MagneticButton>
          </div>
        </Card>
      </div>
    )
  }

  const avgProgress = students.length > 0
    ? Math.round(students.reduce((sum, s) => sum + s.averageProgress, 0) / students.length)
    : 0

  const completionRate = stats.totalEnrollments > 0
    ? Math.round(
        (students.reduce((sum, s) => sum + s.completedCourses, 0) / stats.totalEnrollments) * 100
      )
    : 0

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
          <p className="text-3xl font-black text-neutral-800">{avgProgress}%</p>
        </Card>

        <Card className="p-6 border-4 border-secondary/40">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-secondary to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
              <Award className="text-white" size={24} />
            </div>
          </div>
          <p className="text-sm font-bold text-neutral-600 mb-1">Completion Rate</p>
          <p className="text-3xl font-black text-neutral-800">{completionRate}%</p>
        </Card>
      </div>

      {/* Students Table */}
      <Card className="p-6 border-4 border-neutral-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-black text-neutral-800">ALL STUDENTS</h2>
          <MagneticButton
            className="glass-effect border-2 border-primary/30 text-neutral-700 font-black hover:border-primary/60"
            onClick={() => setEmailComposerOpen(true)}
          >
            <Mail className="mr-2" size={20} />
            EMAIL ALL
          </MagneticButton>
        </div>

        {students.length === 0 ? (
          <div className="text-center py-12">
            <Users className="mx-auto text-neutral-400 mb-4" size={48} />
            <p className="text-lg font-bold text-neutral-600">No students yet</p>
            <p className="text-neutral-500 font-medium mt-2">
              Students will appear here when they enroll in your courses
            </p>
          </div>
        ) : (
          <PaginatedTable
            data={students}
            columns={columns}
            pageSize={10}
            searchable={true}
            searchPlaceholder="Search students by name or email..."
          />
        )}
      </Card>

      {/* Message Modal */}
      {selectedStudent && (
        <MessageModal
          isOpen={messageModalOpen}
          onClose={() => {
            setMessageModalOpen(false)
            setSelectedStudent(null)
          }}
          recipientId={selectedStudent.id}
          recipientName={selectedStudent.name}
        />
      )}

      {/* Email Composer Modal */}
      <EmailComposerModal
        isOpen={emailComposerOpen}
        onClose={() => setEmailComposerOpen(false)}
        onSuccess={() => {
          // Optionally refresh data or show success message
          console.log('Bulk email sent successfully')
        }}
      />
    </div>
  )
}
