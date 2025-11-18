'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MagneticButton } from '@/components/ui/magnetic-button'
import {
  Award,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  ArrowLeft,
  Loader2,
  Trophy,
} from 'lucide-react'
import Link from 'next/link'

export default function QuizPage() {
  const params = useParams()
  const router = useRouter()
  const courseId = params.id as string
  const lessonId = params.lessonId as string

  const [quizData, setQuizData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [results, setResults] = useState<any>(null)
  const [startTime, setStartTime] = useState<number>(Date.now())

  useEffect(() => {
    fetchQuiz()
  }, [lessonId])

  const fetchQuiz = async () => {
    try {
      setLoading(true)
      setError(null)

      const token = localStorage.getItem('token')
      const response = await fetch(`/api/courses/${courseId}/lessons/${lessonId}/quiz`, {
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      })
      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to load quiz')
      }

      setQuizData(data.data)
      setStartTime(Date.now())
    } catch (err) {
      console.error('Error fetching quiz:', err)
      setError(err instanceof Error ? err.message : 'Failed to load quiz')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    try {
      setSubmitting(true)
      const timeSpentSeconds = Math.floor((Date.now() - startTime) / 1000)

      const token = localStorage.getItem('token')
      const response = await fetch(`/api/courses/${courseId}/lessons/${lessonId}/quiz`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({
          answers,
          timeSpentSeconds,
        }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to submit quiz')
      }

      setResults(data.data)
    } catch (err) {
      console.error('Error submitting quiz:', err)
      setError(err instanceof Error ? err.message : 'Failed to submit quiz')
    } finally {
      setSubmitting(false)
    }
  }

  const handleRetake = () => {
    setAnswers({})
    setResults(null)
    setStartTime(Date.now())
    fetchQuiz()
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 mx-auto text-warning mb-4" />
          <p className="text-lg font-bold text-neutral-700">Loading quiz...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error || !quizData) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="glass-effect concrete-texture border-4 border-red-500/40 max-w-md">
          <CardHeader>
            <CardTitle className="text-xl font-black flex items-center gap-2 text-red-600">
              <AlertCircle />
              ERROR LOADING QUIZ
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-neutral-700 mb-4">{error || 'Quiz not found'}</p>
            <div className="flex gap-2">
              <Link href={`/courses/${courseId}/lessons/${lessonId}`}>
                <MagneticButton className="bg-gradient-to-r from-primary to-blue-600 text-white font-black">
                  BACK TO LESSON
                </MagneticButton>
              </Link>
              {error && (
                <MagneticButton
                  onClick={fetchQuiz}
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

  const { quiz, attempts, attemptsRemaining, bestScore, passed } = quizData

  // Results view
  if (results) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Link
            href={`/courses/${courseId}/lessons/${lessonId}`}
            className="flex items-center gap-2 text-neutral-700 hover:text-primary font-bold transition-colors"
          >
            <ArrowLeft size={20} />
            BACK TO LESSON
          </Link>
        </div>

        {/* Results Header */}
        <div className={`glass-effect concrete-texture rounded-xl p-6 md:p-8 relative overflow-hidden border-4 ${
          results.passed ? 'border-success/40' : 'border-red-500/40'
        }`}>
          <div className={`absolute inset-0 bg-gradient-to-r ${
            results.passed ? 'from-success to-green-600' : 'from-red-500 to-red-700'
          } opacity-10`}></div>
          <div className="absolute inset-0 blueprint-grid opacity-20"></div>

          <div className="relative z-10 text-center">
            <div className={`w-20 h-20 mx-auto mb-4 bg-gradient-to-br ${
              results.passed ? 'from-success to-green-600' : 'from-red-500 to-red-700'
            } rounded-full flex items-center justify-center`}>
              {results.passed ? (
                <Trophy className="text-white" size={40} />
              ) : (
                <XCircle className="text-white" size={40} />
              )}
            </div>

            <h1 className="text-4xl md:text-5xl font-black text-neutral-800 mb-2">
              {results.passed ? 'CONGRATULATIONS!' : 'KEEP TRYING!'}
            </h1>
            <p className="text-2xl font-bold text-neutral-700 mb-4">
              You scored {results.score}%
            </p>
            <p className="text-lg text-neutral-600">
              {results.earnedPoints} / {results.totalPoints} points
              {' • '}
              Passing score: {results.passingScore}%
            </p>

            {attemptsRemaining !== null && (
              <p className="text-sm font-bold text-neutral-600 mt-2">
                {attemptsRemaining > 0
                  ? `${attemptsRemaining} attempt${attemptsRemaining !== 1 ? 's' : ''} remaining`
                  : 'No attempts remaining'}
              </p>
            )}
          </div>
        </div>

        {/* Question Results */}
        <div className="space-y-4">
          {results.results.map((result: any, index: number) => (
            <Card
              key={result.questionId}
              className={`glass-effect concrete-texture border-4 ${
                result.isCorrect ? 'border-success/40' : 'border-red-500/40'
              }`}
            >
              <CardHeader>
                <CardTitle className="text-lg font-black flex items-center gap-2">
                  <div className={`w-10 h-10 bg-gradient-to-br ${
                    result.isCorrect ? 'from-success to-green-600' : 'from-red-500 to-red-700'
                  } rounded-lg flex items-center justify-center text-white`}>
                    {index + 1}
                  </div>
                  {result.isCorrect ? (
                    <CheckCircle className="text-success" size={24} />
                  ) : (
                    <XCircle className="text-red-600" size={24} />
                  )}
                  <span className={result.isCorrect ? 'text-success' : 'text-red-600'}>
                    {result.isCorrect ? 'CORRECT' : 'INCORRECT'}
                  </span>
                  <span className="ml-auto text-neutral-600 text-sm">
                    {result.earnedPoints} / {result.points} points
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="font-bold text-neutral-800">{result.questionText}</p>

                <div className="space-y-2">
                  <p className="text-sm font-bold text-neutral-600">Your Answer:</p>
                  <p className="text-neutral-700">{result.userAnswer || 'No answer'}</p>
                </div>

                {!result.isCorrect && (
                  <div className="space-y-2">
                    <p className="text-sm font-bold text-success">Correct Answer:</p>
                    <p className="text-neutral-700">{result.correctAnswer}</p>
                  </div>
                )}

                {result.explanation && (
                  <div className="bg-blue-50 border-2 border-primary/20 rounded-lg p-3">
                    <p className="text-sm font-bold text-primary mb-1">Explanation:</p>
                    <p className="text-sm text-neutral-700">{result.explanation}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-center gap-4">
          {attemptsRemaining !== null && attemptsRemaining > 0 && (
            <MagneticButton
              onClick={handleRetake}
              className="glass-effect border-2 border-warning/40 text-neutral-700 font-black"
            >
              RETAKE QUIZ
            </MagneticButton>
          )}
          <Link href={`/courses/${courseId}/lessons/${lessonId}`}>
            <MagneticButton className="bg-gradient-to-r from-primary to-blue-600 text-white font-black">
              BACK TO LESSON
            </MagneticButton>
          </Link>
        </div>
      </div>
    )
  }

  // Quiz taking view
  const allAnswered = quiz.questions.every((q: any) => answers[q.id])

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <div className="flex items-center justify-between">
        <Link
          href={`/courses/${courseId}/lessons/${lessonId}`}
          className="flex items-center gap-2 text-neutral-700 hover:text-primary font-bold transition-colors"
        >
          <ArrowLeft size={20} />
          BACK TO LESSON
        </Link>
      </div>

      {/* Quiz Header */}
      <div className="glass-effect concrete-texture rounded-xl p-6 md:p-8 relative overflow-hidden border-4 border-warning/40">
        <div className="absolute inset-0 bg-gradient-to-r from-warning to-orange-600 opacity-10"></div>
        <div className="absolute inset-0 blueprint-grid opacity-20"></div>

        <div className="relative z-10">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-warning to-orange-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <Award className="text-white" size={32} />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-black text-neutral-800 mb-2">
                {quiz.title}
              </h1>
              {quiz.description && (
                <p className="text-lg text-neutral-700 font-medium mb-4">{quiz.description}</p>
              )}
              <div className="flex items-center gap-6 flex-wrap text-sm font-bold text-neutral-600">
                <span>{quiz.questions.length} questions</span>
                {quiz.timeLimitMinutes && (
                  <span className="flex items-center gap-1">
                    <Clock size={16} />
                    {quiz.timeLimitMinutes} minutes
                  </span>
                )}
                <span>Passing score: {quiz.passingScore}%</span>
                {quiz.attemptsAllowed && (
                  <span>Max attempts: {quiz.attemptsAllowed}</span>
                )}
              </div>
            </div>
          </div>

          {/* Attempt Status */}
          {attempts > 0 && (
            <div className="bg-blue-50 border-2 border-primary/20 rounded-lg p-4 mt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-primary">Previous Attempts: {attempts}</p>
                  {bestScore !== null && (
                    <p className="text-sm text-neutral-700">
                      Best Score: {bestScore}% {passed && '(Passed ✓)'}
                    </p>
                  )}
                </div>
                {attemptsRemaining !== null && (
                  <p className="text-sm font-bold text-neutral-600">
                    {attemptsRemaining} attempt{attemptsRemaining !== 1 ? 's' : ''} remaining
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Questions */}
      <div className="space-y-6">
        {quiz.questions.map((question: any, index: number) => (
          <Card
            key={question.id}
            className="glass-effect concrete-texture border-4 border-primary/40"
          >
            <CardHeader>
              <CardTitle className="text-xl font-black flex items-center gap-2">
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-blue-600 rounded-lg flex items-center justify-center text-white">
                  {index + 1}
                </div>
                Question {index + 1}
                <span className="ml-auto text-neutral-600 text-sm">
                  {question.points} points
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="font-bold text-neutral-800 text-lg">{question.questionText}</p>

              {question.questionType === 'MULTIPLE_CHOICE' && (
                <div className="space-y-2">
                  {question.options.map((option: any) => (
                    <label
                      key={option.id}
                      className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                        answers[question.id] === option.id
                          ? 'border-primary bg-primary/10'
                          : 'border-neutral-300 hover:border-primary/50'
                      }`}
                    >
                      <input
                        type="radio"
                        name={question.id}
                        value={option.id}
                        checked={answers[question.id] === option.id}
                        onChange={(e) =>
                          setAnswers({ ...answers, [question.id]: e.target.value })
                        }
                        className="w-5 h-5"
                      />
                      <span className="font-medium text-neutral-700">{option.text}</span>
                    </label>
                  ))}
                </div>
              )}

              {question.questionType === 'TRUE_FALSE' && (
                <div className="space-y-2">
                  {['true', 'false'].map((value) => (
                    <label
                      key={value}
                      className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                        answers[question.id] === value
                          ? 'border-primary bg-primary/10'
                          : 'border-neutral-300 hover:border-primary/50'
                      }`}
                    >
                      <input
                        type="radio"
                        name={question.id}
                        value={value}
                        checked={answers[question.id] === value}
                        onChange={(e) =>
                          setAnswers({ ...answers, [question.id]: e.target.value })
                        }
                        className="w-5 h-5"
                      />
                      <span className="font-medium text-neutral-700 capitalize">{value}</span>
                    </label>
                  ))}
                </div>
              )}

              {question.questionType === 'SHORT_ANSWER' && (
                <input
                  type="text"
                  value={answers[question.id] || ''}
                  onChange={(e) => setAnswers({ ...answers, [question.id]: e.target.value })}
                  className="w-full p-3 border-2 border-neutral-300 rounded-lg focus:border-primary focus:outline-none font-medium"
                  placeholder="Type your answer here..."
                />
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Submit Button */}
      <div className="flex items-center justify-center">
        <MagneticButton
          onClick={handleSubmit}
          disabled={!allAnswered || submitting}
          className="bg-gradient-to-r from-success to-green-600 text-white font-black disabled:opacity-50"
        >
          {submitting ? (
            <>
              <Loader2 className="mr-2 animate-spin" size={20} />
              SUBMITTING...
            </>
          ) : (
            <>
              <CheckCircle className="mr-2" size={20} />
              SUBMIT QUIZ
            </>
          )}
        </MagneticButton>
      </div>

      {!allAnswered && (
        <p className="text-center text-sm font-bold text-neutral-600">
          Please answer all questions before submitting
        </p>
      )}
    </div>
  )
}
