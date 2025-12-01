'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MagneticButton } from '@/components/ui/magnetic-button'
import { useToast } from '@/lib/hooks'
import {
  ArrowLeft,
  User,
  BookOpen,
  Calendar,
  TrendingUp,
  Award,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
} from 'lucide-react'
import Link from 'next/link'
import adminEnrollmentsService from '@/lib/services/admin-enrollments.service'

export default function EnrollmentDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [enrollment, setEnrollment] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (params.id) {
      fetchEnrollmentDetails()
    }
  }, [params.id])

  const fetchEnrollmentDetails = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await adminEnrollmentsService.getEnrollment(params.id as string)
      if (response.success && response.data) {
        setEnrollment(response.data)
      } else {
        throw new Error(response.error || 'Failed to fetch enrollment details')
      }
    } catch (err) {
      console.error('Error fetching enrollment:', err)
      setError(err instanceof Error ? err.message : 'Failed to load enrollment details')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'from-success to-green-600'
      case 'IN_PROGRESS':
        return 'from-primary to-blue-600'
      case 'NOT_STARTED':
        return 'from-neutral-400 to-neutral-600'
      case 'DROPPED':
        return 'from-danger to-red-600'
      default:
        return 'from-neutral-400 to-neutral-600'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return CheckCircle
      case 'IN_PROGRESS':
        return TrendingUp
      case 'NOT_STARTED':
        return Clock
      case 'DROPPED':
        return XCircle
      default:
        return Clock
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 mx-auto text-primary mb-4" />
          <p className="text-lg font-bold text-neutral-700">Loading enrollment details...</p>
        </div>
      </div>
    )
  }

  if (error || !enrollment) {
    return (
      <div className="space-y-6">
        <Link href="/admin/enrollments">
          <MagneticButton className="bg-gradient-to-r from-neutral-600 to-neutral-800 text-white font-black">
            <ArrowLeft className="mr-2" size={20} />
            BACK TO ENROLLMENTS
          </MagneticButton>
        </Link>
        <Card className="glass-effect concrete-texture border-4 border-danger/40">
          <CardContent className="p-12 text-center">
            <XCircle className="mx-auto h-16 w-16 text-danger mb-4" />
            <h3 className="text-2xl font-black text-neutral-700 mb-2">ERROR LOADING ENROLLMENT</h3>
            <p className="text-neutral-600 font-semibold mb-6">{error || 'Enrollment not found'}</p>
            <MagneticButton onClick={fetchEnrollmentDetails} className="bg-gradient-to-r from-primary to-blue-600 text-white font-black">
              TRY AGAIN
            </MagneticButton>
          </CardContent>
        </Card>
      </div>
    )
  }

  const StatusIcon = getStatusIcon(enrollment.status)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-effect concrete-texture rounded-xl p-8 relative overflow-hidden border-4 border-primary/40">
        <div className="absolute top-2 left-2 w-12 h-12 border-t-4 border-l-4 border-primary/60"></div>
        <div className="absolute top-2 right-2 w-12 h-12 border-t-4 border-r-4 border-primary/60"></div>
        <div className="absolute bottom-2 left-2 w-12 h-12 border-b-4 border-l-4 border-primary/60"></div>
        <div className="absolute bottom-2 right-2 w-12 h-12 border-b-4 border-r-4 border-primary/60"></div>

        <div className="absolute inset-0 bg-gradient-to-r from-primary via-blue-500 to-secondary opacity-10"></div>
        <div className="absolute inset-0 blueprint-grid opacity-20"></div>

        <div className="relative z-10">
          <Link href="/admin/enrollments">
            <MagneticButton className="mb-4 bg-gradient-to-r from-neutral-600 to-neutral-800 text-white font-black">
              <ArrowLeft className="mr-2" size={20} />
              BACK TO ENROLLMENTS
            </MagneticButton>
          </Link>

          <div className="flex items-center gap-3">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-blue-600 rounded-xl flex items-center justify-center">
              <BookOpen className="text-white" size={32} />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-primary via-blue-500 to-secondary bg-clip-text text-transparent">
                ENROLLMENT DETAILS
              </h1>
              <p className="text-sm font-bold text-neutral-600 mt-1">
                ENROLLMENT #{enrollment.id}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Student Information */}
      <Card className="glass-effect concrete-texture border-4 border-secondary/40">
        <CardHeader>
          <CardTitle className="text-2xl font-black flex items-center gap-2">
            <User className="text-secondary" size={24} />
            STUDENT INFORMATION
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-bold text-neutral-500 uppercase mb-1">Student Name</p>
              <p className="text-lg font-bold text-neutral-800">
                {enrollment.user?.firstName} {enrollment.user?.lastName}
              </p>
            </div>
            <div>
              <p className="text-xs font-bold text-neutral-500 uppercase mb-1">Email</p>
              <p className="text-lg font-bold text-neutral-800">{enrollment.user?.email}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-neutral-500 uppercase mb-1">Role</p>
              <p className="text-lg font-bold text-neutral-800">{enrollment.user?.role}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-neutral-500 uppercase mb-1">Department</p>
              <p className="text-lg font-bold text-neutral-800">
                {enrollment.user?.department?.name || 'N/A'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Course Information */}
      <Card className="glass-effect concrete-texture border-4 border-warning/40">
        <CardHeader>
          <CardTitle className="text-2xl font-black flex items-center gap-2">
            <BookOpen className="text-warning" size={24} />
            COURSE INFORMATION
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-bold text-neutral-500 uppercase mb-1">Course Title</p>
              <p className="text-lg font-bold text-neutral-800">{enrollment.course?.title}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-neutral-500 uppercase mb-1">Course Code</p>
              <p className="text-lg font-bold text-neutral-800">{enrollment.course?.code || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-neutral-500 uppercase mb-1">Instructor</p>
              <p className="text-lg font-bold text-neutral-800">
                {enrollment.course?.instructor ?
                  `${enrollment.course.instructor.firstName} ${enrollment.course.instructor.lastName}`
                  : 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-xs font-bold text-neutral-500 uppercase mb-1">Duration</p>
              <p className="text-lg font-bold text-neutral-800">{enrollment.course?.duration || 'N/A'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enrollment Status */}
      <Card className="glass-effect concrete-texture border-4 border-success/40">
        <CardHeader>
          <CardTitle className="text-2xl font-black flex items-center gap-2">
            <TrendingUp className="text-success" size={24} />
            ENROLLMENT STATUS
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-xs font-bold text-neutral-500 uppercase mb-1">Status</p>
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r ${getStatusColor(enrollment.status)}`}>
                <StatusIcon className="text-white" size={20} />
                <span className="text-white font-black">{enrollment.status}</span>
              </div>
            </div>
            <div>
              <p className="text-xs font-bold text-neutral-500 uppercase mb-1">Progress</p>
              <p className="text-lg font-bold text-neutral-800">{enrollment.progress || 0}%</p>
              <div className="w-full h-3 bg-neutral-200 rounded-full overflow-hidden mt-2">
                <div
                  className="h-full bg-gradient-to-r from-success to-green-600 transition-all"
                  style={{ width: `${enrollment.progress || 0}%` }}
                ></div>
              </div>
            </div>
            <div>
              <p className="text-xs font-bold text-neutral-500 uppercase mb-1">Completion Date</p>
              <p className="text-lg font-bold text-neutral-800">
                {enrollment.completedAt
                  ? new Date(enrollment.completedAt).toLocaleDateString()
                  : 'Not completed'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div>
              <p className="text-xs font-bold text-neutral-500 uppercase mb-1">Enrolled Date</p>
              <p className="text-lg font-bold text-neutral-800">
                {new Date(enrollment.enrolledAt).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-xs font-bold text-neutral-500 uppercase mb-1">Last Activity</p>
              <p className="text-lg font-bold text-neutral-800">
                {enrollment.lastAccessedAt
                  ? new Date(enrollment.lastAccessedAt).toLocaleDateString()
                  : 'No activity yet'}
              </p>
            </div>
            <div>
              <p className="text-xs font-bold text-neutral-500 uppercase mb-1">Grade</p>
              <p className="text-lg font-bold text-neutral-800">
                {enrollment.grade !== null ? `${enrollment.grade}%` : 'Not graded'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Certificate */}
      {enrollment.certificate && (
        <Card className="glass-effect concrete-texture border-4 border-warning/40">
          <CardHeader>
            <CardTitle className="text-2xl font-black flex items-center gap-2">
              <Award className="text-warning" size={24} />
              CERTIFICATE
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-neutral-500 uppercase mb-1">Certificate Issued</p>
                <p className="text-lg font-bold text-neutral-800">
                  {new Date(enrollment.certificate.issuedAt).toLocaleDateString()}
                </p>
              </div>
              <MagneticButton className="bg-gradient-to-r from-warning to-orange-600 text-white font-black">
                <Award className="mr-2" size={20} />
                VIEW CERTIFICATE
              </MagneticButton>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
