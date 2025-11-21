/**
 * Quiz API Routes
 * GET /api/courses/[id]/lessons/[lessonId]/quiz - Get quiz with questions
 * POST /api/courses/[id]/lessons/[lessonId]/quiz/submit - Submit quiz answers
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/utils/prisma'
import { withAuth } from '@/lib/auth/api-auth'

/**
 * GET /api/courses/[id]/lessons/[lessonId]/quiz
 * Get quiz details with questions for a lesson
 */
export const GET = withAuth(async (request, user, context?: { params: Promise<{ id: string; lessonId: string }> }) => {
  try {
    const params = await context!.params
    const { id: courseId, lessonId } = params

    // Check if user is enrolled in the course
    const enrollment = await prisma.enrollment.findFirst({
      where: {
        userId: String(user.userId),
        courseId,
      },
    })

    if (!enrollment) {
      return NextResponse.json(
        {
          success: false,
          error: 'Forbidden',
          message: 'You must be enrolled in this course to view quizzes',
        },
        { status: 403 }
      )
    }

    // Get the lesson with its quiz
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        quiz: {
          include: {
            questions: {
              orderBy: {
                order: 'asc',
              },
              select: {
                id: true,
                questionText: true,
                questionType: true,
                options: true,
                order: true,
                points: true,
                // Don't send correctAnswer or explanation until after submission
              },
            },
          },
        },
      },
    })

    if (!lesson || lesson.courseId !== courseId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Not Found',
          message: 'Lesson or quiz not found',
        },
        { status: 404 }
      )
    }

    if (!lesson.quiz) {
      return NextResponse.json(
        {
          success: false,
          error: 'Not Found',
          message: 'This lesson does not have a quiz',
        },
        { status: 404 }
      )
    }

    // Get previous attempts
    const attempts = await prisma.quizAttempt.findMany({
      where: {
        quizId: lesson.quiz.id,
        userId: String(user.userId),
      },
      orderBy: {
        startedAt: 'desc',
      },
    })

    // Check if user has attempts remaining
    const attemptsRemaining = lesson.quiz.attemptsAllowed
      ? lesson.quiz.attemptsAllowed - attempts.length
      : null

    // Get best attempt
    const bestAttempt = attempts.length > 0
      ? attempts.reduce((best, current) =>
          (current.scorePercentage ?? 0) > (best.scorePercentage ?? 0) ? current : best
        )
      : null

    return NextResponse.json({
      success: true,
      data: {
        quiz: lesson.quiz,
        attempts: attempts.length,
        attemptsRemaining,
        bestScore: bestAttempt?.scorePercentage || null,
        passed: bestAttempt ? (bestAttempt.scorePercentage ?? 0) >= lesson.quiz.passingScore : false,
      },
    })
  } catch (error) {
    console.error('Error fetching quiz:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch quiz',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
})

/**
 * POST /api/courses/[id]/lessons/[lessonId]/quiz/submit
 * Submit quiz answers and get score
 */
export const POST = withAuth(async (request, user, context?: { params: Promise<{ id: string; lessonId: string }> }) => {
  try {
    const params = await context!.params
    const { id: courseId, lessonId } = params
    const body = await request.json()
    const { answers, timeSpentSeconds } = body

    // Validate input
    if (!answers || typeof answers !== 'object') {
      return NextResponse.json(
        {
          success: false,
          error: 'Bad Request',
          message: 'Invalid answers format',
        },
        { status: 400 }
      )
    }

    // Check if user is enrolled
    const enrollment = await prisma.enrollment.findFirst({
      where: {
        userId: String(user.userId),
        courseId,
      },
    })

    if (!enrollment) {
      return NextResponse.json(
        {
          success: false,
          error: 'Forbidden',
          message: 'You must be enrolled in this course',
        },
        { status: 403 }
      )
    }

    // Get the lesson with its quiz and questions
    const lesson = await prisma.lesson.findFirst({
      where: {
        id: lessonId,
        courseId,
      },
      include: {
        quiz: {
          include: {
            questions: {
              orderBy: {
                order: 'asc',
              },
            },
          },
        },
      },
    })

    if (!lesson || !lesson.quiz) {
      return NextResponse.json(
        {
          success: false,
          error: 'Not Found',
          message: 'Quiz not found',
        },
        { status: 404 }
      )
    }

    // Check attempts remaining
    const previousAttempts = await prisma.quizAttempt.count({
      where: {
        quizId: lesson.quiz.id,
        userId: String(user.userId),
      },
    })

    if (
      lesson.quiz.attemptsAllowed &&
      previousAttempts >= lesson.quiz.attemptsAllowed
    ) {
      return NextResponse.json(
        {
          success: false,
          error: 'Forbidden',
          message: 'No attempts remaining for this quiz',
        },
        { status: 403 }
      )
    }

    // Grade the quiz
    let totalPoints = 0
    let earnedPoints = 0
    const results: any[] = []

    for (const question of lesson.quiz.questions) {
      totalPoints += question.points
      const userAnswer = answers[question.id]

      let isCorrect = false

      if (question.questionType === 'MULTIPLE_CHOICE') {
        // Find the correct option
        const correctOption = (question.options as any[]).find(
          (opt: any) => opt.isCorrect
        )
        isCorrect = userAnswer === correctOption?.id
      } else if (question.questionType === 'TRUE_FALSE') {
        isCorrect = userAnswer === question.correctAnswer
      } else if (question.questionType === 'SHORT_ANSWER') {
        // Case-insensitive comparison, trim whitespace
        isCorrect =
          userAnswer?.toLowerCase().trim() ===
          question.correctAnswer?.toLowerCase().trim()
      }

      if (isCorrect) {
        earnedPoints += question.points
      }

      results.push({
        questionId: question.id,
        questionText: question.questionText,
        userAnswer,
        correctAnswer:
          question.questionType === 'MULTIPLE_CHOICE'
            ? (question.options as any[]).find((opt: any) => opt.isCorrect)?.id
            : question.correctAnswer,
        isCorrect,
        points: question.points,
        earnedPoints: isCorrect ? question.points : 0,
        explanation: question.explanation,
      })
    }

    const score = Math.round((earnedPoints / totalPoints) * 100)
    const passed = score >= lesson.quiz.passingScore

    // Create quiz attempt
    const attempt = await prisma.quizAttempt.create({
      data: {
        quizId: lesson.quiz.id,
        userId: String(user.userId),
        enrollmentId: enrollment.id,
        attemptNumber: previousAttempts + 1,
        scorePercentage: score,
        passed,
        answers,
        timeSpentSeconds: timeSpentSeconds || 0,
        startedAt: new Date(),
      },
    })

    // If passed, mark lesson as completed
    if (passed) {
      await prisma.lessonProgress.upsert({
        where: {
          enrollmentId_lessonId: {
            enrollmentId: enrollment.id,
            lessonId,
          },
        },
        create: {
          enrollmentId: enrollment.id,
          lessonId,
          userId: String(user.userId),
          status: 'COMPLETED',
          timeSpentSeconds: timeSpentSeconds || 0,
          completedAt: new Date(),
        },
        update: {
          status: 'COMPLETED',
          completedAt: new Date(),
        },
      })

      // Update enrollment progress
      const totalLessons = await prisma.lesson.count({
        where: { courseId },
      })

      const completedLessons = await prisma.lessonProgress.count({
        where: {
          enrollmentId: enrollment.id,
          status: 'COMPLETED',
        },
      })

      const progressPercentage = Math.round((completedLessons / totalLessons) * 100)

      await prisma.enrollment.update({
        where: { id: enrollment.id },
        data: {
          progressPercentage,
          ...(progressPercentage === 100 && {
            completedAt: new Date(),
            status: 'COMPLETED',
          }),
        },
      })
    }

    return NextResponse.json({
      success: true,
      data: {
        attemptId: attempt.id,
        score,
        passed,
        earnedPoints,
        totalPoints,
        passingScore: lesson.quiz.passingScore,
        results,
        attemptsRemaining: lesson.quiz.attemptsAllowed
          ? lesson.quiz.attemptsAllowed - (previousAttempts + 1)
          : null,
      },
      message: passed
        ? 'Congratulations! You passed the quiz!'
        : `You scored ${score}%. Keep trying!`,
    })
  } catch (error) {
    console.error('Error submitting quiz:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to submit quiz',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
})
