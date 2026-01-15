'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MagneticButton } from '@/components/ui/magnetic-button'
import {
  ArrowLeft,
  Award,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  TrendingUp,
  RefreshCw,
  Loader2
} from 'lucide-react'
import Link from 'next/link'
import { apiClient } from '@/lib/services'
import { useToast } from '@/lib/hooks'

interface Question {
  id: string
  questionText: string
  questionType: string
  points: number
  order: number
  options: string[]
}

interface Quiz {
  id: string
  title: string
  description: string | null
  passingScore: number
  timeLimitMinutes: number | null
  questions: Question[]
  lesson: {
    id: string
    title: string
    courseId: string
    course: {
      id: string
      title: string
    }
  }
}

interface QuizAttempt {
  id: string
  quizId: string
  userId: string
  startedAt: string
  attemptNumber: number
}

interface QuizResults {
  score: number
  passed: boolean
  correctCount: number
  totalQuestions: number
  passingScore: number
  detailedResults: Array<{
    questionId: string
    questionText: string
    selectedAnswer: string
    correctAnswer: string
    isCorrect: boolean
    explanation: string | null
  }>
}

type QuizState = 'loading' | 'not-started' | 'in-progress' | 'completed'

export default function QuizPage() {
  const { toast } = useToast()
  const params = useParams()
  const router = useRouter()
  const quizId = params.quizId as string
  const courseId = params.id as string

  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [attempt, setAttempt] = useState<QuizAttempt | null>(null)
  const [quizState, setQuizState] = useState<QuizState>('loading')
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [results, setResults] = useState<QuizResults | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // Refs to track latest state for timer callback (prevents stale closure)
  const quizRef = useRef<Quiz | null>(null)
  const attemptRef = useRef<QuizAttempt | null>(null)
  const answersRef = useRef<Record<string, string>>({})

  // LocalStorage key for persisting quiz progress
  const getStorageKey = (attemptId: string) => `quiz_progress_${quizId}_${attemptId}`

  // Keep refs in sync with state
  useEffect(() => {
    quizRef.current = quiz
  }, [quiz])

  useEffect(() => {
    attemptRef.current = attempt
  }, [attempt])

  useEffect(() => {
    answersRef.current = answers
  }, [answers])

  // Persist answers to localStorage when they change
  useEffect(() => {
    if (attempt && quizState === 'in-progress' && Object.keys(answers).length > 0) {
      try {
        const storageKey = getStorageKey(attempt.id)
        const progressData = {
          answers,
          currentQuestion,
          timeRemaining,
          savedAt: new Date().toISOString(),
        }
        localStorage.setItem(storageKey, JSON.stringify(progressData))
      } catch (err) {
        console.error('Error saving quiz progress to localStorage:', err)
      }
    }
  }, [answers, currentQuestion, timeRemaining, attempt, quizState, quizId])

  // Clear localStorage when quiz is completed
  const clearQuizProgress = useCallback((attemptId: string) => {
    try {
      const storageKey = getStorageKey(attemptId)
      localStorage.removeItem(storageKey)
    } catch (err) {
      console.error('Error clearing quiz progress from localStorage:', err)
    }
  }, [quizId])

  // Restore progress from localStorage
  const restoreProgress = useCallback((attemptId: string) => {
    try {
      const storageKey = getStorageKey(attemptId)
      const savedData = localStorage.getItem(storageKey)
      if (savedData) {
        const { answers: savedAnswers, currentQuestion: savedQuestion, timeRemaining: savedTime, savedAt } = JSON.parse(savedData)

        // Calculate elapsed time since save
        const savedTimestamp = new Date(savedAt).getTime()
        const now = new Date().getTime()
        const elapsedSeconds = Math.floor((now - savedTimestamp) / 1000)

        // Adjust remaining time
        const adjustedTime = Math.max(0, savedTime - elapsedSeconds)

        if (adjustedTime > 0) {
          setAnswers(savedAnswers || {})
          setCurrentQuestion(savedQuestion || 0)
          setTimeRemaining(adjustedTime)
          toast({
            title: 'Progress Restored',
            description: 'Your previous answers have been restored.',
          })
          return true
        } else {
          // Time expired, clear progress
          clearQuizProgress(attemptId)
          return false
        }
      }
    } catch (err) {
      console.error('Error restoring quiz progress from localStorage:', err)
    }
    return false
  }, [quizId, toast, clearQuizProgress])

  useEffect(() => {
    fetchQuiz()
  }, [quizId])

  useEffect(() => {
    if (!quiz) return

    const elements = document.querySelectorAll('.quiz-item')
    elements.forEach((el, index) => {
      const htmlEl = el as HTMLElement
      htmlEl.style.animation = `fadeInUp 0.5s ease-out forwards ${index * 0.05}s`
    })
  }, [quiz, quizState, currentQuestion])

  // Stable callback for timer auto-submit (uses refs to avoid stale closures)
  const submitQuizFromTimer = useCallback(async () => {
    const currentQuiz = quizRef.current
    const currentAttempt = attemptRef.current
    const currentAnswers = answersRef.current

    if (!currentQuiz || !currentAttempt) return

    try {
      setSubmitting(true)
      setError(null)

      const submissionAnswers = Object.entries(currentAnswers).map(([questionId, selectedAnswer]) => ({
        questionId,
        selectedAnswer
      }))

      const response = await apiClient.post(`/quizzes/${quizId}/submit`, {
        attemptId: currentAttempt.id,
        answers: submissionAnswers
      })

      if (response.status >= 200 && response.status < 300 && response.data) {
        const apiData = response.data as any
        setResults(apiData.data.results)
        setQuizState('completed')
        // Clear localStorage on successful auto-submission
        if (currentAttempt) {
          clearQuizProgress(currentAttempt.id)
        }
        toast({
          title: 'Time\'s Up!',
          description: 'Your quiz has been automatically submitted.',
        })
      } else {
        setError(response.error || 'Failed to submit quiz')
        toast({
          title: 'Error',
          description: response.error || 'Failed to submit quiz.',
          variant: 'destructive',
        })
      }
    } catch (err) {
      console.error('Error submitting quiz:', err)
      setError(err instanceof Error ? err.message : 'Failed to submit quiz')
      toast({
        title: 'Error',
        description: 'Failed to submit quiz.',
        variant: 'destructive',
      })
    } finally {
      setSubmitting(false)
    }
  }, [quizId, toast, clearQuizProgress])

  useEffect(() => {
    if (quizState === 'in-progress' && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            submitQuizFromTimer()
            return 0
          }
          return prev - 1
        })
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [quizState, timeRemaining, submitQuizFromTimer])

  const fetchQuiz = async () => {
    try {
      setError(null)
      const response = await apiClient.get(`/quizzes/${quizId}`)

      if (response.status >= 200 && response.status < 300 && response.data) {
        const apiData = response.data as any
        setQuiz(apiData.data)
        setQuizState('not-started')
      } else {
        setError(response.error || 'Failed to load quiz')
        setQuizState('not-started')
      }
    } catch (err) {
      console.error('Error fetching quiz:', err)
      setError(err instanceof Error ? err.message : 'Failed to load quiz')
      setQuizState('not-started')
    }
  }

  const handleStartQuiz = async () => {
    try {
      setError(null)

      // Start quiz attempt via API
      const response = await apiClient.post(`/quizzes/${quizId}/attempts`, {})

      if (response.status >= 200 && response.status < 300 && response.data) {
        const apiData = response.data as any
        const newAttempt = apiData.data
        setAttempt(newAttempt)
        setQuizState('in-progress')

        // Try to restore progress from localStorage
        const restored = restoreProgress(newAttempt.id)

        if (!restored) {
          // No saved progress, start fresh
          setTimeRemaining((quiz?.timeLimitMinutes || 30) * 60)
          setCurrentQuestion(0)
          setAnswers({})
          toast({
            title: 'Quiz Started',
            description: 'Good luck! Answer all questions carefully.',
          })
        }
      } else {
        setError(response.error || 'Failed to start quiz')
        toast({
          title: 'Error',
          description: response.error || 'Failed to start quiz. Please try again.',
          variant: 'destructive',
        })
      }
    } catch (err) {
      console.error('Error starting quiz:', err)
      setError(err instanceof Error ? err.message : 'Failed to start quiz')
      toast({
        title: 'Error',
        description: 'Failed to start quiz. Please try again.',
        variant: 'destructive',
      })
    }
  }

  const handleSelectAnswer = (questionId: string, optionIndex: number) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: String(optionIndex)
    }))
  }

  const handleNextQuestion = () => {
    if (quiz && currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(prev => prev + 1)
    }
  }

  const handlePreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1)
    }
  }

  const handleSubmitQuiz = async () => {
    if (!quiz || !attempt) return

    try {
      setSubmitting(true)
      setError(null)

      // Convert answers to API format
      const submissionAnswers = Object.entries(answers).map(([questionId, selectedAnswer]) => ({
        questionId,
        selectedAnswer
      }))

      const response = await apiClient.post(`/quizzes/${quizId}/submit`, {
        attemptId: attempt.id,
        answers: submissionAnswers
      })

      if (response.status >= 200 && response.status < 300 && response.data) {
        const apiData = response.data as any
        setResults(apiData.data.results)
        setQuizState('completed')
        // Clear localStorage on successful submission
        clearQuizProgress(attempt.id)
        toast({
          title: 'Quiz Submitted',
          description: 'Your quiz has been submitted successfully!',
        })
      } else {
        setError(response.error || 'Failed to submit quiz')
        toast({
          title: 'Error',
          description: response.error || 'Failed to submit quiz. Please try again.',
          variant: 'destructive',
        })
      }
    } catch (err) {
      console.error('Error submitting quiz:', err)
      setError(err instanceof Error ? err.message : 'Failed to submit quiz')
      toast({
        title: 'Error',
        description: 'Failed to submit quiz. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleRetakeQuiz = () => {
    // Clear any saved progress from previous attempt
    if (attempt) {
      clearQuizProgress(attempt.id)
    }
    setQuizState('not-started')
    setCurrentQuestion(0)
    setAnswers({})
    setResults(null)
    setAttempt(null)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Loading state
  if (quizState === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 mx-auto text-warning mb-4" />
          <p className="text-lg font-bold text-neutral-700">Loading quiz...</p>
        </div>
      </div>
    )
  }

  // Error state or no quiz
  if (error || !quiz) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="glass-effect concrete-texture border-4 border-danger/40 p-12 text-center max-w-md">
          <AlertCircle className="mx-auto mb-4 text-danger" size={48} />
          <h2 className="text-2xl font-black text-neutral-800 mb-4">QUIZ NOT FOUND</h2>
          <p className="text-neutral-600 font-semibold mb-6">
            {error || "The quiz you're looking for doesn't exist."}
          </p>
          <Link href={`/courses/${courseId}`}>
            <MagneticButton className="bg-gradient-to-r from-primary to-blue-600 text-white font-black">
              BACK TO COURSE
            </MagneticButton>
          </Link>
        </Card>
      </div>
    )
  }

  const answeredCount = Object.keys(answers).length

  // Not Started State
  if (quizState === 'not-started') {
    return (
      <div className="space-y-6">
        <div className="quiz-item opacity-0">
          <button
            onClick={() => router.push(`/courses/${courseId}`)}
            className="flex items-center gap-2 text-neutral-700 hover:text-primary font-bold transition-colors"
          >
            <ArrowLeft size={20} />
            BACK TO COURSE
          </button>
        </div>

        <div className="quiz-item opacity-0">
          <div className="glass-effect concrete-texture rounded-xl p-8 md:p-12 relative overflow-hidden border-4 border-warning/40">
            <div className="absolute top-2 left-2 w-12 h-12 border-t-4 border-l-4 border-warning/60"></div>
            <div className="absolute top-2 right-2 w-12 h-12 border-t-4 border-r-4 border-warning/60"></div>
            <div className="absolute bottom-2 left-2 w-12 h-12 border-b-4 border-l-4 border-warning/60"></div>
            <div className="absolute bottom-2 right-2 w-12 h-12 border-b-4 border-r-4 border-warning/60"></div>

            <div className="absolute inset-0 bg-gradient-to-r from-warning via-orange-500 to-yellow-500 opacity-10"></div>
            <div className="absolute inset-0 blueprint-grid opacity-20"></div>

            <div className="relative z-10 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-warning to-orange-600 rounded-xl flex items-center justify-center mx-auto mb-6">
                <Award className="text-white" size={48} />
              </div>

              <h1 className="text-4xl md:text-5xl font-black text-neutral-800 mb-4">{quiz.title}</h1>
              <p className="text-lg text-neutral-700 font-medium mb-8 max-w-2xl mx-auto">
                {quiz.description || 'Test your knowledge'}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 max-w-3xl mx-auto">
                <Card className="glass-effect border-2 border-primary/30">
                  <CardContent className="p-6 text-center">
                    <div className="text-3xl font-black bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent mb-2">
                      {quiz.questions.length}
                    </div>
                    <p className="text-sm font-bold text-neutral-600">QUESTIONS</p>
                  </CardContent>
                </Card>

                <Card className="glass-effect border-2 border-warning/30">
                  <CardContent className="p-6 text-center">
                    <div className="text-3xl font-black bg-gradient-to-r from-warning to-orange-600 bg-clip-text text-transparent mb-2">
                      {quiz.timeLimitMinutes || 30} min
                    </div>
                    <p className="text-sm font-bold text-neutral-600">TIME LIMIT</p>
                  </CardContent>
                </Card>

                <Card className="glass-effect border-2 border-success/30">
                  <CardContent className="p-6 text-center">
                    <div className="text-3xl font-black bg-gradient-to-r from-success to-green-600 bg-clip-text text-transparent mb-2">
                      {quiz.passingScore}%
                    </div>
                    <p className="text-sm font-bold text-neutral-600">TO PASS</p>
                  </CardContent>
                </Card>
              </div>

              <div className="glass-effect border-2 border-neutral-300 rounded-lg p-6 mb-8 max-w-2xl mx-auto">
                <h3 className="font-black text-neutral-800 mb-3 flex items-center justify-center gap-2">
                  <AlertCircle className="text-warning" size={20} />
                  QUIZ INSTRUCTIONS
                </h3>
                <ul className="text-left space-y-2 text-neutral-700">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="text-success flex-shrink-0 mt-1" size={16} />
                    <span>You have {quiz.timeLimitMinutes || 30} minutes to complete {quiz.questions.length} questions</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="text-success flex-shrink-0 mt-1" size={16} />
                    <span>You can navigate between questions before submitting</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="text-success flex-shrink-0 mt-1" size={16} />
                    <span>You need {quiz.passingScore}% to pass this quiz</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="text-success flex-shrink-0 mt-1" size={16} />
                    <span>The quiz will auto-submit when time runs out</span>
                  </li>
                </ul>
              </div>

              <MagneticButton
                onClick={handleStartQuiz}
                className="bg-gradient-to-r from-warning to-orange-600 text-white font-black text-lg px-8 py-4"
              >
                <Award className="mr-2" size={24} />
                START QUIZ
              </MagneticButton>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // In Progress State
  if (quizState === 'in-progress') {
    const question = quiz.questions[currentQuestion]

    return (
      <div className="space-y-6">
        {/* Timer and Progress */}
        <Card className="quiz-item opacity-0 glass-effect concrete-texture border-4 border-warning/40">
          <CardContent className="p-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Clock className="text-warning" size={24} />
                  <span className={`text-2xl font-black ${timeRemaining < 60 ? 'text-danger' : 'text-neutral-800'}`}>
                    {formatTime(timeRemaining)}
                  </span>
                </div>
                <div className="text-sm font-bold text-neutral-600">
                  Question {currentQuestion + 1} of {quiz.questions.length}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-neutral-600">
                  {answeredCount}/{quiz.questions.length} answered
                </span>
                <div className="w-32 bg-neutral-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-success to-green-600 h-2 rounded-full transition-all"
                    style={{ width: `${(answeredCount / quiz.questions.length) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Question */}
        <Card className="quiz-item opacity-0 glass-effect concrete-texture border-4 border-primary/40">
          <CardHeader>
            <CardTitle className="text-2xl font-black text-neutral-800">
              {question.questionText}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {question.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleSelectAnswer(question.id, index)}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all font-semibold ${
                    answers[question.id] === String(index)
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-neutral-300 hover:border-primary/50 text-neutral-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                      answers[question.id] === String(index)
                        ? 'border-primary bg-primary'
                        : 'border-neutral-400'
                    }`}>
                      {answers[question.id] === String(index) && (
                        <CheckCircle className="text-white" size={16} />
                      )}
                    </div>
                    <span>{option}</span>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <Card className="quiz-item opacity-0 glass-effect concrete-texture border-2 border-neutral-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between gap-4">
              <MagneticButton
                onClick={handlePreviousQuestion}
                disabled={currentQuestion === 0}
                className="bg-gradient-to-r from-neutral-600 to-neutral-800 text-white font-black disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ArrowLeft className="mr-2" size={20} />
                PREVIOUS
              </MagneticButton>

              {currentQuestion === quiz.questions.length - 1 ? (
                <MagneticButton
                  onClick={handleSubmitQuiz}
                  disabled={answeredCount < quiz.questions.length || submitting}
                  className="bg-gradient-to-r from-success to-green-600 text-white font-black disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? <Loader2 className="mr-2 animate-spin" size={20} /> : <Award className="mr-2" size={20} />}
                  {submitting ? 'SUBMITTING...' : 'SUBMIT QUIZ'}
                </MagneticButton>
              ) : (
                <MagneticButton
                  onClick={handleNextQuestion}
                  className="bg-gradient-to-r from-primary to-blue-600 text-white font-black"
                >
                  NEXT
                  <ArrowLeft className="ml-2 rotate-180" size={20} />
                </MagneticButton>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Question Navigator */}
        <Card className="quiz-item opacity-0 glass-effect concrete-texture border-2 border-secondary/30">
          <CardHeader>
            <CardTitle className="text-lg font-black">QUESTION NAVIGATOR</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {quiz.questions.map((q, index) => (
                <button
                  key={q.id}
                  onClick={() => setCurrentQuestion(index)}
                  className={`w-12 h-12 rounded-lg font-black transition-all ${
                    index === currentQuestion
                      ? 'bg-gradient-to-br from-primary to-blue-600 text-white scale-110'
                      : answers[q.id] !== undefined
                      ? 'bg-gradient-to-br from-success to-green-600 text-white'
                      : 'bg-neutral-200 text-neutral-600 hover:bg-neutral-300'
                  }`}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Completed State
  if (quizState === 'completed' && results) {
    const passed = results.passed

    return (
      <div className="space-y-6">
        <div className="quiz-item opacity-0">
          <div className={`glass-effect concrete-texture rounded-xl p-8 md:p-12 relative overflow-hidden border-4 ${
            passed ? 'border-success/40' : 'border-danger/40'
          }`}>
            <div className={`absolute top-2 left-2 w-12 h-12 border-t-4 border-l-4 ${passed ? 'border-success/60' : 'border-danger/60'}`}></div>
            <div className={`absolute top-2 right-2 w-12 h-12 border-t-4 border-r-4 ${passed ? 'border-success/60' : 'border-danger/60'}`}></div>
            <div className={`absolute bottom-2 left-2 w-12 h-12 border-b-4 border-l-4 ${passed ? 'border-success/60' : 'border-danger/60'}`}></div>
            <div className={`absolute bottom-2 right-2 w-12 h-12 border-b-4 border-r-4 ${passed ? 'border-success/60' : 'border-danger/60'}`}></div>

            <div className={`absolute inset-0 bg-gradient-to-r ${
              passed ? 'from-success via-green-500 to-green-600' : 'from-danger via-red-500 to-red-600'
            } opacity-10`}></div>
            <div className="absolute inset-0 blueprint-grid opacity-20"></div>

            <div className="relative z-10 text-center">
              <div className={`w-24 h-24 bg-gradient-to-br ${
                passed ? 'from-success to-green-600' : 'from-danger to-red-600'
              } rounded-xl flex items-center justify-center mx-auto mb-6`}>
                {passed ? (
                  <CheckCircle className="text-white" size={56} />
                ) : (
                  <XCircle className="text-white" size={56} />
                )}
              </div>

              <h1 className="text-4xl md:text-5xl font-black text-neutral-800 mb-4">
                {passed ? 'CONGRATULATIONS!' : 'QUIZ NOT PASSED'}
              </h1>
              <p className="text-lg text-neutral-700 font-medium mb-8">
                {passed
                  ? `You passed the ${quiz.title} with a score of ${results.score}%!`
                  : `You scored ${results.score}%. You need ${results.passingScore}% to pass.`}
              </p>

              <div className="max-w-md mx-auto mb-8">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-neutral-700">Your Score</span>
                  <span className={`text-3xl font-black ${passed ? 'text-success' : 'text-danger'}`}>{results.score}%</span>
                </div>
                <div className="w-full bg-neutral-200 rounded-full h-4">
                  <div
                    className={`bg-gradient-to-r ${
                      passed ? 'from-success to-green-600' : 'from-danger to-red-600'
                    } h-4 rounded-full transition-all`}
                    style={{ width: `${results.score}%` }}
                  ></div>
                </div>
                <div className="flex items-center justify-between mt-2 text-sm font-semibold text-neutral-600">
                  <span>Passing: {results.passingScore}%</span>
                  <span>{results.correctCount}/{results.totalQuestions} correct</span>
                </div>
              </div>

              <div className="flex items-center justify-center gap-4 flex-wrap">
                <Link href={`/courses/${courseId}`}>
                  <MagneticButton className="bg-gradient-to-r from-primary to-blue-600 text-white font-black">
                    <ArrowLeft className="mr-2" size={20} />
                    BACK TO COURSE
                  </MagneticButton>
                </Link>

                {!passed && (
                  <MagneticButton
                    onClick={handleRetakeQuiz}
                    className="bg-gradient-to-r from-warning to-orange-600 text-white font-black"
                  >
                    <RefreshCw className="mr-2" size={20} />
                    RETAKE QUIZ
                  </MagneticButton>
                )}

                {passed && (
                  <Link href="/certificates">
                    <MagneticButton className="bg-gradient-to-r from-success to-green-600 text-white font-black">
                      <Award className="mr-2" size={20} />
                      VIEW CERTIFICATES
                    </MagneticButton>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Review Answers */}
        <Card className="quiz-item opacity-0 glass-effect concrete-texture border-4 border-secondary/40">
          <CardHeader>
            <CardTitle className="text-2xl font-black flex items-center gap-2">
              <TrendingUp className="text-secondary" size={28} />
              REVIEW YOUR ANSWERS
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {results.detailedResults.map((result, index) => (
                <div key={result.questionId} className={`p-4 rounded-lg border-2 ${
                  result.isCorrect ? 'border-success/30 bg-success/5' : 'border-danger/30 bg-danger/5'
                }`}>
                  <div className="flex items-start gap-3 mb-3">
                    {result.isCorrect ? (
                      <CheckCircle className="text-success flex-shrink-0 mt-1" size={24} />
                    ) : (
                      <XCircle className="text-danger flex-shrink-0 mt-1" size={24} />
                    )}
                    <div className="flex-1">
                      <h4 className="font-black text-neutral-800 mb-2">
                        Question {index + 1}: {result.questionText}
                      </h4>
                      <p className="text-sm font-semibold text-neutral-700">
                        Your answer: <span className={result.isCorrect ? 'text-success' : 'text-danger'}>
                          {quiz.questions.find(q => q.id === result.questionId)?.options[parseInt(result.selectedAnswer)] || 'Not answered'}
                        </span>
                      </p>
                      {!result.isCorrect && (
                        <p className="text-sm font-semibold text-success mt-1">
                          Correct answer: {quiz.questions.find(q => q.id === result.questionId)?.options[parseInt(result.correctAnswer)]}
                        </p>
                      )}
                      {result.explanation && (
                        <p className="text-sm text-neutral-600 mt-2 italic">
                          {result.explanation}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return null
}
