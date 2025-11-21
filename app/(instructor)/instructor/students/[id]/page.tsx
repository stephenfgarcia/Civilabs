/**
 * Student Profile Page
 * Detailed view of a student's progress, enrollments, and activity
 */

'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { MagneticButton } from '@/components/ui/magnetic-button'
import { MessageModal } from '@/components/messaging/MessageModal'
import {
  ArrowLeft,
  BookOpen,
  Award,
  TrendingUp,
  Target,
  MessageSquare,
  Mail,
  Calendar,
  CheckCircle,
  Clock,
  Star,
  FileText,
  Loader2,
  AlertCircle,
} from 'lucide-react'

interface StudentProfile {
  student: {
    id: string
    firstName: string
    lastName: string
    email: string
    avatarUrl?: string
    role: string
    createdAt: string
    department?: {
      id: string
      name: string
    }
  }
  enrollments: Array<{
    id: string
    courseId: string
    status: string
    enrolledAt: string
    completedAt?: string
    progress: number
    lessonsCount: number
    completedLessons: number
    course: {
      id: string
      title: string
      description: string
      thumbnail?: string
      instructor: {
        firstName: string
        lastName: string
      }
    }
  }>
  quizAttempts: Array<{
    id: string
    scorePercentage: number | null
    completedAt: string | null
    quiz: {
      title: string
      lesson: {
        title: string
        course: {
          title: string
        }
      }
    }
  }>
  certificates: Array<{
    id: string
    issuedAt: string
    certificateUrl: string
    course: {
      title: string
    }
  }>
  recentActivity: {
    discussions: Array<{
      id: string
      title: string
      createdAt: string
      course: {
        title: string
      }
    }>
    reviews: Array<{
      id: string
      rating: number
      comment: string
      createdAt: string
      course: {
        title: string
      }
    }>
  }
  stats: {
    totalEnrollments: number
    completedCourses: number
    avgProgress: number
    avgQuizScore: number
    totalCertificates: number
  }
}

export default function StudentProfilePage() {
  const params = useParams()
  const router = useRouter()
  const studentId = params.id as string

  const [profile, setProfile] = useState<StudentProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [messageModalOpen, setMessageModalOpen] = useState(false)

  useEffect(() => {
    fetchProfile()
  }, [studentId])

  async function fetchProfile() {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/instructor/students/${studentId}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to load student profile')
      }

      setProfile(data.data)
    } catch (err) {
      console.error('Error fetching profile:', err)
      setError(err instanceof Error ? err.message : 'Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-lg font-bold text-neutral-600">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="p-8 border-4 border-danger/40 max-w-md">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-danger mx-auto mb-4" />
            <h2 className="text-xl font-black text-neutral-800 mb-2">Failed to Load</h2>
            <p className="text-neutral-600 mb-4">{error || 'Student not found'}</p>
            <MagneticButton
              onClick={() => router.back()}
              className="bg-gradient-to-r from-primary to-blue-600 text-white font-black"
            >
              GO BACK
            </MagneticButton>
          </div>
        </Card>
      </div>
    )
  }

  const { student, enrollments, quizAttempts, certificates, recentActivity, stats } = profile

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <MagneticButton
          onClick={() => router.back()}
          className="glass-effect border-2 border-neutral-300 text-neutral-700 font-bold mb-4"
        >
          <ArrowLeft className="mr-2" size={20} />
          BACK TO STUDENTS
        </MagneticButton>

        <div className="flex items-start justify-between">
          <div className="flex items-center gap-6">
            {student.avatarUrl ? (
              <img
                src={student.avatarUrl}
                alt={`${student.firstName} ${student.lastName}`}
                className="w-24 h-24 rounded-full border-4 border-primary/40 object-cover"
              />
            ) : (
              <div className="w-24 h-24 rounded-full border-4 border-primary/40 bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center">
                <span className="text-3xl font-black text-white">
                  {student.firstName[0]}
                  {student.lastName[0]}
                </span>
              </div>
            )}

            <div>
              <h1 className="text-4xl font-black text-neutral-800">
                {student.firstName} {student.lastName}
              </h1>
              <p className="text-neutral-600 font-medium mt-1">{student.email}</p>
              {student.department && (
                <p className="text-sm text-neutral-500 font-medium mt-1">
                  {student.department.name}
                </p>
              )}
              <p className="text-xs text-neutral-400 font-medium mt-2">
                Member since {new Date(student.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <MagneticButton
              onClick={() => setMessageModalOpen(true)}
              className="bg-gradient-to-r from-warning to-orange-600 text-white font-black"
            >
              <MessageSquare className="mr-2" size={20} />
              MESSAGE
            </MagneticButton>
            <MagneticButton
              onClick={() => (window.location.href = `mailto:${student.email}`)}
              className="bg-gradient-to-r from-success to-green-600 text-white font-black"
            >
              <Mail className="mr-2" size={20} />
              EMAIL
            </MagneticButton>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card className="p-6 border-4 border-primary/40">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-blue-600 rounded-lg flex items-center justify-center shadow-lg">
              <BookOpen className="text-white" size={24} />
            </div>
          </div>
          <p className="text-sm font-bold text-neutral-600 mb-1">Enrolled</p>
          <p className="text-3xl font-black text-neutral-800">{stats.totalEnrollments}</p>
        </Card>

        <Card className="p-6 border-4 border-success/40">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-success to-green-600 rounded-lg flex items-center justify-center shadow-lg">
              <CheckCircle className="text-white" size={24} />
            </div>
          </div>
          <p className="text-sm font-bold text-neutral-600 mb-1">Completed</p>
          <p className="text-3xl font-black text-neutral-800">{stats.completedCourses}</p>
        </Card>

        <Card className="p-6 border-4 border-warning/40">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-warning to-orange-600 rounded-lg flex items-center justify-center shadow-lg">
              <TrendingUp className="text-white" size={24} />
            </div>
          </div>
          <p className="text-sm font-bold text-neutral-600 mb-1">Avg Progress</p>
          <p className="text-3xl font-black text-neutral-800">{stats.avgProgress}%</p>
        </Card>

        <Card className="p-6 border-4 border-secondary/40">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-secondary to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
              <Target className="text-white" size={24} />
            </div>
          </div>
          <p className="text-sm font-bold text-neutral-600 mb-1">Avg Quiz Score</p>
          <p className="text-3xl font-black text-neutral-800">{stats.avgQuizScore}%</p>
        </Card>

        <Card className="p-6 border-4 border-accent/40">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-accent to-pink-600 rounded-lg flex items-center justify-center shadow-lg">
              <Award className="text-white" size={24} />
            </div>
          </div>
          <p className="text-sm font-bold text-neutral-600 mb-1">Certificates</p>
          <p className="text-3xl font-black text-neutral-800">{stats.totalCertificates}</p>
        </Card>
      </div>

      {/* Enrollments */}
      <Card className="p-6 border-4 border-neutral-200">
        <h2 className="text-2xl font-black text-neutral-800 mb-6">COURSE ENROLLMENTS</h2>
        {enrollments.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="mx-auto text-neutral-400 mb-4" size={48} />
            <p className="text-lg font-bold text-neutral-600">No enrollments yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {enrollments.map((enrollment) => (
              <Card key={enrollment.id} className="p-6 border-2 border-neutral-200">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-black text-neutral-800 mb-1">
                      {enrollment.course.title}
                    </h3>
                    <p className="text-sm text-neutral-600 font-medium mb-2">
                      by {enrollment.course.instructor.firstName}{' '}
                      {enrollment.course.instructor.lastName}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-neutral-500">
                      <Calendar size={14} />
                      <span>
                        Enrolled {new Date(enrollment.enrolledAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-black ${
                      enrollment.status === 'COMPLETED'
                        ? 'bg-success/20 text-success'
                        : enrollment.status === 'IN_PROGRESS'
                        ? 'bg-warning/20 text-warning'
                        : 'bg-neutral-200 text-neutral-600'
                    }`}
                  >
                    {enrollment.status}
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-bold text-neutral-600">Progress</span>
                    <span className="font-black text-neutral-800">{enrollment.progress}%</span>
                  </div>
                  <div className="w-full bg-neutral-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-primary to-blue-600"
                      style={{ width: `${enrollment.progress}%` }}
                    />
                  </div>
                  <p className="text-xs text-neutral-500 font-medium">
                    {enrollment.completedLessons} of {enrollment.lessonsCount} lessons completed
                  </p>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Recent Quiz Attempts */}
        <Card className="p-6 border-4 border-neutral-200">
          <h2 className="text-2xl font-black text-neutral-800 mb-6">RECENT QUIZ ATTEMPTS</h2>
          {quizAttempts.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="mx-auto text-neutral-400 mb-4" size={48} />
              <p className="text-lg font-bold text-neutral-600">No quiz attempts yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {quizAttempts.map((attempt) => (
                <div
                  key={attempt.id}
                  className="p-4 border-2 border-neutral-200 rounded-lg"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-black text-neutral-800">{attempt.quiz.title}</p>
                      <p className="text-xs text-neutral-500 font-medium">
                        {attempt.quiz.lesson.course.title}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-black ${
                        (attempt.scorePercentage || 0) >= 80
                          ? 'bg-success/20 text-success'
                          : (attempt.scorePercentage || 0) >= 60
                          ? 'bg-warning/20 text-warning'
                          : 'bg-danger/20 text-danger'
                      }`}
                    >
                      {attempt.scorePercentage || 0}%
                    </span>
                  </div>
                  <p className="text-xs text-neutral-400 font-medium">
                    {attempt.completedAt ? new Date(attempt.completedAt).toLocaleString() : 'In progress'}
                  </p>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Recent Activity */}
        <Card className="p-6 border-4 border-neutral-200">
          <h2 className="text-2xl font-black text-neutral-800 mb-6">RECENT ACTIVITY</h2>
          <div className="space-y-6">
            {/* Discussions */}
            {recentActivity.discussions.length > 0 && (
              <div>
                <h3 className="text-sm font-black text-neutral-600 mb-3">DISCUSSIONS</h3>
                <div className="space-y-3">
                  {recentActivity.discussions.map((discussion) => (
                    <div
                      key={discussion.id}
                      className="p-3 border-2 border-neutral-200 rounded-lg"
                    >
                      <p className="font-bold text-sm text-neutral-800">
                        {discussion.title}
                      </p>
                      <p className="text-xs text-neutral-500 font-medium mt-1">
                        {discussion.course.title} •{' '}
                        {new Date(discussion.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews */}
            {recentActivity.reviews.length > 0 && (
              <div>
                <h3 className="text-sm font-black text-neutral-600 mb-3">REVIEWS</h3>
                <div className="space-y-3">
                  {recentActivity.reviews.map((review) => (
                    <div key={review.id} className="p-3 border-2 border-neutral-200 rounded-lg">
                      <div className="flex items-center gap-1 mb-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={14}
                            className={
                              i < review.rating ? 'fill-warning text-warning' : 'text-neutral-300'
                            }
                          />
                        ))}
                      </div>
                      {review.comment && (
                        <p className="text-sm text-neutral-700 font-medium mb-1">
                          {review.comment}
                        </p>
                      )}
                      <p className="text-xs text-neutral-500 font-medium">
                        {review.course.title} •{' '}
                        {new Date(review.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {recentActivity.discussions.length === 0 && recentActivity.reviews.length === 0 && (
              <div className="text-center py-12">
                <Clock className="mx-auto text-neutral-400 mb-4" size={48} />
                <p className="text-lg font-bold text-neutral-600">No recent activity</p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Message Modal */}
      <MessageModal
        isOpen={messageModalOpen}
        onClose={() => setMessageModalOpen(false)}
        recipientId={student.id}
        recipientName={`${student.firstName} ${student.lastName}`}
      />
    </div>
  )
}
