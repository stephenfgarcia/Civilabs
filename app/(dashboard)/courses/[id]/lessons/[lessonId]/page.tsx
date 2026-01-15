'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MagneticButton } from '@/components/ui/magnetic-button'
import { LoadingState, ErrorState } from '@/components/ui/page-states'
import { useEntranceAnimation, useToast } from '@/lib/hooks'
import {
  BookOpen,
  CheckCircle,
  ArrowLeft,
  ArrowRight,
  Clock,
  Loader2,
  Award,
  PlayCircle,
  FileText,
  type LucideIcon,
} from 'lucide-react'
import Link from 'next/link'
import DOMPurify from 'dompurify'

// Type definitions
interface LessonQuiz {
  title: string
  description: string
  timeLimitMinutes: number | null
  passingScore: number
  _count?: {
    questions: number
  }
}

interface LessonData {
  id: string
  title: string
  description: string | null
  contentType: 'VIDEO' | 'TEXT' | 'QUIZ' | 'AUDIO' | 'DOCUMENT'
  contentUrl: string | null
  contentData: {
    html?: string
  } | null
  durationMinutes: number | null
  quiz: LessonQuiz | null
}

interface LessonNavigation {
  current: number
  total: number
  previous: { id: string; title: string } | null
  next: { id: string; title: string } | null
}

interface LessonResponse {
  lesson: LessonData
  isCompleted: boolean
  navigation: LessonNavigation
  progress: number
}

export default function LessonViewerPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const courseId = params.id as string
  const lessonId = params.lessonId as string

  const [lesson, setLesson] = useState<LessonResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [completing, setCompleting] = useState(false)

  // Use entrance animation hook
  useEntranceAnimation({ selector: '.lesson-item', staggerDelay: 0.1 }, [lesson, loading])

  useEffect(() => {
    fetchLesson()
  }, [lessonId])

  const fetchLesson = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/courses/${courseId}/lessons/${lessonId}`)
      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to load lesson')
      }

      setLesson(data.data)
    } catch (err) {
      console.error('Error fetching lesson:', err)
      setError(err instanceof Error ? err.message : 'Failed to load lesson')
    } finally {
      setLoading(false)
    }
  }

  const handleCompleteLesson = async () => {
    if (!lesson) return

    try {
      setCompleting(true)

      const response = await fetch(`/api/courses/${courseId}/lessons/${lessonId}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          timeSpentSeconds: lesson.lesson.durationMinutes ? lesson.lesson.durationMinutes * 60 : 0,
        }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to complete lesson')
      }

      // Show success notification
      toast({
        title: 'Lesson Completed!',
        description: 'Great job! Your progress has been saved.',
      })

      // Refresh lesson data to update completion status
      await fetchLesson()

      // If there's a next lesson, navigate to it
      if (lesson.navigation.next) {
        router.push(`/courses/${courseId}/lessons/${lesson.navigation.next.id}`)
      }
    } catch (err) {
      console.error('Error completing lesson:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to complete lesson'
      setError(errorMessage)

      // Show error toast notification
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      })
    } finally {
      setCompleting(false)
    }
  }

  // Loading state
  if (loading) {
    return <LoadingState message="Loading lesson..." size="lg" />
  }

  // Error state
  if (error || !lesson) {
    return (
      <div className="space-y-4">
        <ErrorState
          title="Error Loading Lesson"
          message={error || 'Lesson not found'}
          onRetry={fetchLesson}
        />
        <div className="text-center">
          <Link href={`/courses/${courseId}`} aria-label="Back to course">
            <MagneticButton className="bg-gradient-to-r from-primary to-blue-600 text-white font-black">
              BACK TO COURSE
            </MagneticButton>
          </Link>
        </div>
      </div>
    )
  }

  const { lesson: lessonData, isCompleted, navigation } = lesson
  const contentTypeMap: Record<string, { icon: LucideIcon; label: string }> = {
    VIDEO: { icon: PlayCircle, label: 'Video Lesson' },
    TEXT: { icon: FileText, label: 'Reading Material' },
    QUIZ: { icon: Award, label: 'Quiz' },
    AUDIO: { icon: PlayCircle, label: 'Audio Lesson' },
    DOCUMENT: { icon: FileText, label: 'Document' },
  }

  const contentInfo = contentTypeMap[lessonData.contentType] || contentTypeMap.TEXT
  const ContentIcon = contentInfo.icon

  return (
    <div className="space-y-6" role="main" aria-label={`Lesson: ${lessonData.title}`}>
      {/* Back Button & Navigation */}
      <nav className="lesson-item opacity-0 flex items-center justify-between" aria-label="Lesson navigation">
        <button
          onClick={() => router.push(`/courses/${courseId}`)}
          className="flex items-center gap-2 text-neutral-700 hover:text-primary font-bold transition-colors"
          aria-label="Back to course"
        >
          <ArrowLeft size={20} aria-hidden="true" />
          BACK TO COURSE
        </button>

        <div className="flex items-center gap-2 text-sm font-bold text-neutral-600" aria-live="polite">
          <BookOpen size={16} aria-hidden="true" />
          <span>Lesson {navigation.current} of {navigation.total}</span>
        </div>
      </nav>

      {/* Lesson Header */}
      <header className="lesson-item opacity-0 glass-effect concrete-texture rounded-xl p-6 md:p-8 relative overflow-hidden border-4 border-primary/40">
        <div className="absolute inset-0 bg-gradient-to-r from-primary to-blue-600 opacity-10" aria-hidden="true"></div>
        <div className="absolute inset-0 blueprint-grid opacity-20" aria-hidden="true"></div>

        <div className="relative z-10">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0" aria-hidden="true">
              <ContentIcon className="text-white" size={32} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2 flex-wrap" role="group" aria-label="Lesson metadata">
                <span className="px-3 py-1 rounded-full text-xs font-black bg-gradient-to-r from-primary to-blue-600 text-white">
                  {contentInfo.label}
                </span>
                {isCompleted && (
                  <span className="px-3 py-1 rounded-full text-xs font-black bg-gradient-to-r from-success to-green-600 text-white flex items-center gap-1" aria-label="Lesson completed">
                    <CheckCircle size={14} aria-hidden="true" />
                    COMPLETED
                  </span>
                )}
                {lessonData.durationMinutes && (
                  <span className="px-3 py-1 rounded-full text-xs font-black bg-gradient-to-r from-neutral-600 to-neutral-800 text-white flex items-center gap-1" aria-label={`Duration: ${lessonData.durationMinutes} minutes`}>
                    <Clock size={14} aria-hidden="true" />
                    {lessonData.durationMinutes} min
                  </span>
                )}
              </div>
              <h1 className="text-3xl md:text-4xl font-black text-neutral-800 mb-2">
                {lessonData.title}
              </h1>
              {lessonData.description && (
                <p className="text-lg text-neutral-700 font-medium">{lessonData.description}</p>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Lesson Content */}
      <section className="lesson-item opacity-0" aria-labelledby="lesson-content-heading">
        <h2 id="lesson-content-heading" className="sr-only">Lesson Content</h2>
        <Card className="glass-effect concrete-texture border-4 border-primary/40">
          <CardContent className="p-6 md:p-8">
            {lessonData.contentType === 'VIDEO' && lessonData.contentUrl && (
              <div className="aspect-video bg-neutral-900 rounded-lg mb-6">
                <video
                  controls
                  className="w-full h-full rounded-lg"
                  src={lessonData.contentUrl}
                  aria-label={`Video: ${lessonData.title}`}
                >
                  Your browser does not support the video tag.
                </video>
              </div>
            )}

            {lessonData.contentType === 'AUDIO' && lessonData.contentUrl && (
              <div className="bg-gradient-to-r from-primary/10 to-blue-600/10 rounded-lg p-6 mb-6">
                <audio controls className="w-full" aria-label={`Audio: ${lessonData.title}`}>
                  <source src={lessonData.contentUrl} />
                  Your browser does not support the audio element.
                </audio>
              </div>
            )}

            {lessonData.contentData?.html && (
              <article
                className="prose prose-lg max-w-none"
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(lessonData.contentData.html) }}
              />
            )}

            {lessonData.contentType === 'TEXT' && lessonData.contentUrl && (
              <div className="text-center py-8">
                <FileText className="mx-auto h-16 w-16 text-primary mb-4" aria-hidden="true" />
                <p className="text-neutral-700 font-semibold mb-4">Download lesson materials</p>
                <a
                  href={lessonData.contentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block"
                  aria-label="Download lesson materials (opens in new tab)"
                >
                  <MagneticButton className="bg-gradient-to-r from-primary to-blue-600 text-white font-black">
                    DOWNLOAD MATERIALS
                  </MagneticButton>
                </a>
              </div>
            )}

            {!lessonData.contentData?.html && !lessonData.contentUrl && (
              <div className="text-center py-12" role="status">
                <BookOpen className="mx-auto h-16 w-16 text-neutral-400 mb-4" aria-hidden="true" />
                <p className="text-neutral-600 font-semibold">No content available for this lesson</p>
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      {/* Quiz Section */}
      {lessonData.quiz && (
        <section className="lesson-item opacity-0" aria-labelledby="quiz-heading">
          <Card className="glass-effect concrete-texture border-4 border-warning/40">
            <CardHeader>
              <CardTitle id="quiz-heading" className="text-2xl font-black flex items-center gap-2">
                <div className="w-10 h-10 bg-gradient-to-br from-warning to-orange-600 rounded-lg flex items-center justify-center" aria-hidden="true">
                  <Award className="text-white" size={20} />
                </div>
                {lessonData.quiz.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-neutral-700 mb-4">{lessonData.quiz.description}</p>
              <dl className="flex items-center gap-4 text-sm font-bold text-neutral-600 mb-4">
                <div>
                  <dt className="sr-only">Number of questions</dt>
                  <dd>{lessonData.quiz._count?.questions || 0} questions</dd>
                </div>
                {lessonData.quiz.timeLimitMinutes && (
                  <div>
                    <dt className="sr-only">Time limit</dt>
                    <dd>• {lessonData.quiz.timeLimitMinutes} minutes</dd>
                  </div>
                )}
                <div>
                  <dt className="sr-only">Passing score</dt>
                  <dd>• Passing score: {lessonData.quiz.passingScore}%</dd>
                </div>
              </dl>
              <Link href={`/courses/${courseId}/lessons/${lessonId}/quiz`} aria-label={`Start quiz: ${lessonData.quiz.title}`}>
                <MagneticButton className="bg-gradient-to-r from-warning to-orange-600 text-white font-black">
                  START QUIZ
                </MagneticButton>
              </Link>
            </CardContent>
          </Card>
        </section>
      )}

      {/* Navigation & Completion */}
      <nav className="lesson-item opacity-0 flex items-center justify-between gap-4 flex-wrap" aria-label="Lesson navigation controls">
        {navigation.previous ? (
          <Link href={`/courses/${courseId}/lessons/${navigation.previous.id}`} aria-label={`Previous lesson: ${navigation.previous.title}`}>
            <MagneticButton className="glass-effect border-2 border-primary/40 text-neutral-700 font-black">
              <ArrowLeft className="mr-2" size={20} aria-hidden="true" />
              PREVIOUS LESSON
            </MagneticButton>
          </Link>
        ) : (
          <div aria-hidden="true"></div>
        )}

        <div className="flex items-center gap-4" role="group" aria-label="Lesson actions">
          {!isCompleted && (
            <MagneticButton
              onClick={handleCompleteLesson}
              disabled={completing}
              className="bg-gradient-to-r from-success to-green-600 text-white font-black disabled:opacity-50"
              aria-busy={completing}
              aria-label={completing ? 'Marking lesson as complete...' : 'Mark this lesson as complete'}
            >
              {completing ? (
                <>
                  <Loader2 className="mr-2 animate-spin" size={20} aria-hidden="true" />
                  COMPLETING...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2" size={20} aria-hidden="true" />
                  MARK AS COMPLETE
                </>
              )}
            </MagneticButton>
          )}

          {navigation.next ? (
            <Link href={`/courses/${courseId}/lessons/${navigation.next.id}`} aria-label={`Next lesson: ${navigation.next.title}`}>
              <MagneticButton className="bg-gradient-to-r from-primary to-blue-600 text-white font-black">
                NEXT LESSON
                <ArrowRight className="ml-2" size={20} aria-hidden="true" />
              </MagneticButton>
            </Link>
          ) : (
            <Link href={`/courses/${courseId}`} aria-label="Course completed, return to course overview">
              <MagneticButton className="bg-gradient-to-r from-primary to-blue-600 text-white font-black">
                BACK TO COURSE
                <CheckCircle className="ml-2" size={20} aria-hidden="true" />
              </MagneticButton>
            </Link>
          )}
        </div>
      </nav>
    </div>
  )
}
