/**
 * Quizzes API Routes
 * GET /api/quizzes - List quizzes
 * POST /api/quizzes - Create quiz (instructor/admin only)
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/utils/prisma'
import { withAuth, withInstructor } from '@/lib/auth/api-auth'

/**
 * GET /api/quizzes
 * Get quizzes (optionally filtered by lessonId or courseId)
 */
export const GET = withAuth(async (request, user) => {
  try {
    const { searchParams } = new URL(request.url)
    const lessonId = searchParams.get('lessonId')
    const courseId = searchParams.get('courseId')

    const isAdmin = user.role === 'ADMIN' || user.role === 'SUPER_ADMIN'

    // Build where clause
    const where: any = {}

    if (lessonId) {
      where.lessonId = lessonId
    } else if (courseId) {
      where.lesson = { courseId }
    }

    // If instructor (not admin), only show quizzes for their courses
    if (user.role === 'INSTRUCTOR' && !isAdmin) {
      where.lesson = {
        ...where.lesson,
        course: { instructorId: user.userId },
      }
    }

    const quizzes = await prisma.quiz.findMany({
      where,
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
        _count: {
          select: {
            questions: true,
            attempts: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json({
      success: true,
      data: quizzes,
      count: quizzes.length,
    })
  } catch (error) {
    console.error('Error fetching quizzes:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch quizzes',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
})

/**
 * POST /api/quizzes
 * Create a new quiz (instructor/admin only)
 */
export const POST = withInstructor(async (request, user) => {
  try {
    const body = await request.json()
    const {
      lessonId,
      title,
      description,
      passingScore,
      timeLimitMinutes,
      attemptsAllowed,
      randomizeQuestions,
      showCorrectAnswers,
      showResultsImmediately,
    } = body

    // Validate required fields
    if (!lessonId || !title) {
      return NextResponse.json(
        {
          success: false,
          error: 'Bad Request',
          message: 'lessonId and title are required',
        },
        { status: 400 }
      )
    }

    // Verify lesson exists
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        course: {
          select: {
            instructorId: true,
          },
        },
        quiz: true,
      },
    })

    if (!lesson) {
      return NextResponse.json(
        {
          success: false,
          error: 'Not Found',
          message: 'Lesson not found',
        },
        { status: 404 }
      )
    }

    // Check if lesson already has a quiz
    if (lesson.quiz) {
      return NextResponse.json(
        {
          success: false,
          error: 'Conflict',
          message: 'Lesson already has a quiz',
        },
        { status: 409 }
      )
    }

    // Check if user is the course instructor or admin
    const isAdmin = user.role === 'ADMIN' || user.role === 'SUPER_ADMIN'
    const isInstructor = lesson.course.instructorId === user.userId

    if (!isAdmin && !isInstructor) {
      return NextResponse.json(
        {
          success: false,
          error: 'Forbidden',
          message: 'You do not have permission to create quizzes for this lesson',
        },
        { status: 403 }
      )
    }

    // Create quiz
    const quiz = await prisma.quiz.create({
      data: {
        lessonId,
        title,
        description,
        passingScore: passingScore ?? 70,
        timeLimitMinutes,
        attemptsAllowed,
        randomizeQuestions: randomizeQuestions ?? false,
        showCorrectAnswers: showCorrectAnswers ?? true,
        showResultsImmediately: showResultsImmediately ?? true,
      },
      include: {
        lesson: {
          select: {
            id: true,
            title: true,
            course: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
        _count: {
          select: {
            questions: true,
          },
        },
      },
    })

    return NextResponse.json(
      {
        success: true,
        data: quiz,
        message: 'Quiz created successfully',
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating quiz:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create quiz',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
})
