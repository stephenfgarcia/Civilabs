/**
 * Individual Lesson API Routes
 * GET /api/lessons/[id] - Get lesson by ID
 * PUT /api/lessons/[id] - Update lesson (instructor/admin only)
 * DELETE /api/lessons/[id] - Delete lesson (instructor/admin only)
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/utils/prisma'
import { withAuth, withInstructor } from '@/lib/auth/api-auth'

/**
 * GET /api/lessons/[id]
 * Get lesson by ID
 */
export const GET = withAuth(async (request, user, { params }: { params: { id: string } }) => {
  try {
    const { id } = params

    const lesson = await prisma.lesson.findUnique({
      where: { id },
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
            description: true,
            passingScore: true,
            timeLimitMinutes: true,
            attemptsAllowed: true,
            randomizeQuestions: true,
            showCorrectAnswers: true,
            showResultsImmediately: true,
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

    // Check access permissions for non-admin users
    const isAdmin = user.role === 'ADMIN' || user.role === 'SUPER_ADMIN'
    const isInstructor = lesson.course.instructorId === user.userId

    // For now, allow all authenticated users to view lessons
    // In the future, you might want to check enrollment status

    return NextResponse.json({
      success: true,
      data: lesson,
    })
  } catch (error) {
    console.error('Error fetching lesson:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch lesson',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
})

/**
 * PUT /api/lessons/[id]
 * Update lesson (instructor/admin only)
 */
export const PUT = withInstructor(async (request, user, { params }: { params: { id: string } }) => {
  try {
    const { id } = params
    const body = await request.json()
    const {
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

    // Get existing lesson
    const existingLesson = await prisma.lesson.findUnique({
      where: { id },
      include: {
        course: {
          select: {
            instructorId: true,
          },
        },
      },
    })

    if (!existingLesson) {
      return NextResponse.json(
        {
          success: false,
          error: 'Not Found',
          message: 'Lesson not found',
        },
        { status: 404 }
      )
    }

    // Check if user is the course instructor or admin
    const isAdmin = user.role === 'ADMIN' || user.role === 'SUPER_ADMIN'
    const isInstructor = existingLesson.course.instructorId === user.userId

    if (!isAdmin && !isInstructor) {
      return NextResponse.json(
        {
          success: false,
          error: 'Forbidden',
          message: 'You do not have permission to update this lesson',
        },
        { status: 403 }
      )
    }

    // Update lesson
    const lesson = await prisma.lesson.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(contentType !== undefined && { contentType }),
        ...(contentUrl !== undefined && { contentUrl }),
        ...(contentData !== undefined && { contentData }),
        ...(durationMinutes !== undefined && { durationMinutes }),
        ...(order !== undefined && { order }),
        ...(isRequired !== undefined && { isRequired }),
        ...(allowDownload !== undefined && { allowDownload }),
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
        quiz: {
          select: {
            id: true,
            title: true,
            passingScore: true,
            _count: {
              select: {
                questions: true,
              },
            },
          },
        },
      },
    })

    return NextResponse.json({
      success: true,
      data: lesson,
      message: 'Lesson updated successfully',
    })
  } catch (error) {
    console.error('Error updating lesson:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update lesson',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
})

/**
 * DELETE /api/lessons/[id]
 * Delete lesson (instructor/admin only)
 */
export const DELETE = withInstructor(async (request, user, { params }: { params: { id: string } }) => {
  try {
    const { id } = params

    // Get existing lesson
    const existingLesson = await prisma.lesson.findUnique({
      where: { id },
      include: {
        course: {
          select: {
            instructorId: true,
          },
        },
      },
    })

    if (!existingLesson) {
      return NextResponse.json(
        {
          success: false,
          error: 'Not Found',
          message: 'Lesson not found',
        },
        { status: 404 }
      )
    }

    // Check if user is the course instructor or admin
    const isAdmin = user.role === 'ADMIN' || user.role === 'SUPER_ADMIN'
    const isInstructor = existingLesson.course.instructorId === user.userId

    if (!isAdmin && !isInstructor) {
      return NextResponse.json(
        {
          success: false,
          error: 'Forbidden',
          message: 'You do not have permission to delete this lesson',
        },
        { status: 403 }
      )
    }

    // Delete lesson (cascade will handle related records)
    await prisma.lesson.delete({
      where: { id },
    })

    return NextResponse.json({
      success: true,
      message: 'Lesson deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting lesson:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete lesson',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
})
