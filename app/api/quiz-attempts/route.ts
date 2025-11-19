/**
 * Quiz Attempts API Routes
 * POST /api/quiz-attempts - Start/submit quiz attempt
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/utils/prisma'
import { withAuth } from '@/lib/auth/api-auth'
import NotificationTriggers from '@/lib/utils/notification-triggers'

/**
 * Grade quiz attempt
 */
function gradeQuizAttempt(questions: any[], userAnswers: Record<string, string>): {
  score: number
  totalPoints: number
  percentage: number
  passed: boolean
  passingScore: number
} {
  let earnedPoints = 0
  const totalPoints = questions.reduce((sum, q) => sum + (q.points || 1), 0)

  questions.forEach((question) => {
    const userAnswer = userAnswers[question.id]
    const correctAnswer = question.correctAnswer

    if (!userAnswer || !correctAnswer) return

    let isCorrect = false
    
    switch (question.questionType) {
      case 'MULTIPLE_CHOICE':
      case 'TRUE_FALSE':
        isCorrect = userAnswer === correctAnswer
        break
      case 'SHORT_ANSWER':
        isCorrect = userAnswer.toLowerCase().trim() === correctAnswer.toLowerCase().trim()
        break
      case 'FILL_BLANK':
        isCorrect = userAnswer.toLowerCase().trim() === correctAnswer.toLowerCase().trim()
        break
      case 'MATCHING':
        try {
          const userObj = JSON.parse(userAnswer)
          const correctObj = JSON.parse(correctAnswer)
          isCorrect = JSON.stringify(userObj) === JSON.stringify(correctObj)
        } catch {
          isCorrect = false
        }
        break
      case 'ESSAY':
        // Essays require manual grading
        isCorrect = false
        break
    }

    if (isCorrect) {
      earnedPoints += question.points || 1
    }
  })

  const percentage = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0

  return {
    score: earnedPoints,
    totalPoints,
    percentage,
    passed: false,
    passingScore: 0,
  }
}

export const POST = withAuth(async (request, user) => {
  try {
    const body = await request.json()
    const { quizId, enrollmentId, answers, startedAt, completedAt } = body

    if (!quizId || !enrollmentId || !answers) {
      return NextResponse.json(
        { success: false, error: 'quizId, enrollmentId, and answers are required' },
        { status: 400 }
      )
    }

    // Get quiz with questions and settings
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        questions: {
          select: {
            id: true,
            questionType: true,
            points: true,
            correctAnswer: true,
          },
        },
        lesson: {
          select: {
            courseId: true,
          },
        },
      },
    })

    if (!quiz) {
      return NextResponse.json({ success: false, error: 'Quiz not found' }, { status: 404 })
    }

    // Verify enrollment belongs to user
    const enrollment = await prisma.enrollment.findUnique({
      where: { id: enrollmentId },
    })

    if (!enrollment || enrollment.userId !== user.userId) {
      return NextResponse.json({ success: false, error: 'Invalid enrollment' }, { status: 403 })
    }

    // Check attempts limit
    if (quiz.attemptsAllowed) {
      const previousAttempts = await prisma.quizAttempt.count({
        where: { quizId, userId: user.userId, enrollmentId },
      })

      if (previousAttempts >= quiz.attemptsAllowed) {
        return NextResponse.json(
          { success: false, error: 'Maximum attempts reached' },
          { status: 403 }
        )
      }
    }

    // Get attempt number
    const attemptNumber = await prisma.quizAttempt.count({
      where: { quizId, userId: user.userId, enrollmentId },
    }) + 1

    // Grade the quiz
    const gradeResult = gradeQuizAttempt(quiz.questions, answers)
    const passed = gradeResult.percentage >= quiz.passingScore

    // Calculate time spent
    const start = startedAt ? new Date(startedAt) : new Date()
    const end = completedAt ? new Date(completedAt) : new Date()
    const timeSpentSeconds = Math.floor((end.getTime() - start.getTime()) / 1000)

    // Create attempt
    const attempt = await prisma.quizAttempt.create({
      data: {
        userId: user.userId,
        quizId,
        enrollmentId,
        attemptNumber,
        startedAt: start,
        completedAt: end,
        scorePercentage: gradeResult.percentage,
        passed,
        answers,
        timeSpentSeconds,
      },
    })

    // Trigger notification based on quiz result
    const attemptsLeft = quiz.attemptsAllowed ? quiz.attemptsAllowed - attemptNumber : 999
    if (passed) {
      await NotificationTriggers.onQuizPass(
        user.userId,
        quiz.title,
        gradeResult.percentage,
        quiz.lesson.courseId
      )
    } else {
      await NotificationTriggers.onQuizFail(
        user.userId,
        quiz.title,
        gradeResult.percentage,
        attemptsLeft,
        quiz.lesson.courseId
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        ...attempt,
        gradeResult: {
          ...gradeResult,
          passed,
          passingScore: quiz.passingScore,
        },
      },
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating quiz attempt:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to submit quiz' },
      { status: 500 }
    )
  }
})
