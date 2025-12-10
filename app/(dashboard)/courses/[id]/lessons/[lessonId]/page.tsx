'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MagneticButton } from '@/components/ui/magnetic-button'
import {
  BookOpen,
  CheckCircle,
  ArrowLeft,
  ArrowRight,
  Clock,
  Loader2,
  AlertCircle,
  Award,
  PlayCircle,
  FileText,
} from 'lucide-react'
import Link from 'next/link'
import DOMPurify from 'dompurify'

export default function LessonViewerPage() {
  const params = useParams()
  const router = useRouter()
  const courseId = params.id as string
  const lessonId = params.lessonId as string

  const [lesson, setLesson] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [completing, setCompleting] = useState(false)

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

      // Refresh lesson data to update completion status
      await fetchLesson()

      // If there's a next lesson, navigate to it
      if (lesson.navigation.next) {
        router.push(`/courses/${courseId}/lessons/${lesson.navigation.next.id}`)
      }
    } catch (err) {
      console.error('Error completing lesson:', err)
      setError(err instanceof Error ? err.message : 'Failed to complete lesson')
    } finally {
      setCompleting(false)
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 mx-auto text-warning mb-4" />
          <p className="text-lg font-bold text-neutral-700">Loading lesson...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error || !lesson) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="glass-effect concrete-texture border-4 border-red-500/40 max-w-md">
          <CardHeader>
            <CardTitle className="text-xl font-black flex items-center gap-2 text-red-600">
              <AlertCircle />
              ERROR LOADING LESSON
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-neutral-700 mb-4">{error || 'Lesson not found'}</p>
            <div className="flex gap-2">
              <Link href={`/courses/${courseId}`}>
                <MagneticButton className="bg-gradient-to-r from-primary to-blue-600 text-white font-black">
                  BACK TO COURSE
                </MagneticButton>
              </Link>
              {error && (
                <MagneticButton
                  onClick={fetchLesson}
                  className="glass-effect border-2 border-primary/40 text-neutral-700 font-black"
                >
                  Try Again
                </MagneticButton>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const { lesson: lessonData, isCompleted, navigation, progress } = lesson
  const contentTypeMap: Record<string, { icon: any; label: string }> = {
    VIDEO: { icon: PlayCircle, label: 'Video Lesson' },
    TEXT: { icon: FileText, label: 'Reading Material' },
    QUIZ: { icon: Award, label: 'Quiz' },
    AUDIO: { icon: PlayCircle, label: 'Audio Lesson' },
    DOCUMENT: { icon: FileText, label: 'Document' },
  }

  const contentInfo = contentTypeMap[lessonData.contentType] || contentTypeMap.TEXT
  const ContentIcon = contentInfo.icon

  return (
    <div className="space-y-6">
      {/* Back Button & Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.push(`/courses/${courseId}`)}
          className="flex items-center gap-2 text-neutral-700 hover:text-primary font-bold transition-colors"
        >
          <ArrowLeft size={20} />
          BACK TO COURSE
        </button>

        <div className="flex items-center gap-2 text-sm font-bold text-neutral-600">
          <BookOpen size={16} />
          Lesson {navigation.current} of {navigation.total}
        </div>
      </div>

      {/* Lesson Header */}
      <div className="glass-effect concrete-texture rounded-xl p-6 md:p-8 relative overflow-hidden border-4 border-primary/40">
        <div className="absolute inset-0 bg-gradient-to-r from-primary to-blue-600 opacity-10"></div>
        <div className="absolute inset-0 blueprint-grid opacity-20"></div>

        <div className="relative z-10">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <ContentIcon className="text-white" size={32} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <span className="px-3 py-1 rounded-full text-xs font-black bg-gradient-to-r from-primary to-blue-600 text-white">
                  {contentInfo.label}
                </span>
                {isCompleted && (
                  <span className="px-3 py-1 rounded-full text-xs font-black bg-gradient-to-r from-success to-green-600 text-white flex items-center gap-1">
                    <CheckCircle size={14} />
                    COMPLETED
                  </span>
                )}
                {lessonData.durationMinutes && (
                  <span className="px-3 py-1 rounded-full text-xs font-black bg-gradient-to-r from-neutral-600 to-neutral-800 text-white flex items-center gap-1">
                    <Clock size={14} />
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
      </div>

      {/* Lesson Content */}
      <Card className="glass-effect concrete-texture border-4 border-primary/40">
        <CardContent className="p-6 md:p-8">
          {lessonData.contentType === 'VIDEO' && lessonData.contentUrl && (
            <div className="aspect-video bg-neutral-900 rounded-lg mb-6">
              <video
                controls
                className="w-full h-full rounded-lg"
                src={lessonData.contentUrl}
              >
                Your browser does not support the video tag.
              </video>
            </div>
          )}

          {lessonData.contentType === 'AUDIO' && lessonData.contentUrl && (
            <div className="bg-gradient-to-r from-primary/10 to-blue-600/10 rounded-lg p-6 mb-6">
              <audio controls className="w-full">
                <source src={lessonData.contentUrl} />
                Your browser does not support the audio element.
              </audio>
            </div>
          )}

          {lessonData.contentData?.html && (
            <div
              className="prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(lessonData.contentData.html) }}
            />
          )}

          {lessonData.contentType === 'TEXT' && lessonData.contentUrl && (
            <div className="text-center py-8">
              <FileText className="mx-auto h-16 w-16 text-primary mb-4" />
              <p className="text-neutral-700 font-semibold mb-4">Download lesson materials</p>
              <a
                href={lessonData.contentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block"
              >
                <MagneticButton className="bg-gradient-to-r from-primary to-blue-600 text-white font-black">
                  DOWNLOAD MATERIALS
                </MagneticButton>
              </a>
            </div>
          )}

          {!lessonData.contentData?.html && !lessonData.contentUrl && (
            <div className="text-center py-12">
              <BookOpen className="mx-auto h-16 w-16 text-neutral-400 mb-4" />
              <p className="text-neutral-600 font-semibold">No content available for this lesson</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quiz Section */}
      {lessonData.quiz && (
        <Card className="glass-effect concrete-texture border-4 border-warning/40">
          <CardHeader>
            <CardTitle className="text-2xl font-black flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-warning to-orange-600 rounded-lg flex items-center justify-center">
                <Award className="text-white" size={20} />
              </div>
              {lessonData.quiz.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-neutral-700 mb-4">{lessonData.quiz.description}</p>
            <div className="flex items-center gap-4 text-sm font-bold text-neutral-600 mb-4">
              <span>{lessonData.quiz._count?.questions || 0} questions</span>
              {lessonData.quiz.timeLimitMinutes && (
                <span>• {lessonData.quiz.timeLimitMinutes} minutes</span>
              )}
              <span>• Passing score: {lessonData.quiz.passingScore}%</span>
            </div>
            <Link href={`/courses/${courseId}/lessons/${lessonId}/quiz`}>
              <MagneticButton className="bg-gradient-to-r from-warning to-orange-600 text-white font-black">
                START QUIZ
              </MagneticButton>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Navigation & Completion */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        {navigation.previous ? (
          <Link href={`/courses/${courseId}/lessons/${navigation.previous.id}`}>
            <MagneticButton className="glass-effect border-2 border-primary/40 text-neutral-700 font-black">
              <ArrowLeft className="mr-2" size={20} />
              PREVIOUS LESSON
            </MagneticButton>
          </Link>
        ) : (
          <div></div>
        )}

        <div className="flex items-center gap-4">
          {!isCompleted && (
            <MagneticButton
              onClick={handleCompleteLesson}
              disabled={completing}
              className="bg-gradient-to-r from-success to-green-600 text-white font-black disabled:opacity-50"
            >
              {completing ? (
                <>
                  <Loader2 className="mr-2 animate-spin" size={20} />
                  COMPLETING...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2" size={20} />
                  MARK AS COMPLETE
                </>
              )}
            </MagneticButton>
          )}

          {navigation.next ? (
            <Link href={`/courses/${courseId}/lessons/${navigation.next.id}`}>
              <MagneticButton className="bg-gradient-to-r from-primary to-blue-600 text-white font-black">
                NEXT LESSON
                <ArrowRight className="ml-2" size={20} />
              </MagneticButton>
            </Link>
          ) : (
            <Link href={`/courses/${courseId}`}>
              <MagneticButton className="bg-gradient-to-r from-primary to-blue-600 text-white font-black">
                BACK TO COURSE
                <CheckCircle className="ml-2" size={20} />
              </MagneticButton>
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
