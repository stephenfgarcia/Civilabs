/**
 * Individual Quiz API Routes
 * GET /api/quizzes/[id] - Get quiz by ID (with questions for instructors/admins)
 * PUT /api/quizzes/[id] - Update quiz (instructor/admin only)
 * DELETE /api/quizzes/[id] - Delete quiz (instructor/admin only)
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/utils/prisma'
import { withAuth, withInstructor } from '@/lib/auth/api-auth'

/**
 * GET /api/quizzes/[id]
 * Get quiz by ID
 */
export const GET = withAuth(async (request, user, context?: { params: Promise<{ id: string }> }) => {
  try {
    const params = await context!.params
    const { id } = params
    const { searchParams } = new URL(request.url)
    const includeAnswers = searchParams.get('includeAnswers') === 'true'

    // SECURITY FIX: First, get quiz metadata to check authorization BEFORE fetching sensitive data
    const quizMetadata = await prisma.quiz.findUnique({
      where: { id },
      select: {
        id: true,
        lesson: {
          select: {
            courseId: true,
            course: {
              select: {
                instructorId: true,
              },
            },
          },
        },
      },
    })

    if (!quizMetadata) {
      return NextResponse.json(
        {
          success: false,
          error: 'Not Found',
          message: 'Quiz not found',
        },
        { status: 404 }
      )
    }

    const isAdmin = user.role === 'ADMIN' || user.role === 'SUPER_ADMIN'
    const isInstructor = quizMetadata.lesson.course.instructorId === user.userId

    // SECURITY FIX: Check authorization for answers BEFORE querying them
    if (includeAnswers && !isAdmin && !isInstructor) {
      return NextResponse.json(
        {
          success: false,
          error: 'Forbidden',
          message: 'You do not have permission to view quiz answers',
        },
        { status: 403 }
      )
    }

    // SECURITY FIX: Check enrollment for non-admin/non-instructor users
    if (!isAdmin && !isInstructor) {
      const enrollment = await prisma.enrollment.findFirst({
        where: {
          userId: String(user.userId),
          courseId: quizMetadata.lesson.courseId,
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
    }

    // NOW safe to query with correct answers (only if authorized)
    const quiz = await prisma.quiz.findUnique({
      where: { id },
      include: {
        lesson: {
          select: {
            id: true,
            title: true,
            courseId: true,
            course: {
              select: {
                id: true,
                title: true,
                slug: true,
                instructorId: true,
                instructor: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                  },
                },
              },
            },
          },
        },
        questions: {
          orderBy: {
            order: 'asc',
          },
          select: {
            id: true,
            questionText: true,
            questionType: true,
            points: true,
            order: true,
            options: true,
            // Only include answers if authorized (admin/instructor with includeAnswers=true)
            correctAnswer: includeAnswers,
            explanation: includeAnswers,
          },
        },
        _count: {
          select: {
            attempts: true,
          },
        },
      },
    })

    return NextResponse.json({
      success: true,
      data: quiz,
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

export const PUT = withInstructor(async (request, user, context?: { params: Promise<{ id: string }> }) => {
  const params = await context!.params
  try {
    const { id } = params
    const body = await request.json()

    const existingQuiz = await prisma.quiz.findUnique({
      where: { id },
      include: {
        lesson: { select: { course: { select: { instructorId: true } } } },
      },
    })

    if (!existingQuiz) {
      return NextResponse.json({ success: false, error: 'Not Found' }, { status: 404 })
    }

    const isAdmin = user.role === 'ADMIN' || user.role === 'SUPER_ADMIN'
    if (!isAdmin && existingQuiz.lesson.course.instructorId !== user.userId) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }

    const quiz = await prisma.quiz.update({
      where: { id },
      data: body,
      include: { lesson: true, _count: { select: { questions: true } } },
    })

    return NextResponse.json({ success: true, data: quiz })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to update quiz' }, { status: 500 })
  }
})

export const DELETE = withInstructor(async (request, user, context?: { params: Promise<{ id: string }> }) => {
  const params = await context!.params
  try {
    const { id } = params

    const existingQuiz = await prisma.quiz.findUnique({
      where: { id },
      include: { lesson: { select: { course: { select: { instructorId: true } } } } },
    })

    if (!existingQuiz) {
      return NextResponse.json({ success: false, error: 'Not Found' }, { status: 404 })
    }

    const isAdmin = user.role === 'ADMIN' || user.role === 'SUPER_ADMIN'
    if (!isAdmin && existingQuiz.lesson.course.instructorId !== user.userId) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }

    await prisma.quiz.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to delete quiz' }, { status: 500 })
  }
})
