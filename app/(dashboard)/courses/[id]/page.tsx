'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MagneticButton } from '@/components/ui/magnetic-button'
import { LoadingState, ErrorState } from '@/components/ui/page-states'
import {
  BookOpen,
  Clock,
  Users,
  Award,
  CheckCircle,
  PlayCircle,
  FileText,
  Download,
  Star,
  Shield,
  Wrench,
  HardHat,
  Zap,
  ArrowLeft,
  Lock,
  BarChart,
  ChevronRight,
  Loader2,
  AlertCircle,
  MessageSquare,
  Bookmark,
  BookmarkCheck,
  type LucideIcon
} from 'lucide-react'
import Link from 'next/link'
import { coursesService } from '@/lib/services'
import { useToast, useEntranceAnimation } from '@/lib/hooks'

// Type definitions
interface CourseInstructor {
  firstName?: string
  lastName?: string
  email?: string
  bio?: string
}

interface CourseLesson {
  id: string
  title: string
  description?: string
  contentType: string
  durationMinutes?: number
  quiz?: unknown
}

interface CourseCategory {
  id: string | number
  name: string
}

interface LessonProgress {
  lessonId: string
}

interface CourseEnrollment {
  id: string
  courseId: string
  userId: string
  status: string
  progressPercentage?: number
  lessonProgress?: LessonProgress[]
}

interface CourseReview {
  id: string
  rating: number
  comment?: string
  createdAt: string
  userId: string
  user: {
    firstName?: string
    lastName?: string
  }
}

interface CourseData {
  id: string | number
  title: string
  description?: string
  difficultyLevel?: string
  durationMinutes?: number
  category?: CourseCategory
  instructor?: CourseInstructor
  lessons?: CourseLesson[]
  objectives?: string[]
  status?: string
  _count?: {
    enrollments?: number
    lessons?: number
  }
}

// Icon mapping for categories
const CATEGORY_ICONS: Record<string, LucideIcon> = {
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

export default function CourseDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const courseId = params.id as string
  const [course, setCourse] = useState<CourseData | null>(null)
  const [enrollment, setEnrollment] = useState<CourseEnrollment | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [enrolling, setEnrolling] = useState(false)
  const [reviews, setReviews] = useState<CourseReview[]>([])
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewComment, setReviewComment] = useState('')
  const [submittingReview, setSubmittingReview] = useState(false)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [bookmarkId, setBookmarkId] = useState<string | null>(null)

  // Use entrance animation hook
  useEntranceAnimation({ selector: '.course-detail-item', staggerDelay: 0.05 }, [loading, course])

  useEffect(() => {
    fetchCourseData()
    fetchBookmarkStatus()
  }, [courseId])

  const fetchCourseData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch course details
      const courseResponse = await coursesService.getCourseById(courseId)

      if (courseResponse.status >= 200 && courseResponse.status < 300 && courseResponse.data) {
        setCourse(courseResponse.data as unknown as CourseData)
      } else {
        throw new Error(courseResponse.error || 'Course not found')
      }

      // Check if user is enrolled
      const enrollmentsResponse = await coursesService.getEnrollments()
      if (enrollmentsResponse.status >= 200 && enrollmentsResponse.status < 300 && enrollmentsResponse.data) {
        const enrollments = Array.isArray(enrollmentsResponse.data)
          ? enrollmentsResponse.data
          : (enrollmentsResponse.data as any).data || []
        const userEnrollment = enrollments.find(
          (e: any) => e.courseId === courseResponse.data?.id
        )
        setEnrollment(userEnrollment)
      }

      // Fetch reviews
      await fetchReviews()
    } catch (err) {
      console.error('Error fetching course:', err)
      setError(err instanceof Error ? err.message : 'Failed to load course')
    } finally {
      setLoading(false)
    }
  }

  const fetchReviews = async () => {
    try {
      const response = await fetch(`/api/reviews?courseId=${courseId}`, {
        credentials: 'include'
      })
      const data = await response.json()

      if (data.success && data.data) {
        setReviews(data.data)
      }
    } catch (err) {
      console.error('Error fetching reviews:', err)
    }
  }

  const handleSubmitReview = async () => {
    try {
      setSubmittingReview(true)
      setError(null)

      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          courseId,
          rating: reviewRating,
          comment: reviewComment
        })
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to submit review')
      }

      // Reset form and refresh reviews
      setReviewComment('')
      setReviewRating(5)
      setShowReviewForm(false)
      await fetchReviews()
    } catch (err) {
      console.error('Error submitting review:', err)
      setError(err instanceof Error ? err.message : 'Failed to submit review')
    } finally {
      setSubmittingReview(false)
    }
  }

  const handleEnroll = async () => {
    try {
      setEnrolling(true)
      const response = await coursesService.enrollCourse(courseId)

      if (response.error) {
        throw new Error(response.error)
      }

      // Refresh course data to get updated enrollment
      await fetchCourseData()
    } catch (err) {
      console.error('Error enrolling:', err)
      setError(err instanceof Error ? err.message : 'Failed to enroll in course')
    } finally {
      setEnrolling(false)
    }
  }

  const fetchBookmarkStatus = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const response = await fetch('/api/bookmarks', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        const bookmark = data.data.find((b: any) => b.courseId === courseId)
        if (bookmark) {
          setIsBookmarked(true)
          setBookmarkId(bookmark.id)
        }
      }
    } catch (error) {
      console.error('Error fetching bookmark status:', error)
    }
  }

  const toggleBookmark = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        toast({
          title: 'Authentication Required',
          description: 'Please login to bookmark courses',
          variant: 'destructive',
        })
        return
      }

      if (isBookmarked && bookmarkId) {
        // Remove bookmark
        const response = await fetch(`/api/bookmarks/${bookmarkId}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (response.ok) {
          setIsBookmarked(false)
          setBookmarkId(null)
          toast({
            title: 'Bookmark Removed',
            description: 'Course has been removed from your bookmarks',
          })
        }
      } else {
        // Add bookmark
        const response = await fetch('/api/bookmarks', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ courseId }),
        })

        if (response.ok) {
          const data = await response.json()
          setIsBookmarked(true)
          setBookmarkId(data.data.id)
          toast({
            title: 'Bookmark Added',
            description: 'Course has been added to your bookmarks',
          })
        }
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error)
      toast({
        title: 'Error',
        description: 'Failed to update bookmark. Please try again.',
        variant: 'destructive',
      })
    }
  }

  // Loading state
  if (loading) {
    return <LoadingState message="Loading course details..." size="lg" />
  }

  // Error state
  if (error || !course) {
    return (
      <div className="space-y-4">
        <ErrorState
          title={!course ? 'COURSE NOT FOUND' : 'ERROR LOADING COURSE'}
          message={!course ? "The course you're looking for doesn't exist." : error || 'An error occurred'}
          onRetry={error ? fetchCourseData : undefined}
        />
        <div className="text-center">
          <Link href="/courses">
            <MagneticButton className="bg-gradient-to-r from-primary to-blue-600 text-white font-black">
              BACK TO COURSES
            </MagneticButton>
          </Link>
        </div>
      </div>
    )
  }

  const categoryName = course.category?.name || 'General'
  const Icon = CATEGORY_ICONS[categoryName] || BookOpen
  const color = CATEGORY_COLORS[categoryName] || 'from-primary to-blue-600'
  const isEnrolled = !!enrollment
  const progress = enrollment?.progressPercentage || 0

  // Calculate lesson progress
  const totalLessons = course.lessons?.length || 0
  const completedLessonIds = enrollment?.lessonProgress?.map((lp: any) => lp.lessonId) || []
  const completedLessons = completedLessonIds.length

  const getLessonIcon = (type: string) => {
    switch (type) {
      case 'video':
        return PlayCircle
      case 'reading':
        return FileText
      case 'quiz':
        return Award
      default:
        return BookOpen
    }
  }

  return (
    <div className="space-y-6" role="main" aria-label={`Course: ${course.title}`}>
      {/* Back Button */}
      <nav className="course-detail-item opacity-0" aria-label="Breadcrumb navigation">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-neutral-700 hover:text-primary font-bold transition-colors"
          aria-label="Go back to courses list"
        >
          <ArrowLeft size={20} aria-hidden="true" />
          BACK TO COURSES
        </button>
      </nav>

      {/* Course Header */}
      <header className="course-detail-item opacity-0">
        <div className="glass-effect concrete-texture rounded-xl p-8 md:p-12 relative overflow-hidden border-4 border-primary/40">
          {/* Blueprint corner markers */}
          <div className="absolute top-2 left-2 w-12 h-12 border-t-4 border-l-4 border-primary/60" aria-hidden="true"></div>
          <div className="absolute top-2 right-2 w-12 h-12 border-t-4 border-r-4 border-primary/60" aria-hidden="true"></div>
          <div className="absolute bottom-2 left-2 w-12 h-12 border-b-4 border-l-4 border-primary/60" aria-hidden="true"></div>
          <div className="absolute bottom-2 right-2 w-12 h-12 border-b-4 border-r-4 border-primary/60" aria-hidden="true"></div>

          {/* Background */}
          <div className={`absolute inset-0 bg-gradient-to-r ${color} opacity-10`} aria-hidden="true"></div>
          <div className="absolute inset-0 blueprint-grid opacity-20" aria-hidden="true"></div>

          <div className="relative z-10">
            <div className="flex items-start gap-6 flex-wrap">
              <div className={`w-20 h-20 bg-gradient-to-br ${color} rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg`} aria-hidden="true">
                <Icon className="text-white" size={40} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                  <span className={`px-4 py-1 rounded-full text-sm font-black bg-gradient-to-r ${color} text-white`}>
                    {categoryName}
                  </span>
                  <span className="px-4 py-1 rounded-full text-sm font-black bg-gradient-to-r from-neutral-600 to-neutral-800 text-white">
                    {course.difficultyLevel || 'Beginner'}
                  </span>
                  {isEnrolled && (
                    <span className="px-4 py-1 rounded-full text-sm font-black bg-gradient-to-r from-success to-green-600 text-white">
                      ENROLLED
                    </span>
                  )}
                </div>

                <h1 className="text-4xl md:text-5xl font-black text-neutral-800 mb-4">{course.title}</h1>
                <p className="text-lg text-neutral-700 font-medium mb-6">{course.description || 'No description available'}</p>

                <dl className="flex items-center gap-6 flex-wrap mb-6">
                  {course.durationMinutes && (
                    <div className="flex items-center gap-2">
                      <Clock className="text-primary" size={20} aria-hidden="true" />
                      <div>
                        <dt className="sr-only">Duration</dt>
                        <dd className="font-bold text-neutral-700">
                          {course.durationMinutes >= 60
                            ? `${Math.floor(course.durationMinutes / 60)} hours ${course.durationMinutes % 60 > 0 ? `${course.durationMinutes % 60} min` : ''}`
                            : `${course.durationMinutes} min`
                          }
                        </dd>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Users className="text-success" size={20} aria-hidden="true" />
                    <div>
                      <dt className="sr-only">Students enrolled</dt>
                      <dd className="font-bold text-neutral-700">{course._count?.enrollments || 0} students</dd>
                    </div>
                  </div>
                  {totalLessons > 0 && (
                    <div className="flex items-center gap-2">
                      <BookOpen className="text-secondary" size={20} aria-hidden="true" />
                      <div>
                        <dt className="sr-only">Total lessons</dt>
                        <dd className="font-bold text-neutral-700">{totalLessons} lessons</dd>
                      </div>
                    </div>
                  )}
                </dl>

                <div className="flex items-center gap-4 flex-wrap">
                  {isEnrolled ? (
                    <Link
                      href={
                        course.lessons && course.lessons.length > 0
                          ? `/courses/${course.id}/lessons/${course.lessons[0].id}`
                          : `/courses/${course.id}/lessons`
                      }
                    >
                      <MagneticButton className="bg-gradient-to-r from-success to-green-600 text-white font-black">
                        <PlayCircle className="mr-2" size={20} />
                        {course.lessons && course.lessons.length > 0 ? 'START LEARNING' : 'VIEW COURSE'}
                      </MagneticButton>
                    </Link>
                  ) : (
                    <MagneticButton
                      onClick={handleEnroll}
                      disabled={enrolling}
                      className="bg-gradient-to-r from-primary to-blue-600 text-white font-black disabled:opacity-50"
                    >
                      {enrolling ? (
                        <>
                          <Loader2 className="mr-2 animate-spin" size={20} />
                          ENROLLING...
                        </>
                      ) : (
                        <>
                          <Zap className="mr-2" size={20} />
                          ENROLL NOW
                        </>
                      )}
                    </MagneticButton>
                  )}
                  <MagneticButton
                    onClick={toggleBookmark}
                    className={`font-black ${
                      isBookmarked
                        ? 'bg-gradient-to-r from-warning to-orange-600 text-white'
                        : 'glass-effect border-2 border-warning text-warning'
                    }`}
                    aria-pressed={isBookmarked}
                    aria-label={isBookmarked ? 'Remove from bookmarks' : 'Add to bookmarks'}
                  >
                    {isBookmarked ? (
                      <>
                        <BookmarkCheck className="mr-2" size={20} aria-hidden="true" />
                        BOOKMARKED
                      </>
                    ) : (
                      <>
                        <Bookmark className="mr-2" size={20} aria-hidden="true" />
                        BOOKMARK
                      </>
                    )}
                  </MagneticButton>
                  <MagneticButton
                    onClick={() => {
                      toast({
                        title: 'Coming Soon',
                        description: 'Syllabus download will be available in a future update',
                      })
                    }}
                    className="glass-effect border-2 border-neutral-400 text-neutral-700 font-black"
                  >
                    <Download className="mr-2" size={20} />
                    DOWNLOAD SYLLABUS
                  </MagneticButton>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Progress (if enrolled) */}
      {isEnrolled && (
        <Card className="course-detail-item opacity-0 glass-effect concrete-texture border-4 border-success/40">
          <CardHeader>
            <CardTitle className="text-xl font-black flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-success to-green-600 rounded-lg flex items-center justify-center" aria-hidden="true">
                <BarChart className="text-white" size={20} />
              </div>
              YOUR PROGRESS
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-bold text-neutral-700" id="progress-label">Overall Completion</span>
                <span className="text-2xl font-black bg-gradient-to-r from-success to-green-600 bg-clip-text text-transparent" aria-live="polite">
                  {progress}%
                </span>
              </div>
              <div
                className="w-full bg-neutral-200 rounded-full h-4"
                role="progressbar"
                aria-valuenow={progress}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-labelledby="progress-label"
              >
                <div
                  className="bg-gradient-to-r from-success to-green-600 h-4 rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              {totalLessons > 0 && (
                <div className="flex items-center justify-between text-sm font-semibold text-neutral-600">
                  <span>{completedLessons} of {totalLessons} lessons completed</span>
                  <span>{totalLessons - completedLessons} remaining</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Course Curriculum */}
          <section aria-labelledby="curriculum-heading">
            <Card className="course-detail-item opacity-0 glass-effect concrete-texture border-4 border-primary/40">
              <CardHeader>
                <CardTitle id="curriculum-heading" className="text-2xl font-black flex items-center gap-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary to-blue-600 rounded-lg flex items-center justify-center" aria-hidden="true">
                    <BookOpen className="text-white" size={20} />
                  </div>
                  COURSE CURRICULUM
                </CardTitle>
              </CardHeader>
              <CardContent>
                {totalLessons === 0 ? (
                  <div className="text-center py-8">
                    <BookOpen className="mx-auto h-16 w-16 text-neutral-400 mb-4" aria-hidden="true" />
                    <p className="text-neutral-600 font-semibold">No lessons available yet</p>
                  </div>
                ) : (
                  <ol className="space-y-3" aria-label={`${totalLessons} lessons in this course`}>
                    {Array.isArray(course.lessons) && course.lessons.map((lesson, index: number) => {
                    const isCompleted = completedLessonIds.includes(lesson.id)
                    const isLocked = !isEnrolled
                    const hasQuiz = !!lesson.quiz

                    // Map content type to display type
                    const contentTypeMap: Record<string, string> = {
                      VIDEO: 'video',
                      TEXT: 'reading',
                      QUIZ: 'quiz',
                      AUDIO: 'audio',
                      DOCUMENT: 'document'
                    }
                    const displayType = contentTypeMap[lesson.contentType] || 'reading'
                    const LessonIcon = getLessonIcon(displayType)

                    return (
                      <li key={lesson.id}>
                        <Link
                          href={isLocked ? '#' : `/courses/${course.id}/lessons/${lesson.id}`}
                          className={isLocked ? 'pointer-events-none' : ''}
                          aria-label={`${isCompleted ? 'Completed: ' : isLocked ? 'Locked: ' : ''}Lesson ${index + 1}: ${lesson.title}`}
                        >
                          <article className="glass-effect border-2 border-primary/20 rounded-lg p-4 flex items-center gap-3 hover:bg-white/30 transition-colors">
                            <div className="w-10 h-10 bg-gradient-to-br from-primary to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0 font-black text-white" aria-hidden="true">
                              {index + 1}
                            </div>

                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                              isCompleted
                                ? 'bg-gradient-to-br from-success to-green-600'
                                : isLocked
                                ? 'bg-gradient-to-br from-neutral-300 to-neutral-500'
                                : 'bg-gradient-to-br from-secondary to-purple-600'
                            }`} aria-hidden="true">
                              {isCompleted ? (
                                <CheckCircle className="text-white" size={16} />
                              ) : isLocked ? (
                                <Lock className="text-white" size={16} />
                              ) : (
                                <LessonIcon className="text-white" size={16} />
                              )}
                            </div>

                            <div className="flex-1">
                              <h4 className={`font-bold ${isCompleted ? 'text-neutral-600 line-through' : 'text-neutral-800'}`}>
                                {lesson.title}
                                {isCompleted && <span className="sr-only">(Completed)</span>}
                                {isLocked && <span className="sr-only">(Locked - Enroll to access)</span>}
                              </h4>
                              <p className="text-xs font-semibold text-neutral-500 uppercase">
                                {displayType} • {lesson.durationMinutes ? `${lesson.durationMinutes} min` : 'N/A'}
                                {hasQuiz && ' • Has Quiz'}
                              </p>
                              {lesson.description && (
                                <p className="text-xs text-neutral-600 mt-1">{lesson.description}</p>
                              )}
                            </div>

                            {!isLocked && !isCompleted && (
                              <div className="bg-gradient-to-r from-primary to-blue-600 text-white font-black text-sm px-4 py-2 rounded-lg" aria-hidden="true">
                                START
                              </div>
                            )}
                          </article>
                        </Link>
                      </li>
                    )
                  })}
                  </ol>
                )}
              </CardContent>
            </Card>
          </section>

          {/* Learning Objectives */}
          {course.objectives && course.objectives.length > 0 && (
            <Card className="course-detail-item opacity-0 glass-effect concrete-texture border-4 border-success/40">
              <CardHeader>
                <CardTitle className="text-xl font-black flex items-center gap-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-success to-green-600 rounded-lg flex items-center justify-center">
                    <Award className="text-white" size={20} />
                  </div>
                  LEARNING OBJECTIVES
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {course.objectives.map((objective: string, index: number) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle className="text-success flex-shrink-0 mt-1" size={20} />
                      <span className="font-medium text-neutral-700">{objective}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Reviews Section */}
          <section aria-labelledby="reviews-heading">
            <Card className="course-detail-item opacity-0 glass-effect concrete-texture border-4 border-secondary/40">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle id="reviews-heading" className="text-xl font-black flex items-center gap-2">
                    <div className="w-10 h-10 bg-gradient-to-br from-secondary to-purple-600 rounded-lg flex items-center justify-center" aria-hidden="true">
                      <MessageSquare className="text-white" size={20} />
                    </div>
                    REVIEWS ({reviews.length})
                  </CardTitle>
                {enrollment?.status === 'COMPLETED' && !showReviewForm && !reviews.some(r => r.userId === enrollment.userId) && (
                  <MagneticButton
                    onClick={() => setShowReviewForm(true)}
                    className="bg-gradient-to-r from-secondary to-purple-600 text-white font-black text-sm"
                  >
                    <Star className="mr-2" size={16} />
                    WRITE REVIEW
                  </MagneticButton>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {/* Average Rating */}
              {reviews.length > 0 && (
                <div className="mb-6 p-4 glass-effect border-2 border-secondary/20 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <div className="text-4xl font-black bg-gradient-to-r from-secondary to-purple-600 bg-clip-text text-transparent">
                        {(reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)}
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        {Array.from({ length: 5 }).map((_, i) => {
                          const avgRating = reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
                          return (
                            <Star
                              key={i}
                              size={16}
                              className={i < Math.round(avgRating) ? 'text-warning fill-warning' : 'text-neutral-300'}
                            />
                          )
                        })}
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-neutral-600">
                        Based on {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Review Form */}
              {showReviewForm && (
                <div className="mb-6 p-4 glass-effect border-2 border-secondary/40 rounded-lg">
                  <h3 className="font-black text-neutral-800 mb-3">WRITE YOUR REVIEW</h3>
                  <div className="space-y-4">
                    <fieldset>
                      <legend className="text-sm font-bold text-neutral-700 mb-2">RATING</legend>
                      <div className="flex items-center gap-2" role="radiogroup" aria-label="Select rating">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <button
                            key={i}
                            onClick={() => setReviewRating(i + 1)}
                            className="focus:outline-none focus:ring-2 focus:ring-secondary rounded"
                            aria-label={`Rate ${i + 1} out of 5 stars`}
                            aria-pressed={reviewRating === i + 1}
                          >
                            <Star
                              size={32}
                              className={i < reviewRating ? 'text-warning fill-warning' : 'text-neutral-300'}
                              aria-hidden="true"
                            />
                          </button>
                        ))}
                        <span className="ml-2 font-bold text-neutral-700" aria-live="polite">{reviewRating} / 5</span>
                      </div>
                    </fieldset>
                    <div>
                      <label htmlFor="review-comment" className="text-sm font-bold text-neutral-700 mb-2 block">COMMENT (OPTIONAL)</label>
                      <textarea
                        id="review-comment"
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        placeholder="Share your thoughts about this course..."
                        className="w-full glass-effect border-2 border-secondary/30 focus:border-secondary rounded-lg px-4 py-3 font-medium resize-none"
                        rows={4}
                        aria-describedby="comment-help"
                      />
                      <span id="comment-help" className="sr-only">Optional: Add additional comments about your experience with this course</span>
                    </div>
                    <div className="flex gap-2">
                      <MagneticButton
                        onClick={handleSubmitReview}
                        disabled={submittingReview}
                        className="bg-gradient-to-r from-success to-green-600 text-white font-black disabled:opacity-50"
                      >
                        {submittingReview ? (
                          <>
                            <Loader2 className="mr-2 animate-spin" size={16} />
                            SUBMITTING...
                          </>
                        ) : (
                          <>
                            <Star className="mr-2" size={16} />
                            SUBMIT REVIEW
                          </>
                        )}
                      </MagneticButton>
                      <MagneticButton
                        onClick={() => {
                          setShowReviewForm(false)
                          setReviewComment('')
                          setReviewRating(5)
                        }}
                        className="glass-effect border-2 border-neutral-400 text-neutral-700 font-black"
                      >
                        CANCEL
                      </MagneticButton>
                    </div>
                  </div>
                </div>
              )}

              {/* Reviews List */}
              <div className="space-y-4">
                {reviews.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageSquare className="mx-auto h-16 w-16 text-neutral-400 mb-4" aria-hidden="true" />
                    <p className="text-neutral-600 font-semibold">No reviews yet</p>
                    <p className="text-sm text-neutral-500 mt-1">Be the first to review this course!</p>
                  </div>
                ) : (
                  <ul role="list" aria-label="Course reviews">
                    {reviews.map((review) => (
                      <li key={review.id}>
                        <article className="glass-effect border-2 border-secondary/20 rounded-lg p-4 mb-4">
                          <div className="flex items-start gap-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-secondary to-purple-600 rounded-full flex items-center justify-center text-white font-black flex-shrink-0" aria-hidden="true">
                              {review.user.firstName?.[0]}{review.user.lastName?.[0]}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-start justify-between">
                                <div>
                                  <h4 className="font-black text-neutral-800">
                                    {review.user.firstName} {review.user.lastName}
                                  </h4>
                                  <div className="flex items-center gap-2 mt-1">
                                    <div className="flex items-center gap-1" aria-label={`Rated ${review.rating} out of 5 stars`}>
                                      {Array.from({ length: 5 }).map((_, i) => (
                                        <Star
                                          key={i}
                                          size={14}
                                          className={i < review.rating ? 'text-warning fill-warning' : 'text-neutral-300'}
                                          aria-hidden="true"
                                        />
                                      ))}
                                    </div>
                                    <time className="text-xs font-semibold text-neutral-500" dateTime={review.createdAt}>
                                      {new Date(review.createdAt).toLocaleDateString()}
                                    </time>
                                  </div>
                                </div>
                              </div>
                              {review.comment && (
                                <p className="text-sm text-neutral-700 mt-2">{review.comment}</p>
                              )}
                            </div>
                          </div>
                        </article>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </CardContent>
          </Card>
          </section>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Instructor */}
          {course.instructor && (
            <Card className="course-detail-item opacity-0 glass-effect concrete-texture border-4 border-secondary/40">
              <CardHeader>
                <CardTitle className="text-lg font-black">INSTRUCTOR</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-secondary to-purple-600 rounded-full flex items-center justify-center text-white font-black text-xl">
                    {course.instructor.firstName?.[0]}{course.instructor.lastName?.[0]}
                  </div>
                  <div>
                    <h3 className="font-black text-neutral-800">
                      {course.instructor.firstName} {course.instructor.lastName}
                    </h3>
                    <p className="text-sm font-semibold text-neutral-600">{course.instructor.email}</p>
                    {course.instructor.bio && (
                      <p className="text-xs text-neutral-600 mt-1">{course.instructor.bio}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Course Info */}
          <Card className="course-detail-item opacity-0 glass-effect concrete-texture border-4 border-warning/40">
            <CardHeader>
              <CardTitle className="text-lg font-black">COURSE INFO</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <p className="text-xs font-bold text-neutral-600 uppercase mb-1">Status</p>
                  <p className="text-sm font-semibold text-neutral-800">{course.status || 'Active'}</p>
                </div>
                {course.durationMinutes && (
                  <div>
                    <p className="text-xs font-bold text-neutral-600 uppercase mb-1">Duration</p>
                    <p className="text-sm font-semibold text-neutral-800">
                      {course.durationMinutes >= 60
                        ? `${Math.floor(course.durationMinutes / 60)} hours ${course.durationMinutes % 60 > 0 ? `${course.durationMinutes % 60} min` : ''}`
                        : `${course.durationMinutes} min`
                      }
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-xs font-bold text-neutral-600 uppercase mb-1">Difficulty Level</p>
                  <p className="text-sm font-semibold text-neutral-800">{course.difficultyLevel || 'Beginner'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
