/**
 * Quiz Attempts API Routes
 * POST /api/quizzes/[id]/attempts - Start a new quiz attempt
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/utils/prisma'
import { withAuth } from '@/lib/auth/api-auth'

/**
 * POST /api/quizzes/[id]/attempts
 * Start a new quiz attempt
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return withAuth(async (req, user) => {
    try {
      const params = await context.params
      const { id: quizId } = params

      // Verify quiz exists
      const quiz = await prisma.quiz.findUnique({
        where: { id: quizId },
        include: {
          lesson: {
            select: {
              courseId: true,
            },
          },
        },
      })

      if (!quiz) {
        return NextResponse.json(
          {
            success: false,
            error: 'Not Found',
            message: 'Quiz not found',
          },
          { status: 404 }
        )
      }

      // Check enrollment
      const enrollment = await prisma.enrollment.findFirst({
        where: {
          userId: String(user.userId),
          courseId: quiz.lesson.courseId,
        },
      })

      if (!enrollment) {
        return NextResponse.json(
          {
            success: false,
            error: 'Forbidden',
            message: 'You must be enrolled in the course to take this quiz',
          },
          { status: 403 }
        )
      }

      // Check if there's an in-progress attempt
      const inProgressAttempt = await prisma.quizAttempt.findFirst({
        where: {
          quizId,
          userId: String(user.userId),
          completedAt: null,
        },
      })

      if (inProgressAttempt) {
        return NextResponse.json({
          success: true,
          data: inProgressAttempt,
          message: 'Resuming existing attempt',
        })
      }

      // Get previous attempts count
      const previousAttempts = await prisma.quizAttempt.count({
        where: {
          quizId,
          userId: String(user.userId),
        },
      })

      // Create new attempt
      const attempt = await prisma.quizAttempt.create({
        data: {
          quizId,
          userId: String(user.userId),
          enrollmentId: enrollment.id,
          attemptNumber: previousAttempts + 1,
          startedAt: new Date(),
          answers: {},
          timeSpentSeconds: 0,
        },
      })

      return NextResponse.json(
        {
          success: true,
          data: attempt,
          message: 'Quiz attempt started',
        },
        { status: 201 }
      )
    } catch (error) {
      console.error('Error starting quiz attempt:', error)
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to start quiz attempt',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
        { status: 500 }
      )
    }
  })(request, context)
}
