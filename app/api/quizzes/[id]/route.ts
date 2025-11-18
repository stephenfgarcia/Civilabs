/**
 * Quiz API Routes
 * GET /api/quizzes/[id] - Get quiz details with questions
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/utils/prisma'
import { withAuth } from '@/lib/auth/api-auth'

interface RouteParams {
  params: { id: string }
}

/**
 * GET /api/quizzes/[id]
 * Get quiz with questions (without correct answers for learners)
 */
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  return withAuth(async (req, user) => {
    try {
      const { id } = params

      const quiz = await prisma.quiz.findUnique({
        where: { id },
        include: {
          questions: {
            select: {
              id: true,
              question: true,
              type: true,
              options: true,
              // Don't include correctAnswer for learners
              points: true,
              order: true,
            },
            orderBy: {
              order: 'asc',
            },
          },
          module: {
            select: {
              id: true,
              title: true,
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

      // Check if user is enrolled in the course
      const enrollment = await prisma.enrollment.findFirst({
        where: {
          userId: user.userId,
          courseId: quiz.module.courseId,
        },
      })

      if (!enrollment && user.role === 'learner') {
        return NextResponse.json(
          {
            success: false,
            error: 'Forbidden',
            message: 'You must be enrolled in the course to access this quiz',
          },
          { status: 403 }
        )
      }

      // Get user's attempts
      const attempts = await prisma.quizAttempt.findMany({
        where: {
          quizId: id,
          userId: user.userId,
        },
        orderBy: {
          startedAt: 'desc',
        },
        take: 5,
      })

      return NextResponse.json({
        success: true,
        data: {
          quiz,
          attempts,
          attemptsCount: attempts.length,
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
  })(request, { params })
}
