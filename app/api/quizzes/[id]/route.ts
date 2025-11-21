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

    const isAdmin = user.role === 'ADMIN' || user.role === 'SUPER_ADMIN'
    const isInstructor = quiz.lesson.course.instructorId === user.userId

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
