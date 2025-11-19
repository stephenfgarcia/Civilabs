/**
 * Lessons API Routes
 * GET /api/lessons - List lessons (filter by courseId)
 * POST /api/lessons - Create lesson (instructor/admin only)
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/utils/prisma'
import { withAuth, withInstructor } from '@/lib/auth/api-auth'

/**
 * GET /api/lessons
 * Get lessons for a specific course or all lessons (admin only)
 */
export const GET = withAuth(async (request, user) => {
  try {
    const { searchParams } = new URL(request.url)
    const courseId = searchParams.get('courseId')

    // Course ID is required for non-admin users
    const isAdmin = user.role === 'ADMIN' || user.role === 'SUPER_ADMIN'

    if (!courseId && !isAdmin) {
      return NextResponse.json(
        {
          success: false,
          error: 'Bad Request',
          message: 'courseId is required',
        },
        { status: 400 }
      )
    }

    // Build where clause
    const where: any = {}

    if (courseId) {
      where.courseId = courseId
    }

    // If user is an instructor (not admin), only show lessons for their courses
    if (user.role === 'INSTRUCTOR' && !isAdmin) {
      where.course = {
        instructorId: user.userId
      }
    }

    const lessons = await prisma.lesson.findMany({
      where,
      include: {
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
        quiz: {
          select: {
            id: true,
            title: true,
            passingScore: true,
            timeLimitMinutes: true,
            attemptsAllowed: true,
            _count: {
              select: {
                questions: true,
              },
            },
          },
        },
        _count: {
          select: {
            progress: true,
          },
        },
      },
      orderBy: [
        { courseId: 'asc' },
        { order: 'asc' },
      ],
    })

    return NextResponse.json({
      success: true,
      data: lessons,
      count: lessons.length,
    })
  } catch (error) {
    console.error('Error fetching lessons:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch lessons',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
})

/**
 * POST /api/lessons
 * Create a new lesson (instructor/admin only)
 */
export const POST = withInstructor(async (request, user) => {
  try {
    const body = await request.json()
    const {
      courseId,
      title,
      description,
      contentType,
      contentUrl,
      contentData,
      durationMinutes,
      order,
      isRequired,
      allowDownload,
    } = body

    // Validate required fields
    if (!courseId || !title || !contentType) {
      return NextResponse.json(
        {
          success: false,
          error: 'Bad Request',
          message: 'courseId, title, and contentType are required',
        },
        { status: 400 }
      )
    }

    // Verify course exists
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    })

    if (!course) {
      return NextResponse.json(
        {
          success: false,
          error: 'Not Found',
          message: 'Course not found',
        },
        { status: 404 }
      )
    }

    // Check if user is the course instructor or admin
    const isAdmin = user.role === 'ADMIN' || user.role === 'SUPER_ADMIN'
    const isInstructor = course.instructorId === user.userId

    if (!isAdmin && !isInstructor) {
      return NextResponse.json(
        {
          success: false,
          error: 'Forbidden',
          message: 'You do not have permission to create lessons for this course',
        },
        { status: 403 }
      )
    }

    // Get the next order number if not provided
    let lessonOrder = order
    if (lessonOrder === undefined || lessonOrder === null) {
      const lastLesson = await prisma.lesson.findFirst({
        where: { courseId },
        orderBy: { order: 'desc' },
      })
      lessonOrder = lastLesson ? lastLesson.order + 1 : 1
    }

    // Create lesson
    const lesson = await prisma.lesson.create({
      data: {
        courseId,
        title,
        description,
        contentType,
        contentUrl,
        contentData,
        durationMinutes,
        order: lessonOrder,
        isRequired: isRequired ?? true,
        allowDownload: allowDownload ?? false,
      },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            slug: true,
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
    })

    return NextResponse.json(
      {
        success: true,
        data: lesson,
        message: 'Lesson created successfully',
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating lesson:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create lesson',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
})
