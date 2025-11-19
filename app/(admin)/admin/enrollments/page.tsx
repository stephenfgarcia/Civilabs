'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MagneticButton } from '@/components/ui/magnetic-button'
import { Input } from '@/components/ui/input'
import {
  GraduationCap,
  Search,
  Filter,
  UserPlus,
  Users,
  BookOpen,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  Download,
  Eye,
  Trash2,
  Calendar,
  Award,
  Loader2,
} from 'lucide-react'
import Link from 'next/link'
import adminEnrollmentsService, { AdminEnrollment } from '@/lib/services/admin-enrollments.service'

const MOCK_ENROLLMENTS_OLD: any[] = [
  {
    id: 1,
    userId: 1,
    userName: 'John Doe',
    userEmail: 'john.doe@civilabs.com',
    courseId: 1,
    courseTitle: 'Construction Safety Fundamentals',
    status: 'completed',
    progress: 100,
    enrolledDate: '2024-01-15',
    completedDate: '2024-02-20',
    lastActivity: '2 weeks ago',
    certificateIssued: true,
    grade: 95,
  },
  {
    id: 2,
    userId: 1,
    userName: 'John Doe',
    userEmail: 'john.doe@civilabs.com',
    courseId: 2,
    courseTitle: 'Heavy Equipment Operation',
    status: 'active',
    progress: 68,
    enrolledDate: '2024-02-01',
    lastActivity: '2 hours ago',
    certificateIssued: false,
  },
  {
    id: 3,
    userId: 3,
    userName: 'Mike Chen',
    userEmail: 'mike.chen@civilabs.com',
    courseId: 1,
    courseTitle: 'Construction Safety Fundamentals',
    status: 'active',
    progress: 45,
    enrolledDate: '2024-02-15',
    lastActivity: '1 day ago',
    certificateIssued: false,
  },
  {
    id: 4,
    userId: 3,
    userName: 'Mike Chen',
    userEmail: 'mike.chen@civilabs.com',
    courseId: 2,
    courseTitle: 'Heavy Equipment Operation',
    status: 'completed',
    progress: 100,
    enrolledDate: '2024-01-20',
    completedDate: '2024-03-01',
    lastActivity: '1 week ago',
    certificateIssued: true,
    grade: 88,
  },
  {
    id: 5,
    userId: 5,
    userName: 'Tom Wilson',
    userEmail: 'tom.w@civilabs.com',
    courseId: 1,
    courseTitle: 'Construction Safety Fundamentals',
    status: 'dropped',
    progress: 15,
    enrolledDate: '2024-01-10',
    lastActivity: '3 weeks ago',
    certificateIssued: false,
  },
]

const STATUSES = ['All', 'ENROLLED', 'IN_PROGRESS', 'COMPLETED', 'DROPPED', 'SUSPENDED']

export default function EnrollmentsPage() {
  const [enrollments, setEnrollments] = useState<AdminEnrollment[]>([])
  const [filteredEnrollments, setFilteredEnrollments] = useState<AdminEnrollment[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('All')
  const [selectedCourse, setSelectedCourse] = useState('All')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [courses, setCourses] = useState<string[]>(['All'])

  // Fetch enrollments
  useEffect(() => {
    async function fetchEnrollments() {
      try {
        setLoading(true)
        setError(null)
        const response = await adminEnrollmentsService.getEnrollments()

        if (response.success) {
          setEnrollments(response.data)
          setFilteredEnrollments(response.data)

          // Extract unique courses
          const uniqueCourses = Array.from(
            new Set(response.data.map(e => e.course.title))
          )
          setCourses(['All', ...uniqueCourses])
        } else {
          setError('Failed to load enrollments')
        }
      } catch (err) {
        setError('An error occurred while loading enrollments')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchEnrollments()
  }, [])

  // Apply filters
  useEffect(() => {
    let filtered = enrollments

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(enrollment =>
        `${enrollment.user.firstName} ${enrollment.user.lastName}`.toLowerCase().includes(query) ||
        enrollment.user.email.toLowerCase().includes(query) ||
        enrollment.course.title.toLowerCase().includes(query)
      )
    }

    // Status filter
    if (selectedStatus !== 'All') {
      filtered = filtered.filter(e => e.status === selectedStatus)
    }

    // Course filter
    if (selectedCourse !== 'All') {
      filtered = filtered.filter(e => e.course.title === selectedCourse)
    }

    setFilteredEnrollments(filtered)
  }, [enrollments, searchQuery, selectedStatus, selectedCourse])

  // Animations
  useEffect(() => {
    const elements = document.querySelectorAll('.enrollments-item')
    elements.forEach((el, index) => {
      const htmlEl = el as HTMLElement
      htmlEl.style.animation = `fadeInUp 0.5s ease-out forwards ${index * 0.05}s`
    })
  }, [loading])

  // Handle delete
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to unenroll this user?')) return

    try {
      const response = await adminEnrollmentsService.deleteEnrollment(id)
      if (response.success) {
        setEnrollments(prev => prev.filter(e => e.id !== id))
      } else {
        alert(response.error || 'Failed to delete enrollment')
      }
    } catch (error) {
      alert('An error occurred while deleting the enrollment')
      console.error(error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'COMPLETED':
        return 'from-success to-green-600'
      case 'ENROLLED':
      case 'IN_PROGRESS':
        return 'from-primary to-blue-600'
      case 'DROPPED':
        return 'from-danger to-red-600'
      case 'SUSPENDED':
        return 'from-warning to-orange-600'
      default:
        return 'from-neutral-400 to-neutral-600'
    }
  }

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-success'
    if (progress >= 50) return 'bg-warning'
    return 'bg-danger'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="enrollments-item opacity-0">
        <div className="glass-effect concrete-texture rounded-xl p-8 relative overflow-hidden border-4 border-cyan-500/40">
          <div className="absolute top-2 left-2 w-12 h-12 border-t-4 border-l-4 border-cyan-600/60"></div>
          <div className="absolute top-2 right-2 w-12 h-12 border-t-4 border-r-4 border-cyan-600/60"></div>
          <div className="absolute bottom-2 left-2 w-12 h-12 border-b-4 border-l-4 border-cyan-600/60"></div>
          <div className="absolute bottom-2 right-2 w-12 h-12 border-b-4 border-r-4 border-cyan-600/60"></div>

          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-blue-500 to-blue-600 opacity-10"></div>
          <div className="absolute inset-0 blueprint-grid opacity-20"></div>

          <div className="relative z-10">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-cyan-500 via-blue-500 to-blue-600 bg-clip-text text-transparent mb-2">
                  ENROLLMENT MANAGEMENT
                </h1>
                <p className="text-lg font-bold text-neutral-700">
                  Track and manage course enrollments
                </p>
              </div>

              <MagneticButton className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-black">
                <UserPlus className="mr-2" size={20} />
                ENROLL USER
              </MagneticButton>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="enrollments-item opacity-0 glass-effect concrete-texture border-4 border-primary/40">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-black bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent mb-2">
              {loading ? '...' : enrollments.length}
            </div>
            <p className="text-sm font-bold text-neutral-600">TOTAL ENROLLMENTS</p>
          </CardContent>
        </Card>

        <Card className="enrollments-item opacity-0 glass-effect concrete-texture border-4 border-cyan-500/40">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-black bg-gradient-to-r from-cyan-500 to-blue-600 bg-clip-text text-transparent mb-2">
              {loading ? '...' : enrollments.filter(e => e.status === 'ENROLLED' || e.status === 'IN_PROGRESS').length}
            </div>
            <p className="text-sm font-bold text-neutral-600">ACTIVE</p>
          </CardContent>
        </Card>

        <Card className="enrollments-item opacity-0 glass-effect concrete-texture border-4 border-success/40">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-black bg-gradient-to-r from-success to-green-600 bg-clip-text text-transparent mb-2">
              {loading ? '...' : enrollments.filter(e => e.status === 'COMPLETED').length}
            </div>
            <p className="text-sm font-bold text-neutral-600">COMPLETED</p>
          </CardContent>
        </Card>

        <Card className="enrollments-item opacity-0 glass-effect concrete-texture border-4 border-danger/40">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-black bg-gradient-to-r from-danger to-red-600 bg-clip-text text-transparent mb-2">
              {loading ? '...' : enrollments.filter(e => e.status === 'DROPPED').length}
            </div>
            <p className="text-sm font-bold text-neutral-600">DROPPED</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="enrollments-item opacity-0 glass-effect concrete-texture border-4 border-primary/40">
        <CardHeader>
          <CardTitle className="text-xl font-black flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-blue-600 rounded-lg flex items-center justify-center">
              <Filter className="text-white" size={20} />
            </div>
            SEARCH & FILTER
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-400" size={20} />
            <Input
              type="text"
              placeholder="Search by user, email, or course..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12 glass-effect border-2 border-primary/30 focus:border-primary font-medium"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-bold text-neutral-700 mb-2">STATUS</p>
              <div className="flex gap-2 flex-wrap">
                {STATUSES.map((status) => (
                  <button
                    key={status}
                    onClick={() => setSelectedStatus(status)}
                    className={`px-4 py-2 rounded-lg font-bold transition-all ${
                      selectedStatus === status
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg scale-105'
                        : 'glass-effect border-2 border-cyan-500/30 text-neutral-700 hover:border-cyan-500/60'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-bold text-neutral-700 mb-2">COURSE</p>
              <div className="flex gap-2 flex-wrap">
                {courses.map((course) => (
                  <button
                    key={course}
                    onClick={() => setSelectedCourse(course)}
                    className={`px-4 py-2 rounded-lg font-bold transition-all text-xs ${
                      selectedCourse === course
                        ? 'bg-gradient-to-r from-primary to-blue-600 text-white shadow-lg scale-105'
                        : 'glass-effect border-2 border-primary/30 text-neutral-700 hover:border-primary/60'
                    }`}
                  >
                    {course === 'All' ? course : (course.length > 25 ? course.substring(0, 25) + '...' : course)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enrollments List */}
      <Card className="enrollments-item opacity-0 glass-effect concrete-texture border-4 border-cyan-500/40">
        <CardHeader>
          <CardTitle className="text-xl font-black">
            ENROLLMENTS ({filteredEnrollments.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="animate-spin text-primary" size={48} />
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-danger font-bold">{error}</p>
            </div>
          ) : filteredEnrollments.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-neutral-600 font-bold">No enrollments found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredEnrollments.map((enrollment) => {
                const userName = `${enrollment.user.firstName} ${enrollment.user.lastName}`
                const hasCertificate = enrollment._count.userCertificates > 0
                const progress = enrollment.calculatedProgress || enrollment.progressPercentage

                return (
              <div
                key={enrollment.id}
                className="glass-effect rounded-lg p-6 hover:bg-white/50 transition-all border-2 border-transparent hover:border-cyan-500/30"
              >
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-3 py-1 rounded-full bg-gradient-to-r ${getStatusColor(enrollment.status)} text-white font-black text-xs uppercase`}>
                          {enrollment.status.replace('_', ' ')}
                        </span>
                        {hasCertificate && (
                          <span className="px-3 py-1 rounded-full bg-gradient-to-r from-warning to-orange-600 text-white font-black text-xs flex items-center gap-1">
                            <Award size={12} />
                            CERTIFIED
                          </span>
                        )}
                      </div>
                      <h3 className="text-xl font-black text-neutral-800 mb-1">
                        {enrollment.course.title}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-neutral-600">
                        <Users size={14} />
                        <span className="font-bold">{userName}</span>
                        <span>•</span>
                        <span>{enrollment.user.email}</span>
                      </div>
                    </div>

                    <div className="text-center">
                      <div className="text-3xl font-black bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                        {progress}%
                      </div>
                      <p className="text-xs text-neutral-600 font-bold">PROGRESS</p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-bold text-neutral-700">Progress</span>
                      <span className="text-sm font-black text-neutral-800">
                        {enrollment.completedLessonsCount || 0} / {enrollment.totalLessons || 0} lessons
                      </span>
                    </div>
                    <div className="w-full h-3 bg-neutral-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${getProgressColor(progress)} transition-all duration-500`}
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 py-3 border-y-2 border-neutral-200">
                    <div>
                      <div className="flex items-center gap-1 text-xs text-neutral-600 mb-1">
                        <Calendar size={12} />
                        <span>ENROLLED</span>
                      </div>
                      <p className="font-bold text-neutral-800 text-sm">
                        {new Date(enrollment.enrolledAt).toLocaleDateString()}
                      </p>
                    </div>

                    {enrollment.completedAt && (
                      <div>
                        <div className="flex items-center gap-1 text-xs text-neutral-600 mb-1">
                          <CheckCircle size={12} />
                          <span>COMPLETED</span>
                        </div>
                        <p className="font-bold text-neutral-800 text-sm">
                          {new Date(enrollment.completedAt).toLocaleDateString()}
                        </p>
                      </div>
                    )}

                    <div>
                      <div className="flex items-center gap-1 text-xs text-neutral-600 mb-1">
                        <Clock size={12} />
                        <span>UPDATED</span>
                      </div>
                      <p className="font-bold text-neutral-800 text-sm">
                        {new Date(enrollment.updatedAt || enrollment.enrolledAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <MagneticButton className="flex-1 glass-effect border-2 border-primary/30 text-neutral-700 font-black hover:border-primary/60">
                      <Eye className="mr-2" size={16} />
                      VIEW DETAILS
                    </MagneticButton>
                    {hasCertificate && (
                      <MagneticButton className="flex-1 glass-effect border-2 border-warning/30 text-neutral-700 font-black hover:border-warning/60">
                        <Download className="mr-2" size={16} />
                        CERTIFICATE
                      </MagneticButton>
                    )}
                    <button
                      onClick={() => handleDelete(enrollment.id)}
                      className="w-12 h-12 glass-effect border-2 border-danger/30 rounded-lg flex items-center justify-center hover:border-danger/60 hover:bg-danger/10 transition-all"
                    >
                      <Trash2 size={16} className="text-danger" />
                    </button>
                  </div>
                </div>
              </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
