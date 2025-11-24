/**
 * Quiz Submission API Routes
 * POST /api/quizzes/[id]/submit - Submit quiz answers and get results
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/utils/prisma'
import { withAuth } from '@/lib/auth/api-auth'
import { gradeQuizSubmission, type SubmissionAnswer } from '@/lib/utils/quiz-grading'

interface SubmissionBody {
  attemptId: string
  answers: SubmissionAnswer[]
}

/**
 * POST /api/quizzes/[id]/submit
 * Submit quiz answers and calculate results
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return withAuth(async (req, user) => {
    try {
      const params = await context.params
      const { id: quizId } = params
      const body: SubmissionBody = await request.json()
      const { attemptId, answers } = body

      // Validate request body
      if (!attemptId || !answers || !Array.isArray(answers)) {
        return NextResponse.json(
          {
            success: false,
            error: 'Bad Request',
            message: 'attemptId and answers array are required',
          },
          { status: 400 }
        )
      }

      // Verify quiz attempt exists and belongs to user
      const attempt = await prisma.quizAttempt.findUnique({
        where: { id: attemptId },
        include: {
          quiz: {
            include: {
              questions: true,
              lesson: {
                select: {
                  courseId: true,
                },
              },
            },
          },
        },
      })

      if (!attempt) {
        return NextResponse.json(
          {
            success: false,
            error: 'Not Found',
            message: 'Quiz attempt not found',
          },
          { status: 404 }
        )
      }

      if (attempt.userId !== user.userId) {
        return NextResponse.json(
          {
            success: false,
            error: 'Forbidden',
            message: 'This attempt does not belong to you',
          },
          { status: 403 }
        )
      }

      if (attempt.quizId !== quizId) {
        return NextResponse.json(
          {
            success: false,
            error: 'Bad Request',
            message: 'Attempt ID does not match quiz ID',
          },
          { status: 400 }
        )
      }

      if (attempt.completedAt) {
        return NextResponse.json(
          {
            success: false,
            error: 'Conflict',
            message: 'This attempt has already been submitted',
          },
          { status: 409 }
        )
      }

      // SECURITY FIX: Check if time limit was exceeded (server-side validation)
      if (attempt.quiz.timeLimitMinutes) {
        const startTime = attempt.startedAt.getTime()
        const currentTime = new Date().getTime()
        const timeElapsedMinutes = (currentTime - startTime) / (1000 * 60)

        // Add 30-second grace period for network latency
        if (timeElapsedMinutes > (attempt.quiz.timeLimitMinutes + 0.5)) {
          // Auto-submit with current answers and mark as time-exceeded
          const gradeResult = gradeQuizSubmission(
            attempt.quiz.questions,
            answers,
            attempt.quiz.passingScore
          )

          await prisma.quizAttempt.update({
            where: { id: attemptId },
            data: {
              completedAt: new Date(),
              scorePercentage: gradeResult.score,
              passed: gradeResult.passed,
              answers: answers as any,
            },
          })

          return NextResponse.json(
            {
              success: false,
              error: 'Time Limit Exceeded',
              message: `Quiz time limit (${attempt.quiz.timeLimitMinutes} minutes) was exceeded. Your quiz has been auto-submitted.`,
              data: {
                attempt: attempt,
                results: gradeResult,
              },
            },
            { status: 403 }
          )
        }
      }

      // Grade the quiz using shared utility function
      const gradeResult = gradeQuizSubmission(
        attempt.quiz.questions,
        answers,
        attempt.quiz.passingScore
      )

      // Update attempt with results
      const updatedAttempt = await prisma.quizAttempt.update({
        where: { id: attemptId },
        data: {
          completedAt: new Date(),
          scorePercentage: gradeResult.score,
          passed: gradeResult.passed,
          answers: answers as any,
        },
      })

      // Award points if passed
      if (gradeResult.passed) {
        const pointsAwarded = 50 // Base points for passing a quiz

        await prisma.userPoints.upsert({
          where: { userId: String(user.userId) },
          create: {
            userId: String(user.userId),
            points: pointsAwarded,
            level: 1,
          },
          update: {
            points: {
              increment: pointsAwarded,
            },
          },
        })

        // Create notification
        await prisma.notification.create({
          data: {
            userId: String(user.userId),
            type: 'achievement',
            title: 'Quiz Passed!',
            message: `Congratulations! You passed "${attempt.quiz.title}" with a score of ${gradeResult.score}%. You earned ${pointsAwarded} points!`,
          },
        })
      } else {
        // Create notification for failed attempt
        await prisma.notification.create({
          data: {
            userId: user.userId,
            type: 'info',
            title: 'Quiz Completed',
            message: `You completed "${attempt.quiz.title}" with a score of ${gradeResult.score}%. The passing score is ${attempt.quiz.passingScore}%. You can try again!`,
          },
        })
      }

      return NextResponse.json(
        {
          success: true,
          data: {
            attempt: updatedAttempt,
            results: gradeResult,
          },
          message: gradeResult.passed ? 'Quiz passed successfully!' : 'Quiz completed. You can try again.',
        },
        { status: 200 }
      )
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
  })(request, context)
}
