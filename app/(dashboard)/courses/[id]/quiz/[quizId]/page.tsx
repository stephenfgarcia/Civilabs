'use client'

import { useEffect, useState } from 'react'
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
  RefreshCw
} from 'lucide-react'
import Link from 'next/link'

// Mock quiz data
const MOCK_QUIZZES = {
  1: {
    id: 1,
    courseId: 1,
    courseTitle: 'Construction Safety Fundamentals',
    moduleTitle: 'Introduction to Construction Safety',
    title: 'Module 1 Quiz',
    description: 'Test your knowledge of introduction to construction safety concepts',
    passingScore: 80,
    timeLimit: 5,
    questions: [
      {
        id: 1,
        question: 'What does OSHA stand for?',
        type: 'multiple-choice',
        options: [
          'Occupational Safety and Health Administration',
          'Office of Safety and Hazard Analysis',
          'Operational Safety and Health Association',
          'Organization for Safety and Health Awareness'
        ],
        correctAnswer: 0
      },
      {
        id: 2,
        question: 'Which of the following is NOT a component of a strong safety culture?',
        type: 'multiple-choice',
        options: [
          'Leadership commitment',
          'Worker involvement',
          'Minimizing incident reporting',
          'Open communication'
        ],
        correctAnswer: 2
      },
      {
        id: 3,
        question: 'Personal Protective Equipment (PPE) is required on all construction sites.',
        type: 'true-false',
        options: ['True', 'False'],
        correctAnswer: 0
      },
      {
        id: 4,
        question: 'What is the first step in building a safety-first mindset?',
        type: 'multiple-choice',
        options: [
          'Purchasing new equipment',
          'Starting each day with a safety briefing',
          'Hiring more safety personnel',
          'Creating more paperwork'
        ],
        correctAnswer: 1
      },
      {
        id: 5,
        question: 'Workers have the right to stop unsafe work without fear of retaliation.',
        type: 'true-false',
        options: ['True', 'False'],
        correctAnswer: 0
      }
    ]
  }
}

type QuizState = 'not-started' | 'in-progress' | 'completed'

export default function QuizPage() {
  const params = useParams()
  const router = useRouter()
  const quizId = parseInt(params.quizId as string)
  const courseId = parseInt(params.id as string)

  const [quiz, setQuiz] = useState(MOCK_QUIZZES[quizId as keyof typeof MOCK_QUIZZES])
  const [quizState, setQuizState] = useState<QuizState>('not-started')
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<(number | null)[]>([])
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [score, setScore] = useState(0)
  const [showResults, setShowResults] = useState(false)

  useEffect(() => {
    if (quiz && quizState === 'not-started') {
      setAnswers(new Array(quiz.questions.length).fill(null))
    }
  }, [quiz, quizState])

  useEffect(() => {
    if (quizState === 'in-progress' && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleSubmitQuiz()
            return 0
          }
          return prev - 1
        })
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [quizState, timeRemaining])

  useEffect(() => {
    if (!quiz) return

    const elements = document.querySelectorAll('.quiz-item')
    elements.forEach((el, index) => {
      const htmlEl = el as HTMLElement
      htmlEl.style.animation = `fadeInUp 0.5s ease-out forwards ${index * 0.05}s`
    })
  }, [quiz, quizState, currentQuestion])

  if (!quiz) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="glass-effect concrete-texture border-4 border-danger/40 p-12 text-center">
          <h2 className="text-2xl font-black text-neutral-800 mb-4">QUIZ NOT FOUND</h2>
          <p className="text-neutral-600 font-semibold mb-6">The quiz you're looking for doesn't exist.</p>
          <Link href={`/courses/${courseId}`}>
            <MagneticButton className="bg-gradient-to-r from-primary to-blue-600 text-white font-black">
              BACK TO COURSE
            </MagneticButton>
          </Link>
        </Card>
      </div>
    )
  }

  const handleStartQuiz = () => {
    setQuizState('in-progress')
    setTimeRemaining(quiz.timeLimit * 60)
    setCurrentQuestion(0)
    setAnswers(new Array(quiz.questions.length).fill(null))
  }

  const handleSelectAnswer = (answerIndex: number) => {
    const newAnswers = [...answers]
    newAnswers[currentQuestion] = answerIndex
    setAnswers(newAnswers)
  }

  const handleNextQuestion = () => {
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(prev => prev + 1)
    }
  }

  const handlePreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1)
    }
  }

  const handleSubmitQuiz = () => {
    let correctCount = 0
    quiz.questions.forEach((question, index) => {
      if (answers[index] === question.correctAnswer) {
        correctCount++
      }
    })
    const finalScore = Math.round((correctCount / quiz.questions.length) * 100)
    setScore(finalScore)
    setQuizState('completed')
    setShowResults(true)
  }

  const handleRetakeQuiz = () => {
    setQuizState('not-started')
    setCurrentQuestion(0)
    setAnswers(new Array(quiz.questions.length).fill(null))
    setScore(0)
    setShowResults(false)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const answeredCount = answers.filter(a => a !== null).length

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
              <p className="text-lg text-neutral-700 font-medium mb-8 max-w-2xl mx-auto">{quiz.description}</p>

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
                      {quiz.timeLimit} min
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
                    <span>You have {quiz.timeLimit} minutes to complete {quiz.questions.length} questions</span>
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
  if (quizState === 'in-progress' && !showResults) {
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
              {question.question}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {question.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleSelectAnswer(index)}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all font-semibold ${
                    answers[currentQuestion] === index
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-neutral-300 hover:border-primary/50 text-neutral-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                      answers[currentQuestion] === index
                        ? 'border-primary bg-primary'
                        : 'border-neutral-400'
                    }`}>
                      {answers[currentQuestion] === index && (
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
                  disabled={answeredCount < quiz.questions.length}
                  className="bg-gradient-to-r from-success to-green-600 text-white font-black disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Award className="mr-2" size={20} />
                  SUBMIT QUIZ
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
              {quiz.questions.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentQuestion(index)}
                  className={`w-12 h-12 rounded-lg font-black transition-all ${
                    index === currentQuestion
                      ? 'bg-gradient-to-br from-primary to-blue-600 text-white scale-110'
                      : answers[index] !== null
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
  if (quizState === 'completed' && showResults) {
    const passed = score >= quiz.passingScore

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
                  ? `You passed the ${quiz.title} with a score of ${score}%!`
                  : `You scored ${score}%. You need ${quiz.passingScore}% to pass.`}
              </p>

              <div className="max-w-md mx-auto mb-8">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-neutral-700">Your Score</span>
                  <span className={`text-3xl font-black ${passed ? 'text-success' : 'text-danger'}`}>{score}%</span>
                </div>
                <div className="w-full bg-neutral-200 rounded-full h-4">
                  <div
                    className={`bg-gradient-to-r ${
                      passed ? 'from-success to-green-600' : 'from-danger to-red-600'
                    } h-4 rounded-full transition-all`}
                    style={{ width: `${score}%` }}
                  ></div>
                </div>
                <div className="flex items-center justify-between mt-2 text-sm font-semibold text-neutral-600">
                  <span>Passing: {quiz.passingScore}%</span>
                  <span>{answers.filter((a, i) => a === quiz.questions[i].correctAnswer).length}/{quiz.questions.length} correct</span>
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
                      VIEW CERTIFICATE
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
              {quiz.questions.map((question, qIndex) => {
                const isCorrect = answers[qIndex] === question.correctAnswer
                return (
                  <div key={qIndex} className={`p-4 rounded-lg border-2 ${
                    isCorrect ? 'border-success/30 bg-success/5' : 'border-danger/30 bg-danger/5'
                  }`}>
                    <div className="flex items-start gap-3 mb-3">
                      {isCorrect ? (
                        <CheckCircle className="text-success flex-shrink-0 mt-1" size={24} />
                      ) : (
                        <XCircle className="text-danger flex-shrink-0 mt-1" size={24} />
                      )}
                      <div className="flex-1">
                        <h4 className="font-black text-neutral-800 mb-2">
                          Question {qIndex + 1}: {question.question}
                        </h4>
                        <p className="text-sm font-semibold text-neutral-700">
                          Your answer: <span className={isCorrect ? 'text-success' : 'text-danger'}>
                            {question.options[answers[qIndex] ?? 0]}
                          </span>
                        </p>
                        {!isCorrect && (
                          <p className="text-sm font-semibold text-success mt-1">
                            Correct answer: {question.options[question.correctAnswer]}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return null
}
