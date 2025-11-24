/**
 * Quiz API Routes
 * GET /api/courses/[id]/lessons/[lessonId]/quiz - Get quiz with questions
 * POST /api/courses/[id]/lessons/[lessonId]/quiz - Submit quiz answers
 *
 * ⚠️ DEPRECATION WARNING:
 * The POST endpoint is deprecated. Please use the canonical endpoints instead:
 * - POST /api/quizzes/[quizId]/attempts - Start a quiz attempt
 * - POST /api/quizzes/[quizId]/submit - Submit quiz answers
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/utils/prisma'
import { withAuth } from '@/lib/auth/api-auth'
import { gradeQuizSubmission, convertAnswersToArray } from '@/lib/utils/quiz-grading'

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

    // SECURITY FIX: Validate time limit (server-side enforcement)
    // Note: This endpoint doesn't track quiz start time separately, so we can't validate time limit accurately
    // This is why we need to consolidate to the proper attempt-based flow
    // For now, we'll add a warning comment
    // TODO: Migrate to use /api/quizzes/[id]/attempts and /api/quizzes/[id]/submit for proper time tracking

    // Grade the quiz using shared utility function for consistency
    const submissionAnswers = convertAnswersToArray(answers)
    const gradeResult = gradeQuizSubmission(
      lesson.quiz.questions,
      submissionAnswers,
      lesson.quiz.passingScore
    )

    // Create quiz attempt
    const attempt = await prisma.quizAttempt.create({
      data: {
        quizId: lesson.quiz.id,
        userId: String(user.userId),
        enrollmentId: enrollment.id,
        attemptNumber: previousAttempts + 1,
        scorePercentage: gradeResult.score,
        passed: gradeResult.passed,
        answers,
        timeSpentSeconds: timeSpentSeconds || 0,
        startedAt: new Date(),
        completedAt: new Date(), // Mark as completed immediately
      },
    })

    // If passed, mark lesson as completed
    if (gradeResult.passed) {
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
        score: gradeResult.score,
        passed: gradeResult.passed,
        earnedPoints: gradeResult.earnedPoints,
        totalPoints: gradeResult.totalPoints,
        passingScore: lesson.quiz.passingScore,
        results: gradeResult.detailedResults,
        attemptsRemaining: lesson.quiz.attemptsAllowed
          ? lesson.quiz.attemptsAllowed - (previousAttempts + 1)
          : null,
      },
      message: gradeResult.passed
        ? 'Congratulations! You passed the quiz!'
        : `You scored ${gradeResult.score}%. Keep trying!`,
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
