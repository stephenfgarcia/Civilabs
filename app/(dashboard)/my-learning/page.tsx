'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MagneticButton } from '@/components/ui/magnetic-button'
import { BookOpen, Award, Clock, TrendingUp, HardHat, Shield, Wrench, Play, CheckCircle, AlertCircle, Filter, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { coursesService } from '@/lib/services'

// Icon mapping for categories
const CATEGORY_ICONS: Record<string, any> = {
  Safety: Shield,
  Equipment: Wrench,
  Technical: BookOpen,
  Management: HardHat,
  Quality: Award,
  Construction: HardHat,
  Engineering: BookOpen,
}

// Color mapping for categories
const CATEGORY_COLORS: Record<string, string> = {
  Safety: 'from-danger to-red-600',
  Equipment: 'from-warning to-orange-600',
  Technical: 'from-primary to-blue-600',
  Management: 'from-success to-green-600',
  Quality: 'from-secondary to-purple-600',
  Construction: 'from-warning to-orange-600',
  Engineering: 'from-primary to-blue-600',
}

const STATUS_FILTERS = [
  { id: 'all', label: 'ALL COURSES', icon: Filter },
  { id: 'in_progress', label: 'IN PROGRESS', icon: Play },
  { id: 'completed', label: 'COMPLETED', icon: CheckCircle },
  { id: 'not_started', label: 'NOT STARTED', icon: AlertCircle }
]

export default function MyLearningPage() {
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [enrollments, setEnrollments] = useState<any[]>([])
  const [filteredCourses, setFilteredCourses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Fetch enrollments on mount
    fetchEnrollments()

    // Simple CSS-only entrance animations
    const elements = document.querySelectorAll('.learning-item')
    elements.forEach((el, index) => {
      const htmlEl = el as HTMLElement
      htmlEl.style.animation = `fadeInUp 0.4s ease-out forwards ${index * 0.05}s`
    })
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

      if (response.error) {
        throw new Error(response.error)
      }

      const enrollmentsData = response.data?.data || []
      setEnrollments(enrollmentsData)
      setFilteredCourses(enrollmentsData)
    } catch (err) {
      console.error('Error fetching enrollments:', err)
      setError(err instanceof Error ? err.message : 'Failed to load your courses')
    } finally {
      setLoading(false)
    }
  }

  const getEnrollmentStatus = (enrollment: any) => {
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
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 mx-auto text-warning mb-4" />
          <p className="text-lg font-bold text-neutral-700">Loading your courses...</p>
        </div>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="glass-effect concrete-texture border-4 border-red-500/40 max-w-md">
          <CardHeader>
            <CardTitle className="text-xl font-black flex items-center gap-2 text-red-600">
              <AlertCircle />
              Error Loading Courses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-neutral-700 mb-4">{error}</p>
            <MagneticButton onClick={fetchEnrollments} className="bg-gradient-to-r from-warning to-orange-600 text-white font-black">
              Try Again
            </MagneticButton>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Calculate stats from enrollments
  const totalEnrolled = enrollments.length
  const inProgress = enrollments.filter(e => getEnrollmentStatus(e) === 'in_progress').length
  const completed = enrollments.filter(e => getEnrollmentStatus(e) === 'completed').length

  return (
    <div className="space-y-6">
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
          <div className="hidden md:block">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-blue-600 rounded-xl flex items-center justify-center">
              <BookOpen className="text-white" size={32} />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="learning-item opacity-0 grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="glass-effect concrete-texture border-4 border-primary/40 relative">
          <div className="absolute top-0 right-0 w-2 h-full bg-gradient-to-b from-primary to-blue-600"></div>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-neutral-600 uppercase">Total Enrolled</p>
                <p className="text-4xl font-black bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent mt-1">
                  {totalEnrolled}
                </p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-primary to-blue-600 rounded-xl flex items-center justify-center">
                <BookOpen className="text-white" size={28} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-effect concrete-texture border-4 border-warning/40 relative">
          <div className="absolute top-0 right-0 w-2 h-full bg-gradient-to-b from-warning to-orange-600"></div>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-neutral-600 uppercase">In Progress</p>
                <p className="text-4xl font-black bg-gradient-to-r from-warning to-orange-600 bg-clip-text text-transparent mt-1">
                  {inProgress}
                </p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-warning to-orange-600 rounded-xl flex items-center justify-center">
                <Play className="text-white" size={28} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-effect concrete-texture border-4 border-success/40 relative">
          <div className="absolute top-0 right-0 w-2 h-full bg-gradient-to-b from-success to-green-600"></div>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-neutral-600 uppercase">Completed</p>
                <p className="text-4xl font-black bg-gradient-to-r from-success to-green-600 bg-clip-text text-transparent mt-1">
                  {completed}
                </p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-success to-green-600 rounded-xl flex items-center justify-center">
                <CheckCircle className="text-white" size={28} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Tabs */}
      <Card className="learning-item opacity-0 glass-effect concrete-texture border-4 border-warning/40">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-2">
            {STATUS_FILTERS.map(filter => {
              const IconComponent = filter.icon
              const isActive = selectedStatus === filter.id
              return (
                <button
                  key={filter.id}
                  onClick={() => setSelectedStatus(filter.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-warning to-orange-600 text-white shadow-lg'
                      : 'glass-effect border-2 border-warning/30 text-neutral-700 hover:border-warning/60'
                  }`}
                >
                  <IconComponent size={16} />
                  {filter.label}
                </button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Course List */}
      {filteredCourses.length > 0 ? (
        <div className="space-y-4">
          {filteredCourses.map((enrollment, index) => {
            const course = enrollment.course
            const status = getEnrollmentStatus(enrollment)
            const progress = enrollment.progressPercentage || 0
            const categoryName = course?.category?.name || 'General'
            const IconComponent = CATEGORY_ICONS[categoryName] || BookOpen
            const color = CATEGORY_COLORS[categoryName] || 'from-primary to-blue-600'
            const lastAccessedDate = enrollment.updatedAt ? new Date(enrollment.updatedAt).toLocaleDateString() : 'Never'

            return (
              <Card
                key={enrollment.id}
                className="learning-item opacity-0 glass-effect concrete-texture border-4 border-primary/20 hover:border-primary/40 transition-all group relative overflow-hidden"
              >
                {/* Accent Bar */}
                <div className={`absolute top-0 left-0 w-full h-2 bg-gradient-to-r ${color}`}></div>

                <CardContent className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Course Info */}
                    <div className="lg:col-span-7">
                      <div className="flex items-start gap-4">
                        <div className={`w-16 h-16 bg-gradient-to-br ${color} rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
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
                            <span className="text-sm font-bold text-neutral-600">PROGRESS</span>
                            <span className={`text-lg font-black ${progress === 100 ? 'text-success' : 'text-primary'}`}>
                              {progress}%
                            </span>
                          </div>
                          <div className="w-full bg-neutral-200 rounded-full h-3 mb-3">
                            <div
                              className={`bg-gradient-to-r ${color} h-3 rounded-full transition-all`}
                              style={{ width: `${progress}%` }}
                            ></div>
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
                          >
                            {status === 'not_started' ? (
                              <>
                                <Play size={18} />
                                START COURSE
                              </>
                            ) : status === 'completed' ? (
                              <>
                                <BookOpen size={18} />
                                REVIEW COURSE
                              </>
                            ) : (
                              <>
                                <Play size={18} />
                                CONTINUE LEARNING
                              </>
                            )}
                          </MagneticButton>
                        </Link>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        <Card className="learning-item opacity-0 glass-effect concrete-texture border-4 border-neutral-300">
          <CardContent className="py-16 text-center">
            <div className="w-24 h-24 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
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
                <MagneticButton className="bg-gradient-to-r from-warning to-orange-600 text-white font-black">
                  <BookOpen className="mr-2" size={18} />
                  BROWSE COURSES
                </MagneticButton>
              </Link>
            ) : (
              <MagneticButton
                onClick={() => setSelectedStatus('all')}
                className="bg-gradient-to-r from-primary to-blue-600 text-white font-black"
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
