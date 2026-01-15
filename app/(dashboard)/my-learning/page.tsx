'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { MagneticButton } from '@/components/ui/magnetic-button'
import { BookOpen, Award, Clock, HardHat, Shield, Wrench, Play, CheckCircle, AlertCircle, Filter } from 'lucide-react'
import Link from 'next/link'
import { coursesService } from '@/lib/services'
import { useEntranceAnimation } from '@/lib/hooks'
import { LoadingState, ErrorState } from '@/components/ui/page-states'
import type { EnrollmentWithCourse } from '@/lib/types'
import type { LucideIcon } from 'lucide-react'

// Icon mapping for categories with proper typing
const CATEGORY_ICONS: Record<string, LucideIcon> = {
  Safety: Shield,
  Equipment: Wrench,
  Technical: BookOpen,
  Management: HardHat,
  Quality: Award,
  Construction: HardHat,
  Engineering: BookOpen,
}

// Helper function to get category color classes for accent bars
const getCategoryAccentBarClass = (categoryName: string) => {
  switch (categoryName) {
    case 'Safety':
      return 'absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-danger to-red-600'
    case 'Equipment':
      return 'absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-warning to-orange-600'
    case 'Technical':
      return 'absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary to-blue-600'
    case 'Management':
      return 'absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-success to-green-600'
    case 'Quality':
      return 'absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-secondary to-purple-600'
    case 'Construction':
      return 'absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-warning to-orange-600'
    case 'Engineering':
      return 'absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary to-blue-600'
    default:
      return 'absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary to-blue-600'
  }
}

// Helper function to get category icon background classes
const getCategoryIconBgClass = (categoryName: string) => {
  switch (categoryName) {
    case 'Safety':
      return 'w-16 h-16 bg-gradient-to-br from-danger to-red-600 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform'
    case 'Equipment':
      return 'w-16 h-16 bg-gradient-to-br from-warning to-orange-600 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform'
    case 'Technical':
      return 'w-16 h-16 bg-gradient-to-br from-primary to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform'
    case 'Management':
      return 'w-16 h-16 bg-gradient-to-br from-success to-green-600 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform'
    case 'Quality':
      return 'w-16 h-16 bg-gradient-to-br from-secondary to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform'
    case 'Construction':
      return 'w-16 h-16 bg-gradient-to-br from-warning to-orange-600 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform'
    case 'Engineering':
      return 'w-16 h-16 bg-gradient-to-br from-primary to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform'
    default:
      return 'w-16 h-16 bg-gradient-to-br from-primary to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform'
  }
}

// Helper function to get category progress bar classes
const getCategoryProgressBarClass = (categoryName: string) => {
  switch (categoryName) {
    case 'Safety':
      return 'bg-gradient-to-r from-danger to-red-600 h-3 rounded-full transition-all'
    case 'Equipment':
      return 'bg-gradient-to-r from-warning to-orange-600 h-3 rounded-full transition-all'
    case 'Technical':
      return 'bg-gradient-to-r from-primary to-blue-600 h-3 rounded-full transition-all'
    case 'Management':
      return 'bg-gradient-to-r from-success to-green-600 h-3 rounded-full transition-all'
    case 'Quality':
      return 'bg-gradient-to-r from-secondary to-purple-600 h-3 rounded-full transition-all'
    case 'Construction':
      return 'bg-gradient-to-r from-warning to-orange-600 h-3 rounded-full transition-all'
    case 'Engineering':
      return 'bg-gradient-to-r from-primary to-blue-600 h-3 rounded-full transition-all'
    default:
      return 'bg-gradient-to-r from-primary to-blue-600 h-3 rounded-full transition-all'
  }
}

const STATUS_FILTERS = [
  { id: 'all', label: 'ALL COURSES', icon: Filter },
  { id: 'in_progress', label: 'IN PROGRESS', icon: Play },
  { id: 'completed', label: 'COMPLETED', icon: CheckCircle },
  { id: 'not_started', label: 'NOT STARTED', icon: AlertCircle }
]

export default function MyLearningPage() {
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [enrollments, setEnrollments] = useState<EnrollmentWithCourse[]>([])
  const [filteredCourses, setFilteredCourses] = useState<EnrollmentWithCourse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Use entrance animation hook
  useEntranceAnimation({ selector: '.learning-item', staggerDelay: 0.05 }, [loading])

  useEffect(() => {
    fetchEnrollments()
  }, [])

  useEffect(() => {
    // Filter courses by status
    if (selectedStatus === 'all') {
      setFilteredCourses(enrollments)
    } else {
      setFilteredCourses(enrollments.filter(enrollment => {
        const status = getEnrollmentStatus(enrollment)
        return status === selectedStatus
      }))
    }
  }, [selectedStatus, enrollments])

  const fetchEnrollments = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await coursesService.getEnrollments()

      if (response.status < 200 || response.status >= 300) {
        throw new Error(response.error || 'Failed to fetch enrollments')
      }

      const enrollmentsData = Array.isArray(response.data) ? response.data : []
      setEnrollments(enrollmentsData)
      setFilteredCourses(enrollmentsData)
    } catch (err) {
      console.error('Error fetching enrollments:', err)
      setError(err instanceof Error ? err.message : 'Failed to load your courses')
    } finally {
      setLoading(false)
    }
  }

  const getEnrollmentStatus = (enrollment: EnrollmentWithCourse): string => {
    const progress = enrollment.progressPercentage || 0
    if (progress === 0) return 'not_started'
    if (progress === 100 || enrollment.status === 'COMPLETED') return 'completed'
    return 'in_progress'
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'in_progress':
        return <span className="text-xs font-bold px-3 py-1 rounded-full bg-warning/20 text-warning">IN PROGRESS</span>
      case 'completed':
        return <span className="text-xs font-bold px-3 py-1 rounded-full bg-success/20 text-success">COMPLETED</span>
      case 'not_started':
        return <span className="text-xs font-bold px-3 py-1 rounded-full bg-neutral-200 text-neutral-600">NOT STARTED</span>
      default:
        return null
    }
  }

  // Show loading state
  if (loading) {
    return <LoadingState message="Loading your courses..." size="lg" />
  }

  // Show error state
  if (error) {
    return (
      <ErrorState
        title="Error Loading Courses"
        message={error}
        onRetry={fetchEnrollments}
      />
    )
  }

  // Calculate stats from enrollments
  const totalEnrolled = enrollments.length
  const inProgress = enrollments.filter(e => getEnrollmentStatus(e) === 'in_progress').length
  const completed = enrollments.filter(e => getEnrollmentStatus(e) === 'completed').length

  return (
    <div className="space-y-6" role="main" aria-label="My Learning">
      {/* Page Header */}
      <div className="learning-item opacity-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-primary via-warning to-success bg-clip-text text-transparent">
              MY LEARNING
            </h1>
            <p className="text-neutral-600 font-semibold mt-1">
              Track your progress and continue training
            </p>
          </div>
          <div className="hidden md:block" aria-hidden="true">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-blue-600 rounded-xl flex items-center justify-center">
              <BookOpen className="text-white" size={32} />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      <section className="learning-item opacity-0 grid grid-cols-1 md:grid-cols-3 gap-4" aria-label="Learning statistics">
        <Card className="glass-effect concrete-texture border-4 border-primary/40 relative">
          <div className="absolute top-0 right-0 w-2 h-full bg-gradient-to-b from-primary to-blue-600" aria-hidden="true" />
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-neutral-600 uppercase" id="stat-enrolled-label">Total Enrolled</p>
                <p className="text-4xl font-black bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent mt-1" aria-labelledby="stat-enrolled-label">
                  {totalEnrolled}
                </p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-primary to-blue-600 rounded-xl flex items-center justify-center" aria-hidden="true">
                <BookOpen className="text-white" size={28} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-effect concrete-texture border-4 border-warning/40 relative">
          <div className="absolute top-0 right-0 w-2 h-full bg-gradient-to-b from-warning to-orange-600" aria-hidden="true" />
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-neutral-600 uppercase" id="stat-progress-label">In Progress</p>
                <p className="text-4xl font-black bg-gradient-to-r from-warning to-orange-600 bg-clip-text text-transparent mt-1" aria-labelledby="stat-progress-label">
                  {inProgress}
                </p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-warning to-orange-600 rounded-xl flex items-center justify-center" aria-hidden="true">
                <Play className="text-white" size={28} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-effect concrete-texture border-4 border-success/40 relative">
          <div className="absolute top-0 right-0 w-2 h-full bg-gradient-to-b from-success to-green-600" aria-hidden="true" />
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-neutral-600 uppercase" id="stat-completed-label">Completed</p>
                <p className="text-4xl font-black bg-gradient-to-r from-success to-green-600 bg-clip-text text-transparent mt-1" aria-labelledby="stat-completed-label">
                  {completed}
                </p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-success to-green-600 rounded-xl flex items-center justify-center" aria-hidden="true">
                <CheckCircle className="text-white" size={28} />
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Filter Tabs */}
      <Card className="learning-item opacity-0 glass-effect concrete-texture border-4 border-warning/40">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filter courses by status">
            {STATUS_FILTERS.map(filter => {
              const IconComponent = filter.icon
              const isActive = selectedStatus === filter.id
              return (
                <button
                  key={filter.id}
                  onClick={() => setSelectedStatus(filter.id)}
                  role="tab"
                  aria-selected={isActive}
                  aria-controls="course-list"
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-warning to-orange-600 text-white shadow-lg'
                      : 'glass-effect border-2 border-warning/30 text-neutral-700 hover:border-warning/60'
                  }`}
                >
                  <IconComponent size={16} aria-hidden="true" />
                  {filter.label}
                </button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Course List */}
      {filteredCourses.length > 0 ? (
        <div id="course-list" role="tabpanel" className="space-y-4" aria-label="Enrolled courses">
          {filteredCourses.map((enrollment) => {
            const course = enrollment.course
            const status = getEnrollmentStatus(enrollment)
            const progress = enrollment.progressPercentage || 0
            const categoryName = course?.category?.name || 'General'
            const IconComponent = CATEGORY_ICONS[categoryName] || BookOpen
            const lastAccessedDate = enrollment.updatedAt ? new Date(enrollment.updatedAt).toLocaleDateString() : 'Never'

            return (
              <article
                key={enrollment.id}
                className="learning-item opacity-0 glass-effect concrete-texture border-4 border-primary/20 hover:border-primary/40 transition-all group relative overflow-hidden rounded-lg"
                aria-label={`Course: ${course?.title || 'Untitled Course'}`}
              >
                {/* Accent Bar */}
                <div className={getCategoryAccentBarClass(categoryName)} aria-hidden="true" />

                <div className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Course Info */}
                    <div className="lg:col-span-7">
                      <div className="flex items-start gap-4">
                        <div className={getCategoryIconBgClass(categoryName)} aria-hidden="true">
                          <IconComponent className="text-white" size={32} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="text-xl font-black text-neutral-800 group-hover:text-primary transition-colors">
                                {course?.title || 'Untitled Course'}
                              </h3>
                              <p className="text-sm text-neutral-600 mt-1">{course?.description || 'No description available'}</p>
                            </div>
                            {getStatusBadge(status)}
                          </div>
                          <div className="flex flex-wrap items-center gap-4 mt-3">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-warning/10 rounded-lg flex items-center justify-center">
                                <Award className="text-warning" size={16} />
                              </div>
                              <span className="text-sm font-semibold text-neutral-700">{course?.difficultyLevel || 'Beginner'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                                <Clock className="text-primary" size={16} />
                              </div>
                              <span className="text-sm font-semibold text-neutral-700">{course?.duration || 'N/A'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-neutral-100 rounded-lg flex items-center justify-center">
                                <BookOpen className="text-neutral-600" size={16} />
                              </div>
                              <span className="text-sm font-semibold text-neutral-700">{categoryName}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Progress & Actions */}
                    <div className="lg:col-span-5">
                      <div className="h-full flex flex-col justify-between">
                        {/* Progress Bar */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-bold text-neutral-600" id={`progress-label-${enrollment.id}`}>PROGRESS</span>
                            <span className={`text-lg font-black ${progress === 100 ? 'text-success' : 'text-primary'}`}>
                              {progress}%
                            </span>
                          </div>
                          <div
                            className="w-full bg-neutral-200 rounded-full h-3 mb-3"
                            role="progressbar"
                            aria-valuenow={progress}
                            aria-valuemin={0}
                            aria-valuemax={100}
                            aria-labelledby={`progress-label-${enrollment.id}`}
                          >
                            <div
                              className={getCategoryProgressBarClass(categoryName)}
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                          <p className="text-xs text-neutral-500">Last accessed: {lastAccessedDate}</p>
                        </div>

                        {/* Action Button */}
                        <Link href={`/courses/${course?.id}`}>
                          <MagneticButton
                            className={`w-full mt-4 ${
                              status === 'not_started'
                                ? 'bg-gradient-to-r from-success to-green-600'
                                : 'bg-gradient-to-r from-primary to-blue-600'
                            } text-white font-black flex items-center justify-center gap-2`}
                            aria-label={status === 'not_started' ? `Start course: ${course?.title}` : status === 'completed' ? `Review course: ${course?.title}` : `Continue learning: ${course?.title}`}
                          >
                            {status === 'not_started' ? (
                              <>
                                <Play size={18} aria-hidden="true" />
                                START COURSE
                              </>
                            ) : status === 'completed' ? (
                              <>
                                <BookOpen size={18} aria-hidden="true" />
                                REVIEW COURSE
                              </>
                            ) : (
                              <>
                                <Play size={18} aria-hidden="true" />
                                CONTINUE LEARNING
                              </>
                            )}
                          </MagneticButton>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      ) : (
        <Card className="learning-item opacity-0 glass-effect concrete-texture border-4 border-neutral-300" id="course-list" role="tabpanel">
          <CardContent className="py-16 text-center" role="status">
            <div className="w-24 h-24 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4" aria-hidden="true">
              <BookOpen className="text-neutral-400" size={48} />
            </div>
            <h3 className="text-xl font-bold text-neutral-700 mb-2">No courses found</h3>
            <p className="text-neutral-500 mb-6">
              {selectedStatus === 'all'
                ? "You haven't enrolled in any courses yet"
                : `You don't have any ${selectedStatus.replace('_', ' ')} courses`}
            </p>
            {selectedStatus === 'all' ? (
              <Link href="/courses">
                <MagneticButton className="bg-gradient-to-r from-warning to-orange-600 text-white font-black" aria-label="Browse available courses">
                  <BookOpen className="mr-2" size={18} aria-hidden="true" />
                  BROWSE COURSES
                </MagneticButton>
              </Link>
            ) : (
              <MagneticButton
                onClick={() => setSelectedStatus('all')}
                className="bg-gradient-to-r from-primary to-blue-600 text-white font-black"
                aria-label="Clear filter and view all courses"
              >
                VIEW ALL COURSES
              </MagneticButton>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
