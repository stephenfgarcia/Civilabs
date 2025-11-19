/**
 * Bulk Lesson Operations API
 * POST /api/lessons/bulk - Create or update multiple lessons
 * PUT /api/lessons/bulk - Reorder lessons
 * DELETE /api/lessons/bulk - Delete multiple lessons
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/utils/prisma'
import { withInstructor } from '@/lib/auth/api-auth'

/**
 * POST /api/lessons/bulk
 * Create multiple lessons at once
 */
export const POST = withInstructor(async (request, user) => {
  try {
    const body = await request.json()
    const { lessons } = body

    if (!Array.isArray(lessons) || lessons.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Bad Request',
          message: 'lessons array is required',
        },
        { status: 400 }
      )
    }

    // Verify all lessons belong to courses the user can modify
    const courseIds = [...new Set(lessons.map(l => l.courseId))]
    const courses = await prisma.course.findMany({
      where: { id: { in: courseIds } },
      select: { id: true, instructorId: true },
    })

    const isAdmin = user.role === 'ADMIN' || user.role === 'SUPER_ADMIN'

    // Check permissions for each course
    for (const course of courses) {
      if (!isAdmin && course.instructorId !== user.userId) {
        return NextResponse.json(
          {
            success: false,
            error: 'Forbidden',
            message: `You do not have permission to create lessons for course ${course.id}`,
          },
          { status: 403 }
        )
      }
    }

    // Create lessons
    const createdLessons = await Promise.all(
      lessons.map(async (lessonData, index) => {
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
        } = lessonData

        // Auto-increment order if not provided
        let lessonOrder = order
        if (lessonOrder === undefined || lessonOrder === null) {
          const lastLesson = await prisma.lesson.findFirst({
            where: { courseId },
            orderBy: { order: 'desc' },
          })
          lessonOrder = lastLesson ? lastLesson.order + 1 + index : index + 1
        }

        return prisma.lesson.create({
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
        })
      })
    )

    return NextResponse.json(
      {
        success: true,
        data: createdLessons,
        message: `${createdLessons.length} lessons created successfully`,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating bulk lessons:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create lessons',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
})

/**
 * PUT /api/lessons/bulk
 * Reorder lessons in a course
 */
export const PUT = withInstructor(async (request, user) => {
  try {
    const body = await request.json()
    const { courseId, lessonIds } = body

    if (!courseId || !Array.isArray(lessonIds) || lessonIds.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Bad Request',
          message: 'courseId and lessonIds array are required',
        },
        { status: 400 }
      )
    }

    // Verify course exists and user has permission
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

    const isAdmin = user.role === 'ADMIN' || user.role === 'SUPER_ADMIN'
    const isInstructor = course.instructorId === user.userId

    if (!isAdmin && !isInstructor) {
      return NextResponse.json(
        {
          success: false,
          error: 'Forbidden',
          message: 'You do not have permission to reorder lessons for this course',
        },
        { status: 403 }
      )
    }

    // Update lesson orders
    await Promise.all(
      lessonIds.map((lessonId, index) =>
        prisma.lesson.update({
          where: { id: lessonId },
          data: { order: index + 1 },
        })
      )
    )

    return NextResponse.json({
      success: true,
      message: 'Lessons reordered successfully',
    })
  } catch (error) {
    console.error('Error reordering lessons:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to reorder lessons',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
})

/**
 * DELETE /api/lessons/bulk
 * Delete multiple lessons
 */
export const DELETE = withInstructor(async (request, user) => {
  try {
    const body = await request.json()
    const { lessonIds } = body

    if (!Array.isArray(lessonIds) || lessonIds.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Bad Request',
          message: 'lessonIds array is required',
        },
        { status: 400 }
      )
    }

    // Get lessons to verify permissions
    const lessons = await prisma.lesson.findMany({
      where: { id: { in: lessonIds } },
      include: {
        course: {
          select: { instructorId: true },
        },
      },
    })

    const isAdmin = user.role === 'ADMIN' || user.role === 'SUPER_ADMIN'

    // Check permissions for each lesson
    for (const lesson of lessons) {
      if (!isAdmin && lesson.course.instructorId !== user.userId) {
        return NextResponse.json(
          {
            success: false,
            error: 'Forbidden',
            message: `You do not have permission to delete lesson ${lesson.id}`,
          },
          { status: 403 }
        )
      }
    }

    // Delete lessons
    await prisma.lesson.deleteMany({
      where: { id: { in: lessonIds } },
    })

    return NextResponse.json({
      success: true,
      message: `${lessons.length} lessons deleted successfully`,
    })
  } catch (error) {
    console.error('Error deleting bulk lessons:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete lessons',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
})
